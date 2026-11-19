import { createClient } from "@supabase/supabase-js";

const preflightHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(
  body: unknown,
  status = 200,
  allowedOrigin?: string,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Vary": "Origin",
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}
async function createVisitorHash(
  chatbotId: string,
  ipAddress: string,
  secret: string,
): Promise<string> {
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${chatbotId}:${ipAddress}`),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req: Request) => {
  let allowedOrigin: string | undefined;
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: preflightHeaders,
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase environment variables are missing");
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    const contentLength = req.headers.get("content-length");

    if (contentLength && Number(contentLength) > 10_000) {
      return jsonResponse({ error: "Request too large" }, 413);
    }

    const reader = req.body?.getReader();

    if (!reader) {
      return jsonResponse({ error: "Request body is required" }, 400);
    }

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.length;

      if (totalBytes > 10_000) {
        await reader.cancel();
        return jsonResponse({ error: "Request too large" }, 413);
      }

      chunks.push(value);
    }

    const bodyBytes = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of chunks) {
      bodyBytes.set(chunk, offset);
      offset += chunk.length;
    }

    const bodyText = new TextDecoder().decode(bodyBytes);

    let body: unknown;

    try {
      body = JSON.parse(bodyText);
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400);
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return jsonResponse({ error: "Invalid request body" }, 400);
    }

    const { chatbotId, message } = body as Record<string, unknown>;

    const requestOrigin = req.headers.get("origin");

    if (!requestOrigin) {
      return jsonResponse({ error: "Request origin is required" }, 403);
    }

    if (
      typeof chatbotId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        chatbotId,
      )
    ) {
      return jsonResponse({ error: "Invalid chatbot ID" }, 400);
    }

    if (
      typeof message !== "string" ||
      message.trim().length === 0 ||
      message.length > 2000
    ) {
      return jsonResponse(
        { error: "Message must contain 1–2000 characters" },
        400,
      );
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!serviceRoleKey) {
      console.error("Service role key is missing");
      return jsonResponse({ error: "Server configuration error" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: chatbot, error } = await supabase
      .from("chatbots")
      .select("id, name, description, welcome_message, primary_color, status")
      .eq("id", chatbotId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("Chatbot lookup failed:", error.message);
      return jsonResponse({ error: "Unable to retrieve chatbot" }, 500);
    }

    if (!chatbot) {
      return jsonResponse({ error: "Chatbot not found or inactive" }, 404);
    }

    const { data: approvedOrigin, error: originError } = await adminSupabase
      .from("chatbot_allowed_origins")
      .select("origin")
      .eq("chatbot_id", chatbotId)
      .eq("origin", requestOrigin)
      .maybeSingle();

    if (originError) {
      console.error("Origin lookup failed:", originError.message);
      return jsonResponse({ error: "Unable to verify website origin" }, 500);
    }

    if (!approvedOrigin) {
      return jsonResponse({ error: "Website origin is not approved" }, 403);
    }
    allowedOrigin = requestOrigin;

    const rateLimitSecret = Deno.env.get("RATE_LIMIT_SECRET");
    const ipAddress = req.headers.get("cf-connecting-ip");

    if (!rateLimitSecret || !ipAddress) {
      console.error("Rate limiting configuration or visitor IP is missing");
      return jsonResponse(
        { error: "Service temporarily unavailable" },
        503,
        allowedOrigin,
      );
    }

    const visitorHash = await createVisitorHash(
      chatbotId,
      ipAddress,
      rateLimitSecret,
    );

    const { data: allowed, error: rateLimitError } = await adminSupabase.rpc(
      "consume_chatbot_rate_limit",
      {
        p_chatbot_id: chatbotId,
        p_visitor_hash: visitorHash,
      },
    );

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError.message);
      return jsonResponse(
        { error: "Unable to process request" },
        500,
        allowedOrigin,
      );
    }

    if (allowed !== true) {
      return jsonResponse(
        { error: "Too many messages. Please try again later." },
        429,
        allowedOrigin,
      );
    }

    return jsonResponse(
      {
        chatbot: {
          name: chatbot.name,
          welcomeMessage: chatbot.welcome_message,
          primaryColor: chatbot.primary_color,
        },
        reply: "Thanks for your message! The AI assistant is being connected.",
      },
      200,
      allowedOrigin,
    );
  } catch (error) {
    console.error("Chatbot request failed:", error);
    return jsonResponse({ error: "Invalid request" }, 400, allowedOrigin);
  }
});
