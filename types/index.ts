export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  country_of_residence?: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface WCTeam {
  code: string; // e.g. 'ENG'
  name: string;
  group_name: string | null;
  confederation: string;
  flag_emoji: string;
}

export interface Sweepstake {
  id: string;
  name: string;
  entry_fee: number;
  max_players: number;
  status: 'open' | 'full' | 'drawn' | 'active' | 'finished';
  draw_date: string;
  created_at: string;
}

export interface SweepstakeEntry {
  id: string;
  sweepstake_id: string;
  user_id: string;
  team_code: string | null;
  payment_status: 'pending' | 'paid';
  assigned_at: string | null;
  created_at: string;
  profile?: Profile;
  team?: WCTeam;
}

export interface League {
  id: string;
  name: string;
  type: 'general' | 'private';
  invite_code: string | null;
  created_by: string;
  created_at: string;
  member_count?: number;
}

export interface PickSixEntry {
  id: string;
  user_id: string;
  league_id: string;
  team_picks: string[]; // array of 6 team codes
  total_points: number;
  payment_status: 'pending' | 'paid';
  created_at: string;
  profile?: Profile;
  league?: League;
}

export interface Match {
  id: string;
  home_team_code: string;
  away_team_code: string;
  home_score: number | null;
  away_score: number | null;
  stage: string;
  match_date: string;
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'FINISHED' | 'PAUSED';
}

export interface PointsLedgerEntry {
  id: string;
  entry_id: string;
  match_id: string;
  team_code: string;
  points: number;
  reason: 'win' | 'draw' | 'bonus_goals';
}
