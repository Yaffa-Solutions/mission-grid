-- 1. The Mission table (the main container)
CREATE TABLE public.mission (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    border_crossing TEXT, -- e.g., 'KS', 'Zikim'
    status TEXT NOT NULL DEFAULT 'Draft', -- 'Draft', 'Active', 'Reconciling', 'Closed'

    -- Link to the template the user just built
    mission_template_id UUID NOT NULL REFERENCES public.missiontemplate(id),

    -- Copy of the steps from the template at creation time
    -- This is crucial so editing a template doesn't change old missions
    steps_snapshot JSONB NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policy for Missions
ALTER TABLE public.mission ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation for Missions"
ON public.mission FOR ALL
USING ( tenant_id = auth.uid() )
WITH CHECK ( tenant_id = auth.uid() );


-- 2. The "Join Table" (linking trucks to a mission)
-- This is the core of the dispatch board!
CREATE TABLE public.missionentry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES auth.users(id),
    mission_id UUID NOT NULL REFERENCES public.mission(id) ON DELETE CASCADE,
    truck_id UUID NOT NULL REFERENCES public.truck(id),
    driver_id UUID REFERENCES public.driver(id), -- Snapshot the driver at time of assignment

    -- This is the "live" status of the truck for this mission
    current_status TEXT NOT NULL, -- e.g., 'Dispatched', 'At HP1', 'At HP2'

    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policy for MissionEntries
ALTER TABLE public.missionentry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant isolation for Mission Entries"
ON public.missionentry FOR ALL
USING ( tenant_id = auth.uid() )
WITH CHECK ( tenant_id = auth.uid() );
