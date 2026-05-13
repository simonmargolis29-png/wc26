import type { Profile, Sweepstake, SweepstakeEntry, League, PickSixEntry } from '@/types';

export const mockProfile: Profile = {
  id: 'mock-user-1',
  first_name: 'Simon',
  last_name: 'Margolis',
  email: 'simonmargolis29@gmail.com',
  date_of_birth: '1990-03-15',
  country_of_residence: 'United Kingdom',
  is_admin: true,
  created_at: '2026-04-01T10:00:00Z',
};

export const mockSweepstake: Sweepstake = {
  id: 'sweep-1',
  name: 'World Cup 2026 Sweepstake #1',
  entry_fee: 5,
  max_players: 48,
  status: 'open',
  draw_date: '2026-06-09T18:00:00Z',
  created_at: '2026-04-01T09:00:00Z',
};

export const mockSweepstakeEntry: SweepstakeEntry = {
  id: 'entry-1',
  sweepstake_id: 'sweep-1',
  user_id: 'mock-user-1',
  team_code: null,
  payment_status: 'pending',
  assigned_at: null,
  created_at: '2026-04-10T14:00:00Z',
};

export const mockSweepstakeEntryWithTeam: SweepstakeEntry = {
  ...mockSweepstakeEntry,
  team_code: 'FRA',
  payment_status: 'paid',
  assigned_at: '2026-06-09T18:30:00Z',
};

export const mockGeneralLeague: League = {
  id: 'league-general',
  name: 'Global League',
  type: 'general',
  invite_code: null,
  created_by: 'mock-user-1',
  created_at: '2026-04-01T09:00:00Z',
  member_count: 47,
};

export const mockPrivateLeague: League = {
  id: 'league-private-1',
  name: 'The Office League',
  type: 'private',
  invite_code: 'OFF26A',
  created_by: 'mock-user-1',
  created_at: '2026-04-12T11:00:00Z',
  member_count: 8,
};

export const mockPickSixEntry: PickSixEntry = {
  id: 'pick-1',
  user_id: 'mock-user-1',
  league_id: 'league-general',
  team_picks: ['BRA', 'POR', 'MAR', 'USA', 'JPN', 'COL'],
  total_points: 14,
  payment_status: 'paid',
  created_at: '2026-04-15T09:00:00Z',
  league: mockGeneralLeague,
};

export const mockPickSixEntryPending: PickSixEntry = {
  ...mockPickSixEntry,
  payment_status: 'pending',
  total_points: 0,
};

export const mockLeaderboard = [
  { id: 'p1', user_id: 'u1', profile: { first_name: 'Jamie', last_name: 'Clarke', country_of_residence: 'United Kingdom' }, league: { name: 'The Office League', type: 'private' }, team_picks: ['BRA','FRA','ENG','GER','ARG','ESP'], total_points: 41, payment_status: 'paid' },
  { id: 'p2', user_id: 'u2', profile: { first_name: 'Sarah', last_name: 'Thompson', country_of_residence: 'Ireland' }, league: { name: 'Global League', type: 'general' }, team_picks: ['FRA','POR','USA','MEX','NED','BEL'], total_points: 37, payment_status: 'paid' },
  { id: 'p3', user_id: 'u3', profile: { first_name: 'Marcus', last_name: 'Webb', country_of_residence: 'United Kingdom' }, league: { name: 'Global League', type: 'general' }, team_picks: ['ARG','ENG','ITA','URU','KOR','MAR'], total_points: 33, payment_status: 'paid' },
  { id: 'p4', user_id: 'mock-user-1', profile: { first_name: 'Simon', last_name: 'Margolis', country_of_residence: 'United Kingdom' }, league: { name: 'The Office League', type: 'private' }, team_picks: ['ENG','FRA','BRA','ARG','GER','ESP'], total_points: 24, payment_status: 'paid' },
  { id: 'p5', user_id: 'u5', profile: { first_name: 'Priya', last_name: 'Sharma', country_of_residence: 'India' }, league: { name: 'Global League', type: 'general' }, team_picks: ['JPN','KOR','AUS','BRA','FRA','GER'], total_points: 22, payment_status: 'paid' },
  { id: 'p6', user_id: 'u6', profile: { first_name: 'Daniel', last_name: 'Osei', country_of_residence: 'Ghana' }, league: { name: 'Global League', type: 'general' }, team_picks: ['GHA','NGR','MAR','SEN','EGY','CMR'], total_points: 19, payment_status: 'paid' },
  { id: 'p7', user_id: 'u7', profile: { first_name: 'Emma', last_name: 'Sullivan', country_of_residence: 'Australia' }, league: { name: 'Antipodean Cup', type: 'private' }, team_picks: ['AUS','NZL','JPN','KOR','BRA','ARG'], total_points: 18, payment_status: 'paid' },
  { id: 'p8', user_id: 'u8', profile: { first_name: 'Tom', last_name: 'Bradley', country_of_residence: 'United Kingdom' }, league: { name: 'The Office League', type: 'private' }, team_picks: ['ENG','GER','SUI','DEN','POR','COL'], total_points: 15, payment_status: 'paid' },
  { id: 'p9', user_id: 'u9', profile: { first_name: 'Carlos', last_name: 'Mendez', country_of_residence: 'Mexico' }, league: { name: 'Global League', type: 'general' }, team_picks: ['MEX','USA','CAN','ARG','BRA','COL'], total_points: 14, payment_status: 'paid' },
  { id: 'p10', user_id: 'u10', profile: { first_name: 'Nina', last_name: 'Petrov', country_of_residence: 'Germany' }, league: { name: 'Europa League', type: 'private' }, team_picks: ['GER','AUT','SUI','CRO','SRB','POL'], total_points: 12, payment_status: 'paid' },
  { id: 'p11', user_id: 'u11', profile: { first_name: 'Alex', last_name: 'Chen', country_of_residence: 'Canada' }, league: { name: 'Global League', type: 'general' }, team_picks: ['CAN','USA','MEX','JPN','KOR','AUS'], total_points: 10, payment_status: 'paid' },
  { id: 'p12', user_id: 'u12', profile: { first_name: 'Lily', last_name: 'Park', country_of_residence: 'South Korea' }, league: { name: 'Global League', type: 'general' }, team_picks: ['KOR','JPN','AUS','BRA','FRA','ESP'], total_points: 8, payment_status: 'pending' },
];

