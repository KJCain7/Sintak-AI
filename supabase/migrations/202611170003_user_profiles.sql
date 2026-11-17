
-- ==========================================
-- SINTAK AI
-- Migration 003: Automatic User Profiles
-- ==========================================

-- Create a profile automatically when a new
-- user registers through Supabase Auth.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;


-- Recreate the Auth trigger safely.

DROP TRIGGER IF EXISTS on_auth_user_created
ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();


-- Create profiles for existing users who
-- registered before this trigger was installed.

INSERT INTO public.profiles (
    id,
    full_name
)
SELECT
    id,
    raw_user_meta_data ->> 'full_name'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
