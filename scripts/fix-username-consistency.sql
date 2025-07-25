-- Fix Username Extraction Consistency
-- This makes the database trigger match the frontend function exactly

-- ========================================
-- Update Database Trigger to Match Frontend
-- ========================================

CREATE OR REPLACE FUNCTION extract_username_from_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Get user email from auth.users and extract username
  -- This now matches the frontend extractUsernameFromEmail function exactly
  SELECT 
    CASE 
      -- For Gmail addresses: jacob@gmail.com → jacob
      WHEN email LIKE '%@gmail.com' THEN 
        lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]', '-', 'g'))
      
      -- For other domains: jacob.rees@vepple.com → jacob-rees-vepple
      WHEN email LIKE '%@%.%' THEN 
        lower(
          regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]', '-', 'g') || '-' || 
          regexp_replace(split_part(split_part(email, '@', 2), '.', 1), '[^a-zA-Z0-9]', '-', 'g')
        )
      
      -- Fallback for unusual email formats
      ELSE lower(regexp_replace(split_part(email, '@', 1), '[^a-zA-Z0-9]', '-', 'g'))
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
-- Fix Existing Inconsistent Data
-- ========================================

-- Update any existing universes with inconsistent usernames
UPDATE universes 
SET username = (
  SELECT 
    CASE 
      WHEN u.email LIKE '%@gmail.com' THEN 
        lower(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]', '-', 'g'))
      WHEN u.email LIKE '%@%.%' THEN 
        lower(
          regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]', '-', 'g') || '-' || 
          regexp_replace(split_part(split_part(u.email, '@', 2), '.', 1), '[^a-zA-Z0-9]', '-', 'g')
        )
      ELSE lower(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]', '-', 'g'))
    END
  FROM auth.users u 
  WHERE u.id = universes.user_id
)
WHERE EXISTS (
  SELECT 1 FROM auth.users u 
  WHERE u.id = universes.user_id 
  AND u.email IS NOT NULL
);

-- ========================================
-- Verify the Fix
-- ========================================

-- Check that usernames are now consistent
SELECT 
  u.email,
  univ.username,
  CASE 
    WHEN u.email LIKE '%@gmail.com' THEN 
      lower(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]', '-', 'g'))
    WHEN u.email LIKE '%@%.%' THEN 
      lower(
        regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]', '-', 'g') || '-' || 
        regexp_replace(split_part(split_part(u.email, '@', 2), '.', 1), '[^a-zA-Z0-9]', '-', 'g')
      )
    ELSE lower(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]', '-', 'g'))
  END as expected_username,
  CASE 
    WHEN univ.username = CASE 
      WHEN u.email LIKE '%@gmail.com' THEN 
        lower(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]', '-', 'g'))
      WHEN u.email LIKE '%@%.%' THEN 
        lower(
          regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]', '-', 'g') || '-' || 
          regexp_replace(split_part(split_part(u.email, '@', 2), '.', 1), '[^a-zA-Z0-9]', '-', 'g')
        )
      ELSE lower(regexp_replace(split_part(u.email, '@', 1), '[^a-zA-Z0-9]', '-', 'g'))
    END THEN '✅ Consistent'
    ELSE '❌ Inconsistent'
  END as status
FROM universes univ
JOIN auth.users u ON u.id = univ.user_id
ORDER BY u.email;