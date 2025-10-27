-- 1. Drop the old policy that was failing
DROP POLICY "Tenant isolation for Contractors" ON public.Contractor;

-- 2. Create the new, correct policy
CREATE POLICY "Tenant isolation via user_id"
ON public.Contractor
FOR ALL
-- The USING clause applies to SELECT, UPDATE, DELETE
USING ( tenant_id = auth.uid() )
-- The WITH CHECK clause applies to INSERT, UPDATE
WITH CHECK ( tenant_id = auth.uid() );

