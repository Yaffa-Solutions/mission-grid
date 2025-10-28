ALTER TABLE public.missionentry
ADD COLUMN gl_requested BOOLEAN DEFAULT false,
ADD COLUMN gl_approved BOOLEAN DEFAULT false,
ADD COLUMN fuel_liters_company NUMERIC(8, 2) DEFAULT 0,
ADD COLUMN fuel_liters_driver NUMERIC(8, 2) DEFAULT 0,
ADD COLUMN fuel_station_name TEXT;

-- Also, let's update the default status for a new entry
ALTER TABLE public.missionentry
ALTER COLUMN current_status SET DEFAULT 'Dispatched';
