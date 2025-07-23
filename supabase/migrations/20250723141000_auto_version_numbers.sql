-- Add version_number column to universe_versions table
ALTER TABLE universe_versions ADD COLUMN version_number INTEGER;

-- Update existing "Initial" versions to be version 1
UPDATE universe_versions SET version_number = 1 WHERE version_name = 'Initial';

-- Create function to get next version number
CREATE OR REPLACE FUNCTION get_next_version_number(universe_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN COALESCE((
    SELECT MAX(version_number) + 1 
    FROM universe_versions 
    WHERE universe_id = universe_uuid
  ), 1);
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint on universe_id + version_number
ALTER TABLE universe_versions ADD CONSTRAINT unique_universe_version_number UNIQUE (universe_id, version_number);