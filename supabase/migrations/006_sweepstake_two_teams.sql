-- Each sweepstake player gets 2 teams in the draw
ALTER TABLE sweepstake_entries ADD COLUMN IF NOT EXISTS team_code_2 TEXT;

-- Update draw date to 10 June 2026 at 8pm BST (19:00 UTC)
UPDATE sweepstakes SET draw_date = '2026-06-10T19:00:00Z';
ALTER TABLE sweepstakes ALTER COLUMN draw_date SET DEFAULT '2026-06-10T19:00:00Z';
