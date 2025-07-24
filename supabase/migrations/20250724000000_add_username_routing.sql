-- Add username field to universes table for routing
ALTER TABLE universes ADD COLUMN username TEXT;

-- Create function to extract username from email
CREATE OR REPLACE FUNCTION extract_username_from_email(email_address TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Extract everything before @ symbol and replace dots/special chars with hyphens
  RETURN LOWER(REGEXP_REPLACE(SPLIT_PART(email_address, '@', 1), '[^a-zA-Z0-9]', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Update existing universes with usernames based on their user's email
UPDATE universes 
SET username = extract_username_from_email(
  (SELECT email FROM auth.users WHERE id = universes.user_id)
)
WHERE username IS NULL;

-- Make username NOT NULL after populating existing data
ALTER TABLE universes ALTER COLUMN username SET NOT NULL;

-- Update the unique constraint to be scoped per username instead of globally
ALTER TABLE universes DROP CONSTRAINT universes_slug_key;
ALTER TABLE universes ADD CONSTRAINT universes_username_slug_key UNIQUE (username, slug);

-- Create index for username-based lookups
CREATE INDEX IF NOT EXISTS idx_universes_username ON universes(username);
CREATE INDEX IF NOT EXISTS idx_universes_username_slug ON universes(username, slug);

-- Add trigger to automatically set username from user's email on insert/update
CREATE OR REPLACE FUNCTION set_universe_username()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the email of the authenticated user and extract username
  NEW.username = extract_username_from_email(
    (SELECT email FROM auth.users WHERE id = NEW.user_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_universe_username_trigger
  BEFORE INSERT OR UPDATE ON universes
  FOR EACH ROW
  EXECUTE FUNCTION set_universe_username();