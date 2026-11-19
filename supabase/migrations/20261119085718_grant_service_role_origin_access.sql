-- Allow the Edge Function's service-role client to read approved origins.
GRANT SELECT
ON TABLE public.chatbot_allowed_origins
TO service_role;