-- Returns the total number of Squad Six entries so the prize pot can be
-- displayed to anonymous visitors without exposing any user data via RLS.
CREATE OR REPLACE FUNCTION public.pick_six_entry_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) FROM pick_six_entries;
$$;

GRANT EXECUTE ON FUNCTION public.pick_six_entry_count() TO anon;
