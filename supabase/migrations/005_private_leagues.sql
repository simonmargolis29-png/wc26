-- Allow league creator to eject other members
CREATE POLICY "League creator can eject members" ON league_members
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM leagues WHERE id = league_id AND created_by = auth.uid())
  );

-- Allow members to leave leagues themselves
CREATE POLICY "Users can leave leagues" ON league_members
  FOR DELETE USING (auth.uid() = user_id);

-- Allow league creators to delete their leagues
CREATE POLICY "League creators can delete leagues" ON leagues
  FOR DELETE USING (auth.uid() = created_by);
