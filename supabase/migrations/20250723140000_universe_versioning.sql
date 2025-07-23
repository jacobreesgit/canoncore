-- Phase 2.1: Universe Version Management System
-- Git-like versioning for entire universe states

-- Universe versions table (like git commits)
CREATE TABLE universe_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE NOT NULL,
  version_name TEXT NOT NULL,
  commit_message TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(universe_id, version_name)
);

-- Version snapshots table (stores complete universe state)
CREATE TABLE version_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  version_id UUID REFERENCES universe_versions(id) ON DELETE CASCADE NOT NULL,
  content_items_snapshot JSONB NOT NULL,
  custom_types_snapshot JSONB NOT NULL,
  disabled_types_snapshot JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_universe_versions_universe_id ON universe_versions(universe_id);
CREATE INDEX idx_universe_versions_is_current ON universe_versions(universe_id, is_current) WHERE is_current = TRUE;
CREATE INDEX idx_version_snapshots_version_id ON version_snapshots(version_id);

-- Trigger to update updated_at on universe_versions
CREATE OR REPLACE FUNCTION update_universe_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_universe_versions_updated_at
  BEFORE UPDATE ON universe_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_universe_versions_updated_at();

-- Row Level Security policies
ALTER TABLE universe_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies for universe_versions
CREATE POLICY "Users can view their own universe versions" ON universe_versions
  FOR SELECT USING (
    universe_id IN (
      SELECT id FROM universes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for their own universes" ON universe_versions
  FOR INSERT WITH CHECK (
    universe_id IN (
      SELECT id FROM universes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own universe versions" ON universe_versions
  FOR UPDATE USING (
    universe_id IN (
      SELECT id FROM universes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own universe versions" ON universe_versions
  FOR DELETE USING (
    universe_id IN (
      SELECT id FROM universes WHERE user_id = auth.uid()
    )
  );

-- RLS policies for version_snapshots
CREATE POLICY "Users can view their own version snapshots" ON version_snapshots
  FOR SELECT USING (
    version_id IN (
      SELECT id FROM universe_versions 
      WHERE universe_id IN (
        SELECT id FROM universes WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create snapshots for their own versions" ON version_snapshots
  FOR INSERT WITH CHECK (
    version_id IN (
      SELECT id FROM universe_versions 
      WHERE universe_id IN (
        SELECT id FROM universes WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own version snapshots" ON version_snapshots
  FOR UPDATE USING (
    version_id IN (
      SELECT id FROM universe_versions 
      WHERE universe_id IN (
        SELECT id FROM universes WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own version snapshots" ON version_snapshots
  FOR DELETE USING (
    version_id IN (
      SELECT id FROM universe_versions 
      WHERE universe_id IN (
        SELECT id FROM universes WHERE user_id = auth.uid()
      )
    )
  );

-- Function to ensure only one current version per universe
CREATE OR REPLACE FUNCTION ensure_single_current_version()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a version as current, unset all others for this universe
  IF NEW.is_current = TRUE THEN
    UPDATE universe_versions 
    SET is_current = FALSE 
    WHERE universe_id = NEW.universe_id 
    AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_current_version_trigger
  BEFORE INSERT OR UPDATE ON universe_versions
  FOR EACH ROW
  WHEN (NEW.is_current = TRUE)
  EXECUTE FUNCTION ensure_single_current_version();