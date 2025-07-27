-- Phase 6: Add disabled relationship types support
-- This migration adds support for disabling built-in relationship types per universe

-- Create disabled_relationship_types table
CREATE TABLE IF NOT EXISTS disabled_relationship_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE NOT NULL,
  type_name TEXT NOT NULL CHECK (type_name IN ('sequel', 'spinoff', 'reference', 'related')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(universe_id, type_name)
);

-- Add indexes for disabled relationship types
CREATE INDEX IF NOT EXISTS idx_disabled_relationship_types_universe_id ON disabled_relationship_types(universe_id);
CREATE INDEX IF NOT EXISTS idx_disabled_relationship_types_type_name ON disabled_relationship_types(type_name);

-- Enable RLS
ALTER TABLE disabled_relationship_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for disabled relationship types
CREATE POLICY "Users can view disabled relationship types in their universes" 
  ON disabled_relationship_types FOR SELECT USING (
    EXISTS (SELECT 1 FROM universes WHERE universes.id = disabled_relationship_types.universe_id AND universes.user_id = auth.uid())
  );

CREATE POLICY "Users can create disabled relationship types in their universes" 
  ON disabled_relationship_types FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM universes WHERE universes.id = disabled_relationship_types.universe_id AND universes.user_id = auth.uid())
  );

CREATE POLICY "Users can delete disabled relationship types in their universes" 
  ON disabled_relationship_types FOR DELETE USING (
    EXISTS (SELECT 1 FROM universes WHERE universes.id = disabled_relationship_types.universe_id AND universes.user_id = auth.uid())
  );