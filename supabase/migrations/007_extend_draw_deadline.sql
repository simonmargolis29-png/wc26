-- Extend the sweepstake draw deadline to 11pm BST (22:00 UTC) on 10 June 2026
UPDATE sweepstakes SET draw_date = '2026-06-10T22:00:00Z';
ALTER TABLE sweepstakes ALTER COLUMN draw_date SET DEFAULT '2026-06-10T22:00:00Z';
