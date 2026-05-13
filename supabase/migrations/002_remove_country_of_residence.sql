-- 002 — drop the country_of_residence requirement on profiles.
-- The signup forms no longer collect this. Existing data (if any) is preserved.
-- Run with: supabase db push   (or apply via the Supabase dashboard SQL editor).

ALTER TABLE profiles
  ALTER COLUMN country_of_residence DROP NOT NULL;

ALTER TABLE profiles
  ALTER COLUMN country_of_residence SET DEFAULT NULL;
