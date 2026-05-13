-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  country_of_residence TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Sweepstakes
CREATE TABLE sweepstakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'World Cup 2026 Sweepstake',
  entry_fee DECIMAL(10,2) DEFAULT 5.00,
  max_players INTEGER DEFAULT 48,
  status TEXT DEFAULT 'open',
  draw_date TIMESTAMPTZ DEFAULT '2026-06-09T18:00:00Z',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sweepstakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read sweepstakes" ON sweepstakes FOR SELECT TO authenticated USING (TRUE);

-- Insert default sweepstake
INSERT INTO sweepstakes (name) VALUES ('World Cup 2026 Sweepstake #1');

-- Sweepstake entries
CREATE TABLE sweepstake_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sweepstake_id UUID REFERENCES sweepstakes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_code TEXT,
  payment_status TEXT DEFAULT 'pending',
  assigned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sweepstake_id, user_id)
);

ALTER TABLE sweepstake_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own sweepstake entries" ON sweepstake_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sweepstake entries" ON sweepstake_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read all sweepstake entries" ON sweepstake_entries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Leagues
CREATE TABLE leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'private',
  invite_code TEXT UNIQUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read leagues" ON leagues FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Users can create leagues" ON leagues FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Insert general league
INSERT INTO leagues (name, type, created_by)
SELECT 'Global League', 'general', id FROM profiles WHERE is_admin = TRUE LIMIT 1;

-- League members
CREATE TABLE league_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID REFERENCES leagues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(league_id, user_id)
);

ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read league members" ON league_members FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Users can join leagues" ON league_members FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pick Six entries
CREATE TABLE pick_six_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  league_id UUID REFERENCES leagues(id) ON DELETE SET NULL,
  team_picks TEXT[] NOT NULL DEFAULT '{}',
  total_points INTEGER DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pick_six_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own pick six entry" ON pick_six_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read for leaderboard" ON pick_six_entries FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Users can insert own pick six entry" ON pick_six_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update pick six entries" ON pick_six_entries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Matches (populated from football-data.org API)
CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  home_team_code TEXT,
  away_team_code TEXT,
  home_score INTEGER,
  away_score INTEGER,
  stage TEXT,
  match_date TIMESTAMPTZ,
  status TEXT DEFAULT 'SCHEDULED',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can read matches" ON matches FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admins can manage matches" ON matches FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Points ledger
CREATE TABLE points_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES pick_six_entries(id) ON DELETE CASCADE,
  match_id TEXT REFERENCES matches(id),
  team_code TEXT NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_id, match_id, team_code, reason)
);

ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own points" ON points_ledger FOR SELECT USING (
  EXISTS (SELECT 1 FROM pick_six_entries WHERE id = entry_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage points" ON points_ledger FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- Set admin account
-- Run this manually after signup: UPDATE profiles SET is_admin = TRUE WHERE email = 'simonmargolis29@gmail.com';
