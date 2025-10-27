CREATE TABLE public.Contractor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  poc_name TEXT,
  poc_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE
  public.Contractor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for Contractors" ON public.Contractor FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id') :: uuid);

CREATE TABLE public.MissionTemplate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  steps_definition JSONB NOT NULL DEFAULT '[]' :: jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE
  public.MissionTemplate ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for Templates" ON public.MissionTemplate FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id') :: uuid);

CREATE TABLE public.Driver (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  contractor_id UUID REFERENCES public.Contractor(id),
  name TEXT NOT NULL,
  national_id TEXT,
  phone TEXT,
  approval_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE
  public.Driver ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for Drivers" ON public.Driver FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id') :: uuid);

CREATE TABLE public.Truck (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  driver_id UUID REFERENCES public.Driver(id) ON DELETE
  SET
    NULL,
    plate_no TEXT NOT NULL UNIQUE,
    vehicle_type TEXT,
    capacity_tons DECIMAL(5, 2),
    capacity_pallets INT,
    status TEXT DEFAULT 'idle'
);

ALTER TABLE
  public.Truck ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant isolation for Trucks" ON public.Truck FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id') :: uuid);