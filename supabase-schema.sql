-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create universes table
CREATE TABLE IF NOT EXISTS universes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_items table
CREATE TABLE IF NOT EXISTS content_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL CHECK (item_type IN ('film', 'book', 'episode', 'series', 'season', 'collection', 'character', 'location', 'event', 'documentary', 'short', 'special')),
  universe_id UUID REFERENCES universes(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES content_items(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_versions table
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE NOT NULL,
  version_name TEXT NOT NULL,
  version_type TEXT,
  release_date DATE,
  runtime_minutes INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create content_links table
CREATE TABLE IF NOT EXISTS content_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE NOT NULL,
  to_item_id UUID REFERENCES content_items(id) ON DELETE CASCADE NOT NULL,
  link_type TEXT NOT NULL CHECK (link_type IN ('sequel', 'prequel', 'spinoff', 'companion', 'remake', 'adaptation', 'crossover', 'reference', 'cameo')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_item_id, to_item_id, link_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_items_universe_id ON content_items(universe_id);
CREATE INDEX IF NOT EXISTS idx_content_items_parent_id ON content_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_items_order ON content_items(universe_id, parent_id, order_index);
CREATE INDEX IF NOT EXISTS idx_content_versions_content_item_id ON content_versions(content_item_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_primary ON content_versions(content_item_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_content_links_from_item ON content_links(from_item_id);
CREATE INDEX IF NOT EXISTS idx_content_links_to_item ON content_links(to_item_id);
CREATE INDEX IF NOT EXISTS idx_universes_slug ON universes(slug);
CREATE INDEX IF NOT EXISTS idx_universes_user_id ON universes(user_id);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_universes_updated_at BEFORE UPDATE ON universes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE universes ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (will be activated when auth is set up)
CREATE POLICY "Users can view their own universes" ON universes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own universes" ON universes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own universes" ON universes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own universes" ON universes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view content in their universes" ON content_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM universes WHERE universes.id = content_items.universe_id AND universes.user_id = auth.uid())
);
CREATE POLICY "Users can create content in their universes" ON content_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM universes WHERE universes.id = content_items.universe_id AND universes.user_id = auth.uid())
);
CREATE POLICY "Users can update content in their universes" ON content_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM universes WHERE universes.id = content_items.universe_id AND universes.user_id = auth.uid())
);
CREATE POLICY "Users can delete content in their universes" ON content_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM universes WHERE universes.id = content_items.universe_id AND universes.user_id = auth.uid())
);

CREATE POLICY "Users can view versions of their content" ON content_versions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM content_items 
    JOIN universes ON content_items.universe_id = universes.id 
    WHERE content_items.id = content_versions.content_item_id AND universes.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create versions of their content" ON content_versions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM content_items 
    JOIN universes ON content_items.universe_id = universes.id 
    WHERE content_items.id = content_versions.content_item_id AND universes.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update versions of their content" ON content_versions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM content_items 
    JOIN universes ON content_items.universe_id = universes.id 
    WHERE content_items.id = content_versions.content_item_id AND universes.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete versions of their content" ON content_versions FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM content_items 
    JOIN universes ON content_items.universe_id = universes.id 
    WHERE content_items.id = content_versions.content_item_id AND universes.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view links between their content" ON content_links FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM content_items 
    JOIN universes ON content_items.universe_id = universes.id 
    WHERE content_items.id = content_links.from_item_id AND universes.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create links between their content" ON content_links FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM content_items 
    JOIN universes ON content_items.universe_id = universes.id 
    WHERE content_items.id = content_links.from_item_id AND universes.user_id = auth.uid()
  )
  AND
  EXISTS (
    SELECT 1 FROM content_items 
    JOIN universes ON content_items.universe_id = universes.id 
    WHERE content_items.id = content_links.to_item_id AND universes.user_id = auth.uid()
  )
);
CREATE POLICY "Users can update links between their content" ON content_links FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM content_items 
    JOIN universes ON content_items.universe_id = universes.id 
    WHERE content_items.id = content_links.from_item_id AND universes.user_id = auth.uid()
  )
);
CREATE POLICY "Users can delete links between their content" ON content_links FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM content_items 
    JOIN universes ON content_items.universe_id = universes.id 
    WHERE content_items.id = content_links.from_item_id AND universes.user_id = auth.uid()
  )
);