export const mockAllProfiles: Profile[] = [
  mockProfile,
  { id: 'u1', first_name: 'Jamie', last_name: 'Clarke', email: 'jamie@example.com', date_of_birth: '1992-07-14', country_of_residence: 'United Kingdom', is_admin: false, created_at: '2026-04-02T09:00:00Z' },
  { id: 'u2', first_name: 'Sarah', last_name: 'Thompson', email: 'sarah@example.com', date_of_birth: '1988-11-22', country_of_residence: 'Ireland', is_admin: false, created_at: '2026-04-03T10:30:00Z' },
  { id: 'u3', first_name: 'Marcus', last_name: 'Webb', email: 'marcus@example.com', date_of_birth: '1995-02-08', country_of_residence: 'United Kingdom', is_admin: false, created_at: '2026-04-03T14:00:00Z' },
  { id: 'u5', first_name: 'Priya', last_name: 'Sharma', email: 'priya@example.com', date_of_birth: '1993-09-30', country_of_residence: 'India', is_admin: false, created_at: '2026-04-04T08:00:00Z' },
  { id: 'u6', first_name: 'Daniel', last_name: 'Osei', email: 'daniel@example.com', date_of_birth: '1991-05-17', country_of_residence: 'Ghana', is_admin: false, created_at: '2026-04-05T11:00:00Z' },
  { id: 'u7', first_name: 'Emma', last_name: 'Sullivan', email: 'emma@example.com', date_of_birth: '1990-12-03', country_of_residence: 'Australia', is_admin: false, created_at: '2026-04-06T09:30:00Z' },
  { id: 'u8', first_name: 'Tom', last_name: 'Bradley', email: 'tom@example.com', date_of_birth: '1987-03-25', country_of_residence: 'United Kingdom', is_admin: false, created_at: '2026-04-07T15:00:00Z' },
  { id: 'u9', first_name: 'Carlos', last_name: 'Mendez', email: 'carlos@example.com', date_of_birth: '1994-08-11', country_of_residence: 'Mexico', is_admin: false, created_at: '2026-04-08T10:00:00Z' },
  { id: 'u10', first_name: 'Nina', last_name: 'Petrov', email: 'nina@example.com', date_of_birth: '1996-01-19', country_of_residence: 'Germany', is_admin: false, created_at: '2026-04-09T13:00:00Z' },
  { id: 'u11', first_name: 'Alex', last_name: 'Chen', email: 'alex@example.com', date_of_birth: '1992-06-28', country_of_residence: 'Canada', is_admin: false, created_at: '2026-04-10T09:00:00Z' },
  { id: 'u12', first_name: 'Lily', last_name: 'Park', email: 'lily@example.com', date_of_birth: '1999-04-05', country_of_residence: 'South Korea', is_admin: false, created_at: '2026-04-11T16:00:00Z' },
];

export const mockSweepEntries = mockAllProfiles.slice(0, 35).map((p, i) => ({
  id: `se-${i}`,
  sweepstake_id: 'sweep-1',
  user_id: p.id,
  team_code: null,
  payment_status: i < 28 ? 'paid' : 'pending',
  assigned_at: null,
  created_at: p.created_at,
  profile: { first_name: p.first_name, last_name: p.last_name, email: p.email },
  sweepstake: { name: 'World Cup 2026 Sweepstake #1' },
}));

export const mockCountryCount: Record<string, number> = {
  'United Kingdom': 8,
  'Ireland': 3,
  'Australia': 2,
  'Germany': 2,
  'Canada': 2,
  'Mexico': 1,
  'India': 1,
  'Ghana': 1,
  'South Korea': 1,
};

export const mockTeamPickCount: Record<string, number> = {
  BRA: 9, FRA: 8, ENG: 8, ARG: 7, GER: 7, ESP: 6,
  POR: 5, JPN: 5, USA: 4, KOR: 4, NED: 3, BEL: 3,
  AUS: 3, MAR: 3, MEX: 2, ITA: 2,
};
