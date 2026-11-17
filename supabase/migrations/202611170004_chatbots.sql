
-- ==========================================
-- SINTAK AI
-- Migration 004: Chatbot Management
-- ==========================================

-- 1. Create the chatbots table.

CREATE TABLE public.chatbots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_id UUID NOT NULL
        REFERENCES public.businesses(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL
        CHECK (char_length(trim(name)) >= 2),

    description TEXT,

    status TEXT NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'active', 'paused')),

    welcome_message TEXT NOT NULL
        DEFAULT 'Hi! How can I help you today?',

    primary_color TEXT NOT NULL DEFAULT '#2563EB',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- 2. Add an index for business lookups.

CREATE INDEX idx_chatbots_business_id
ON public.chatbots(business_id);


-- 3. Enable Row Level Security.

ALTER TABLE public.chatbots
ENABLE ROW LEVEL SECURITY;


-- 4. Allow business members to view chatbots.

CREATE POLICY "Members can view their business chatbots"
ON public.chatbots
FOR SELECT
TO authenticated
USING (
    (SELECT private.is_business_member(business_id))
);


-- 5. Allow business members to create chatbots.

CREATE POLICY "Members can create business chatbots"
ON public.chatbots
FOR INSERT
TO authenticated
WITH CHECK (
    (SELECT private.is_business_member(business_id))
);


-- 6. Allow business members to update chatbots.

CREATE POLICY "Members can update their business chatbots"
ON public.chatbots
FOR UPDATE
TO authenticated
USING (
    (SELECT private.is_business_member(business_id))
)
WITH CHECK (
    (SELECT private.is_business_member(business_id))
);


-- 7. Allow business members to delete chatbots.

CREATE POLICY "Members can delete their business chatbots"
ON public.chatbots
FOR DELETE
TO authenticated
USING (
    (SELECT private.is_business_member(business_id))
);


-- 8. Grant authenticated users the required permissions.

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.chatbots
TO authenticated;
-- 9. Automatically update the updated_at timestamp.

CREATE OR REPLACE FUNCTION public.update_chatbot_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_chatbot_updated_at
BEFORE UPDATE ON public.chatbots
FOR EACH ROW
EXECUTE FUNCTION public.update_chatbot_updated_at();