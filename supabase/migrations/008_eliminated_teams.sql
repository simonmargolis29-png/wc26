CREATE TABLE eliminated_teams (
  team_code TEXT PRIMARY KEY,
  eliminated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE eliminated_teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read eliminated teams" ON eliminated_teams FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage eliminated teams" ON eliminated_teams FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
