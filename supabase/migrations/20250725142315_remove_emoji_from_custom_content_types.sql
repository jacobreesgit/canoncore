-- Remove emoji column from custom_content_types table
-- Custom content types will no longer have emoji support

ALTER TABLE public.custom_content_types DROP COLUMN IF EXISTS emoji;