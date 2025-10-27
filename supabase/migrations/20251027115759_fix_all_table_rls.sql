-- 1. FIX FOR: public.Driver
-- Drop the old policy that was failing
DROP POLICY IF EXISTS "Tenant isolation for Drivers" ON public.Driver;

-- Create the new, correct policy using auth.uid()
CREATE POLICY "Tenant isolation via user_id for Drivers"
ON public.Driver
FOR ALL
USING ( tenant_id = auth.uid() )
WITH CHECK ( tenant_id = auth.uid() );


-- 2. FIX FOR: public.Truck
-- Drop the old policy that was failing
DROP POLICY IF EXISTS "Tenant isolation for Trucks" ON public.Truck;

-- Create the new, correct policy using auth.uid()
CREATE POLICY "Tenant isolation via user_id for Trucks"
ON public.Truck
FOR ALL
USING ( tenant_id = auth.uid() )
WITH CHECK ( tenant_id = auth.uid() );


-- 3. FIX FOR: public.MissionTemplate
-- Drop the old policy that was failing
DROP POLICY IF EXISTS "Tenant isolation for Templates" ON public.MissionTemplate;

-- Create the new, correct policy using auth.uid()
CREATE POLICY "Tenant isolation via user_id for Templates"
ON public.MissionTemplate
FOR ALL
USING ( tenant_id = auth.uid() )
WITH CHECK ( tenant_id = auth.uid() );
