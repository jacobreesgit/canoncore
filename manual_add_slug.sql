-- Manual SQL to add slug column and generate slugs for existing content
-- Copy and paste this into your Supabase SQL Editor

-- Step 1: Add slug column to content_items table
ALTER TABLE content_items ADD COLUMN slug TEXT;

-- Step 2: Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_content_slug(title TEXT, universe_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from title
  base_slug := lower(trim(title));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'content-item';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness within the universe and increment if needed
  WHILE EXISTS (
    SELECT 1 FROM content_items 
    WHERE slug = final_slug AND content_items.universe_id = generate_content_slug.universe_id
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Generate slugs for existing content items
UPDATE content_items 
SET slug = generate_content_slug(title, universe_id)
WHERE slug IS NULL;

-- Step 4: Add unique constraint on slug within universe
ALTER TABLE content_items ADD CONSTRAINT content_items_slug_universe_unique UNIQUE (slug, universe_id);

-- Step 5: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_items_slug ON content_items(slug);
CREATE INDEX IF NOT EXISTS idx_content_items_slug_universe ON content_items(universe_id, slug);

-- Step 6: Verify results
SELECT id, title, slug, universe_id FROM content_items ORDER BY title;