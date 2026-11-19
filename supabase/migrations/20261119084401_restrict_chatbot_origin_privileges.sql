-- Remove all existing privileges from authenticated users.
REVOKE ALL ON TABLE public.chatbot_allowed_origins
FROM authenticated;

-- Grant only the CRUD operations required by the dashboard.
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.chatbot_allowed_origins
TO authenticated;