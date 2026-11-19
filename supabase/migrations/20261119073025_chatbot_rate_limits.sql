-- Store anonymous chatbot request timestamps for rate limiting.
CREATE TABLE public.chatbot_rate_limits (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    chatbot_id UUID NOT NULL REFERENCES public.chatbots(id) ON DELETE CASCADE,
    visitor_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient per-visitor rate-limit checks.
CREATE INDEX chatbot_rate_limits_visitor_minute_idx
ON public.chatbot_rate_limits (
    chatbot_id,
    visitor_hash,
    created_at DESC
);

-- Enable Row Level Security.
ALTER TABLE public.chatbot_rate_limits ENABLE ROW LEVEL SECURITY;

-- Do not expose this table to anonymous or authenticated clients.
REVOKE ALL ON TABLE public.chatbot_rate_limits FROM anon, authenticated;

-- Only the database owner / privileged backend can manage these records.

-- Atomically check and record chatbot request limits.
CREATE OR REPLACE FUNCTION public.consume_chatbot_rate_limit(
    p_chatbot_id UUID,
    p_visitor_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    requests_last_minute BIGINT;
    requests_last_hour BIGINT;
BEGIN
    IF p_chatbot_id IS NULL
       OR p_visitor_hash IS NULL
       OR p_visitor_hash !~ '^[0-9a-f]{64}$' THEN
        RAISE EXCEPTION 'Invalid rate limit parameters';
    END IF;

    -- Serialize checks for this chatbot and visitor.
    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(
            p_chatbot_id::TEXT || ':' || p_visitor_hash,
            0
        )
    );

    SELECT
        COUNT(*) FILTER (
            WHERE created_at >= NOW() - INTERVAL '1 minute'
        ),
        COUNT(*)
    INTO requests_last_minute, requests_last_hour
    FROM public.chatbot_rate_limits
    WHERE chatbot_id = p_chatbot_id
      AND visitor_hash = p_visitor_hash
      AND created_at >= NOW() - INTERVAL '1 hour';

    IF requests_last_minute >= 10
       OR requests_last_hour >= 100 THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.chatbot_rate_limits (
        chatbot_id,
        visitor_hash
    )
    VALUES (
        p_chatbot_id,
        p_visitor_hash
    );

    RETURN TRUE;
END;
$$;

-- Restrict execution to the privileged backend role.
REVOKE ALL ON FUNCTION public.consume_chatbot_rate_limit(UUID, TEXT)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consume_chatbot_rate_limit(UUID, TEXT)
TO service_role;

-- Support efficient removal of expired rate-limit records.
CREATE INDEX chatbot_rate_limits_created_at_idx
ON public.chatbot_rate_limits (created_at);