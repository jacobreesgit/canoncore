-- Phase 7: Add content placements for multi-placement system
-- This migration enables content items to appear in multiple hierarchy locations

-- Create content_placements table
CREATE TABLE IF NOT EXISTS content_placements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES content_items(id) ON DELETE CASCADE NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_item_id, parent_id)
);

-- Add indexes for content placements
CREATE INDEX IF NOT EXISTS idx_content_placements_content_item_id ON content_placements(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_placements_parent_id ON content_placements(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_placements_order ON content_placements(parent_id, order_index);

-- Enable RLS
ALTER TABLE content_placements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for content placements
CREATE POLICY "Users can view placements in their universes" 
  ON content_placements FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_items 
      JOIN universes ON content_items.universe_id = universes.id 
      WHERE content_items.id = content_placements.content_item_id AND universes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create placements in their universes" 
  ON content_placements FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM content_items 
      JOIN universes ON content_items.universe_id = universes.id 
      WHERE content_items.id = content_placements.content_item_id AND universes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update placements in their universes" 
  ON content_placements FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM content_items 
      JOIN universes ON content_items.universe_id = universes.id 
      WHERE content_items.id = content_placements.content_item_id AND universes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete placements in their universes" 
  ON content_placements FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM content_items 
      JOIN universes ON content_items.universe_id = universes.id 
      WHERE content_items.id = content_placements.content_item_id AND universes.user_id = auth.uid()
    )
  );

-- Migrate existing parent_id relationships to content_placements
-- This preserves the current hierarchy while enabling multi-placement
INSERT INTO content_placements (content_item_id, parent_id, order_index, created_at)
SELECT 
  id as content_item_id,
  parent_id,
  order_index,
  created_at
FROM content_items
WHERE id IS NOT NULL
ON CONFLICT (content_item_id, parent_id) DO NOTHING;

-- Add comment for future reference
COMMENT ON TABLE content_placements IS 'Enables content items to appear in multiple hierarchy locations while maintaining single source of truth. Replaces the single parent_id relationship with many-to-many placements.';