-- 003 — allow anonymous users to read sweepstakes.
-- The sweepstake info page is public (no login required), so anonymous
-- visitors need SELECT access. The old policy restricted to authenticated only.

DROP POLICY IF EXISTS "Anyone authenticated can read sweepstakes" ON sweepstakes;

CREATE POLICY "Anyone can read sweepstakes" ON sweepstakes
  FOR SELECT USING (TRUE);

-- Ensure the default sweepstake row exists (safe to run multiple times).
INSERT INTO sweepstakes (name)
SELECT 'World Cup 2026 Sweepstake #1'
WHERE NOT EXISTS (SELECT 1 FROM sweepstakes);
