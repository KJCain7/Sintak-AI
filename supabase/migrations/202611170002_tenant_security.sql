
-- ==========================================
-- SINTAK AI
-- Migration 002: Tenant Security Policies
-- ==========================================

-- 1. Create a private schema for security helpers.

CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;


-- 2. Check whether the current user belongs
-- to a specific business.

CREATE OR REPLACE FUNCTION private.is_business_member(
    target_business_id UUID
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.business_members AS bm
        WHERE bm.business_id = target_business_id
          AND bm.user_id = (SELECT auth.uid())
    );
$$;

REVOKE ALL ON FUNCTION private.is_business_member(UUID)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION private.is_business_member(UUID)
TO authenticated;


-- 3. Automatically assign business ownership
-- to the user who creates the business.

CREATE OR REPLACE FUNCTION private.add_business_owner_membership()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.business_members (
        business_id,
        user_id,
        role
    )
    VALUES (
        NEW.id,
        NEW.owner_id,
        'owner'
    );

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.add_business_owner_membership()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_business_created
ON public.businesses;

CREATE TRIGGER on_business_created
AFTER INSERT ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION private.add_business_owner_membership();


-- 4. Profile security policies.

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));


-- 5. Business security policies.

CREATE POLICY "Members can view their businesses"
ON public.businesses
FOR SELECT
TO authenticated
USING (
    (SELECT private.is_business_member(id))
);

CREATE POLICY "Authenticated users can create businesses"
ON public.businesses
FOR INSERT
TO authenticated
WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Owners can update their businesses"
ON public.businesses
FOR UPDATE
TO authenticated
USING (owner_id = (SELECT auth.uid()))
WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Owners can delete their businesses"
ON public.businesses
FOR DELETE
TO authenticated
USING (owner_id = (SELECT auth.uid()));


-- 6. Business membership security policies.

CREATE POLICY "Members can view their business members"
ON public.business_members
FOR SELECT
TO authenticated
USING (
    user_id = (SELECT auth.uid())
    OR (SELECT private.is_business_member(business_id))
);

-- No client-side INSERT, UPDATE or DELETE policies.
-- Membership changes will be handled by trusted
-- backend operations.


-- 7. Explicit table permissions.

GRANT SELECT, INSERT, UPDATE
ON public.profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.businesses TO authenticated;

GRANT SELECT
ON public.business_members TO authenticated;
