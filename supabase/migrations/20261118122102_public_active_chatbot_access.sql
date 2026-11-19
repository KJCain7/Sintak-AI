-- Allow anonymous visitors to read active chatbot configuration only.
CREATE POLICY "Public can view active chatbots"
ON public.chatbots
FOR SELECT
TO anon
USING (status = 'active');

REVOKE SELECT ON public.chatbots FROM anon;
-- Grant anonymous users SELECT permission.
-- Grant access only to public chatbot configuration columns.
GRANT SELECT (
    id,
    name,
    description,
    welcome_message,
    primary_color,
    status
)
ON public.chatbots
TO anon;