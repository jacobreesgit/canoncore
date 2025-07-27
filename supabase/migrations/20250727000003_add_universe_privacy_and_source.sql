-- Migration: Add universe privacy and source tracking fields
-- Phase 8.1: Universe Privacy & Source Tracking

-- Add new columns to universes table
ALTER TABLE universes 
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN source_url TEXT,
ADD COLUMN source_description TEXT;

-- Add index for public universe queries (performance optimization)
CREATE INDEX idx_universes_public ON universes(is_public) WHERE is_public = true;

-- Add comments for documentation
COMMENT ON COLUMN universes.is_public IS 'Whether this universe is publicly discoverable (default: true)';
COMMENT ON COLUMN universes.source_url IS 'Optional URL to data source (e.g., Excel sheet, website)';
COMMENT ON COLUMN universes.source_description IS 'Optional description of data source or attribution';

-- Update RLS policies to respect privacy settings
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all universes" ON universes;
DROP POLICY IF EXISTS "Users can view their own universes" ON universes;
DROP POLICY IF EXISTS "Users can view public universes" ON universes;

-- Create new policies for public/private universe access
CREATE POLICY "Users can view their own universes" ON universes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public universes" ON universes
    FOR SELECT USING (is_public = true);

-- Keep existing policies for insert/update/delete (users can only modify their own)
-- These should already exist but adding for completeness:

-- Ensure users can only insert their own universes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'universes' 
        AND policyname = 'Users can insert their own universes'
    ) THEN
        CREATE POLICY "Users can insert their own universes" ON universes
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Ensure users can only update their own universes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'universes' 
        AND policyname = 'Users can update their own universes'
    ) THEN
        CREATE POLICY "Users can update their own universes" ON universes
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Ensure users can only delete their own universes
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'universes' 
        AND policyname = 'Users can delete their own universes'
    ) THEN
        CREATE POLICY "Users can delete their own universes" ON universes
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;