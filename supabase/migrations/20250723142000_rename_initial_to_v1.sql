-- Update existing "Initial" versions to "v1"
UPDATE universe_versions SET version_name = 'v1' WHERE version_name = 'Initial';