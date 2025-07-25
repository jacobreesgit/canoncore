-- CanonCore Username Trigger Fix
-- Run this SQL in Supabase Dashboard -> SQL Editor
-- This fixes the username extraction issue for universe creation

-- ========================================
-- STEP 1: Check Current State
-- ========================================

-- Check if any username triggers currently exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'universes'
   OR trigger_name LIKE '%username%';

-- Check current username values in universes
SELECT 
  id,
  name,
  username,
  user_id,
  created_at
FROM universes
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- STEP 2: Create Username Extraction Function
-- ========================================

-- Create or replace the username extraction function
CREATE OR REPLACE FUNCTION extract_username_from_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Get user email from auth.users and extract username
  SELECT 
    CASE 
      -- For Gmail addresses: jacob@gmail.com → jacob
      WHEN email LIKE '%@gmail.com' THEN 
        lower(split_part(email, '@', 1))
      
      -- For other domains: jacob.rees@vepple.com → jacob-rees-vepple
      WHEN email LIKE '%@%.%' THEN 
        lower(regexp_replace(
          split_part(email, '@', 1) || '-' || 
          replace(split_part(split_part(email, '@', 2), '.', 1), '.', '-'),
          '[^a-z0-9-]', '', 'gi'
        ))
      
      -- Fallback for unusual email formats
      ELSE lower(regexp_replace(split_part(email, '@', 1), '[^a-z0-9]', '', 'gi'))
    END
  INTO NEW.username
  FROM auth.users 
  WHERE id = NEW.user_id;
  
  -- Safety fallback if user not found or username is empty
  IF NEW.username IS NULL OR NEW.username = '' THEN
    NEW.username = 'user-' || substring(NEW.user_id::text, 1, 8);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 3: Create the Trigger
-- ========================================

-- Remove any existing username trigger
DROP TRIGGER IF EXISTS set_username_trigger ON universes;
DROP TRIGGER IF EXISTS universe_username_trigger ON universes;

-- Create the new trigger
CREATE TRIGGER set_username_trigger
  BEFORE INSERT ON universes
  FOR EACH ROW
  EXECUTE FUNCTION extract_username_from_user();

-- ========================================
-- STEP 4: Fix Existing Data (Optional)
-- ========================================

-- Update any existing universes that have NULL usernames
UPDATE universes 
SET username = (
  SELECT 
    CASE 
      WHEN u.email LIKE '%@gmail.com' THEN 
        lower(split_part(u.email, '@', 1))
      WHEN u.email LIKE '%@%.%' THEN 
        lower(regexp_replace(
          split_part(u.email, '@', 1) || '-' || 
          replace(split_part(split_part(u.email, '@', 2), '.', 1), '.', '-'),
          '[^a-z0-9-]', '', 'gi'
        ))
      ELSE lower(regexp_replace(split_part(u.email, '@', 1), '[^a-z0-9]', '', 'gi'))
    END
  FROM auth.users u 
  WHERE u.id = universes.user_id
)
WHERE username IS NULL;

-- ========================================
-- STEP 5: Verify the Fix
-- ========================================

-- Check that the trigger was created successfully
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'universes';

-- Check that the function exists
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'extract_username_from_user';

-- Show current state of universes table
SELECT 
  COUNT(*) as total_universes,
  COUNT(username) as universes_with_username,
  COUNT(*) - COUNT(username) as universes_missing_username
FROM universes;

-- ========================================
-- TEST QUERIES (Optional - for verification)
-- ========================================

-- Test the username extraction logic with sample emails
SELECT 
  email,
  CASE 
    WHEN email LIKE '%@gmail.com' THEN 
      lower(split_part(email, '@', 1))
    WHEN email LIKE '%@%.%' THEN 
      lower(regexp_replace(
        split_part(email, '@', 1) || '-' || 
        replace(split_part(split_part(email, '@', 2), '.', 1), '.', '-'),
        '[^a-z0-9-]', '', 'gi'
      ))
    ELSE lower(regexp_replace(split_part(email, '@', 1), '[^a-z0-9]', '', 'gi'))
  END as extracted_username
FROM (VALUES 
  ('jacob@gmail.com'),
  ('demo@gmail.com'),
  ('jacob.rees@vepple.com'),
  ('user@company.co.uk'),
  ('test@example.org')
) AS test_emails(email);

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

-- If you see this without errors, the fix is complete!
-- You can now run: npm run seed-data
-- And it should create universes successfully with proper usernames.