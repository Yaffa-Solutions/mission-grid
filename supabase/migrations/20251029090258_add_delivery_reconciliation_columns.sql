-- Add delivery and reconciliation columns to missionentry table
ALTER TABLE missionentry
ADD COLUMN pallets_loaded INTEGER DEFAULT 0,
ADD COLUMN pallets_received INTEGER DEFAULT 0,
ADD COLUMN damage_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN missionentry.pallets_loaded IS 'Number of pallets loaded at start of delivery';
COMMENT ON COLUMN missionentry.pallets_received IS 'Number of pallets received/delivered at destination';
COMMENT ON COLUMN missionentry.damage_notes IS 'Notes about any damage or issues during delivery';
