-- Phase 6: Add custom relationship types support
-- This migration adds support for universe-specific custom relationship types

-- Create custom_relationship_types table
CREATE TABLE IF NOT EXISTS custom_relationship_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL,
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(universe_id, name)
);

-- Add indexes for custom relationship types
CREATE INDEX IF NOT EXISTS idx_custom_relationship_types_universe_id ON custom_relationship_types(universe_id);
CREATE INDEX IF NOT EXISTS idx_custom_relationship_types_user_id ON custom_relationship_types(user_id);

-- Add updated_at trigger
CREATE TRIGGER update_custom_relationship_types_updated_at 
  BEFORE UPDATE ON custom_relationship_types 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE custom_relationship_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for custom relationship types
CREATE POLICY "Users can view custom relationship types in their universes" 
  ON custom_relationship_types FOR SELECT USING (
    EXISTS (SELECT 1 FROM universes WHERE universes.id = custom_relationship_types.universe_id AND universes.user_id = auth.uid())
  );

CREATE POLICY "Users can create custom relationship types in their universes" 
  ON custom_relationship_types FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM universes WHERE universes.id = custom_relationship_types.universe_id AND universes.user_id = auth.uid())
  );

CREATE POLICY "Users can update custom relationship types in their universes" 
  ON custom_relationship_types FOR UPDATE USING (
    EXISTS (SELECT 1 FROM universes WHERE universes.id = custom_relationship_types.universe_id AND universes.user_id = auth.uid())
  );

CREATE POLICY "Users can delete custom relationship types in their universes" 
  ON custom_relationship_types FOR DELETE USING (
    EXISTS (SELECT 1 FROM universes WHERE universes.id = custom_relationship_types.universe_id AND universes.user_id = auth.uid())
  );

-- Update content_links table to support custom relationship types
-- First, drop the existing constraint
ALTER TABLE content_links DROP CONSTRAINT IF EXISTS content_links_link_type_check;

-- Add a new constraint that allows both built-in types and UUIDs for custom types
ALTER TABLE content_links ADD CONSTRAINT content_links_link_type_check 
  CHECK (
    link_type IN ('sequel', 'spinoff', 'reference', 'related') OR
    (link_type ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
  );