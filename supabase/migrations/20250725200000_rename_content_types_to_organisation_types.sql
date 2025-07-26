-- Rename content types to organisation types
-- This migration renames tables and updates references

-- Rename custom_content_types table to custom_organisation_types
ALTER TABLE custom_content_types RENAME TO custom_organisation_types;

-- Rename indexes
ALTER INDEX idx_custom_content_types_user_id RENAME TO idx_custom_organisation_types_user_id;
ALTER INDEX idx_custom_content_types_name RENAME TO idx_custom_organisation_types_name;

-- Rename trigger
ALTER TRIGGER update_custom_content_types_updated_at ON custom_organisation_types RENAME TO update_custom_organisation_types_updated_at;

-- Drop old policies and create new ones with updated names
DROP POLICY IF EXISTS "Users can view their own custom content types" ON custom_organisation_types;
DROP POLICY IF EXISTS "Users can create their own custom content types" ON custom_organisation_types;
DROP POLICY IF EXISTS "Users can update their own custom content types" ON custom_organisation_types;
DROP POLICY IF EXISTS "Users can delete their own custom content types" ON custom_organisation_types;

CREATE POLICY "Users can view their own custom organisation types" 
  ON custom_organisation_types FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom organisation types" 
  ON custom_organisation_types FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom organisation types" 
  ON custom_organisation_types FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom organisation types" 
  ON custom_organisation_types FOR DELETE 
  USING (auth.uid() = user_id);

-- Create disabled_organisation_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS disabled_organisation_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE NOT NULL,
  type_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(universe_id, type_name)
);

-- Create indexes for disabled_organisation_types
CREATE INDEX IF NOT EXISTS idx_disabled_organisation_types_universe_id ON disabled_organisation_types(universe_id);

-- Enable Row Level Security for disabled_organisation_types
ALTER TABLE disabled_organisation_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for disabled_organisation_types
CREATE POLICY "Users can view disabled organisation types in their universes" 
  ON disabled_organisation_types FOR SELECT 
  USING (EXISTS (SELECT 1 FROM universes WHERE universes.id = disabled_organisation_types.universe_id AND universes.user_id = auth.uid()));

CREATE POLICY "Users can create disabled organisation types in their universes" 
  ON disabled_organisation_types FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM universes WHERE universes.id = disabled_organisation_types.universe_id AND universes.user_id = auth.uid()));

CREATE POLICY "Users can delete disabled organisation types in their universes" 
  ON disabled_organisation_types FOR DELETE 
  USING (EXISTS (SELECT 1 FROM universes WHERE universes.id = disabled_organisation_types.universe_id AND universes.user_id = auth.uid()));