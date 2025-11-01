-- Add final reconciliation fields to the missionentry table
-- (Skip if already added in previous migration)
ALTER TABLE missionentry
ADD COLUMN IF NOT EXISTS pallets_loaded INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS pallets_received INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS damage_notes TEXT;

-- Add fields to the main mission table to handle closing
ALTER TABLE mission
ADD COLUMN reconciled_by UUID REFERENCES auth.users(id),
ADD COLUMN reconciled_at TIMESTAMPTZ,
ADD COLUMN closed_by UUID REFERENCES auth.users(id),
ADD COLUMN closed_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN mission.reconciled_by IS 'User who reconciled the mission data';
COMMENT ON COLUMN mission.reconciled_at IS 'Timestamp when mission was reconciled';
COMMENT ON COLUMN mission.closed_by IS 'User who closed/locked the mission';
COMMENT ON COLUMN mission.closed_at IS 'Timestamp when mission was closed/locked';
