-- Store approved website origins for each chatbot.
CREATE TABLE public.chatbot_allowed_origins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    chatbot_id UUID NOT NULL
        REFERENCES public.chatbots(id)
        ON DELETE CASCADE,

    origin TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chatbot_allowed_origins_unique
        UNIQUE (chatbot_id, origin),

    CONSTRAINT chatbot_allowed_origins_valid_origin
    CHECK (
        origin = lower(origin)
        AND origin ~ '^https?://[a-z0-9.-]+(:[0-9]{1,5})?$'
    )
);

-- Index chatbot lookups.
CREATE INDEX chatbot_allowed_origins_chatbot_id_idx
ON public.chatbot_allowed_origins (chatbot_id);

-- Enable row-level security.
ALTER TABLE public.chatbot_allowed_origins ENABLE ROW LEVEL SECURITY;

-- Allow business members to view approved origins.
CREATE POLICY "Business members can view chatbot origins"
ON public.chatbot_allowed_origins
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.chatbots
        WHERE chatbots.id = chatbot_allowed_origins.chatbot_id
          AND private.is_business_member(chatbots.business_id)
    )
);

-- Allow business members to manage approved origins.
CREATE POLICY "Business members can manage chatbot origins"
ON public.chatbot_allowed_origins
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.chatbots
        WHERE chatbots.id = chatbot_allowed_origins.chatbot_id
          AND private.is_business_member(chatbots.business_id)
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.chatbots
        WHERE chatbots.id = chatbot_allowed_origins.chatbot_id
          AND private.is_business_member(chatbots.business_id)
    )
);

-- Never expose origin records to anonymous visitors.
REVOKE ALL ON TABLE public.chatbot_allowed_origins
FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.chatbot_allowed_origins
TO authenticated;
