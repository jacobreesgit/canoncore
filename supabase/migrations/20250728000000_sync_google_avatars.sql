-- Migration to sync Google avatars to profiles table
-- This ensures avatars are always available from the profiles table regardless of auth method

-- Function to handle new user signup and update profile with Google avatar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  google_avatar_url TEXT;
BEGIN
  -- Extract avatar URL from user metadata (Google auth)
  google_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
  
  -- Insert profile WITHOUT Google avatar URL (we'll copy it separately)
  INSERT INTO public.profiles (
    id, 
    full_name, 
    username,
    avatar_url,
    bio,
    website
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    LOWER(SPLIT_PART(NEW.email, '@', 1)),
    NULL, -- Don't store Google URL directly
    NULL,
    NULL
  );
  
  -- If there's a Google avatar, we'll handle copying it via API call
  -- (Database functions can't make HTTP requests, so this will be handled in application code)
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to sync existing Google users' avatars
CREATE OR REPLACE FUNCTION public.sync_existing_google_avatars()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_record RECORD;
  google_avatar_url TEXT;
BEGIN
  -- Loop through all auth users with Google avatars
  FOR user_record IN 
    SELECT id, raw_user_meta_data, email
    FROM auth.users 
    WHERE raw_user_meta_data->>'avatar_url' IS NOT NULL
  LOOP
    google_avatar_url := user_record.raw_user_meta_data->>'avatar_url';
    
    -- Update profile with Google avatar if profile exists and avatar_url is null
    UPDATE public.profiles 
    SET avatar_url = google_avatar_url
    WHERE id = user_record.id 
      AND avatar_url IS NULL; -- Only update if no custom avatar is set
      
    -- If profile doesn't exist, create it
    INSERT INTO public.profiles (
      id, 
      full_name, 
      username,
      avatar_url
    )
    VALUES (
      user_record.id,
      COALESCE(user_record.raw_user_meta_data->>'full_name', user_record.raw_user_meta_data->>'name'),
      LOWER(SPLIT_PART(user_record.email, '@', 1)),
      google_avatar_url
    )
    ON CONFLICT (id) DO NOTHING; -- Don't overwrite existing profiles
  END LOOP;
  
  RAISE NOTICE 'Synced Google avatars for existing users';
END;
$$;

-- Run the sync function to update existing users
SELECT public.sync_existing_google_avatars();

-- Function to update profile avatar when user metadata changes
CREATE OR REPLACE FUNCTION public.handle_user_metadata_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  google_avatar_url TEXT;
BEGIN
  -- Only proceed if raw_user_meta_data changed
  IF OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data THEN
    google_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    
    -- Update profile avatar if user has Google avatar and profile doesn't have custom avatar
    IF google_avatar_url IS NOT NULL THEN
      UPDATE public.profiles 
      SET avatar_url = google_avatar_url
      WHERE id = NEW.id 
        AND (avatar_url IS NULL OR avatar_url = OLD.raw_user_meta_data->>'avatar_url'); -- Only update if no custom avatar or previous Google avatar
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for user metadata updates
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_metadata_update();