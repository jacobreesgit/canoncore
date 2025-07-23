-- Add custom content types feature (Phase 1.6)

-- Remove the CHECK constraint on content_items.item_type to allow custom types
ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_item_type_check;

-- Create custom_content_types table
CREATE TABLE IF NOT EXISTS custom_content_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '=Ä',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, user_id) -- Ensure unique names per user
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_content_types_user_id ON custom_content_types(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_content_types_name ON custom_content_types(user_id, name);

-- Add updated_at trigger for custom_content_types (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_custom_content_types_updated_at') THEN
    CREATE TRIGGER update_custom_content_types_updated_at 
      BEFORE UPDATE ON custom_content_types 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE custom_content_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for custom_content_types (drop first if they exist)
DROP POLICY IF EXISTS "Users can view their own custom content types" ON custom_content_types;
DROP POLICY IF EXISTS "Users can create their own custom content types" ON custom_content_types;
DROP POLICY IF EXISTS "Users can update their own custom content types" ON custom_content_types;
DROP POLICY IF EXISTS "Users can delete their own custom content types" ON custom_content_types;

CREATE POLICY "Users can view their own custom content types" 
  ON custom_content_types FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom content types" 
  ON custom_content_types FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom content types" 
  ON custom_content_types FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom content types" 
  ON custom_content_types FOR DELETE 
  USING (auth.uid() = user_id);