import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Navbar } from '@/components/layout/Navbar';
import { LeagueDetailClient } from '@/components/pick-six/LeagueDetailClient';
import { computeEntryStats } from '@/lib/entry-stats';
import type { Profile } from '@/types';

export default async function LeagueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const admin = createAdminClient();

  const [{ data: profileData }, { data: league }, { data: members }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', user.id).single(),
    admin.from('leagues').select('*').eq('id', id).eq('type', 'private').maybeSingle(),
    admin.from('league_members').select('user_id, joined_at').eq('league_id', id),
  ]);

  const profile = profileData as Profile | null;
  if (!profile) redirect('/auth/login');
  if (!league) redirect('/my-golden-six');

  // Verify the current user is actually a member
  const isMember = (members ?? []).some(m => m.user_id === user.id);
  if (!isMember) redirect('/my-golden-six');

  const memberIds = (members ?? []).map(m => m.user_id);

  const [{ data: profilesData }, { data: entriesData }, { data: matchesData }] = await Promise.all([
    admin.from('profiles').select('id, first_name, last_name').in('id', memberIds),
    admin.from('pick_six_entries').select('user_id, total_points, team_picks').in('user_id', memberIds),
    admin.from('matches').select('home_team_code, away_team_code, home_score, away_score').eq('status', 'FINISHED'),
  ]);
  const finishedMatches = (matchesData ?? []) as {
    home_team_code: string; away_team_code: string; home_score: number; away_score: number;
  }[];

  const profileMap = Object.fromEntries((profilesData ?? []).map(p => [p.id, p]));
  const entryMap = Object.fromEntries((entriesData ?? []).map(e => [e.user_id, e]));

  const membersWithData = memberIds.map(uid => {
    const p = profileMap[uid] ?? { first_name: 'Unknown', last_name: '' };
    const e = entryMap[uid] ?? { total_points: 0, team_picks: [] };
    const picks = e.team_picks ?? [];
    const stats = computeEntryStats(picks, finishedMatches);
    return {
      user_id: uid,
      first_name: p.first_name,
      last_name: p.last_name,
      total_points: e.total_points ?? 0,
      team_picks: picks,
      stats,
    };
  });

  const tournamentStarted = membersWithData.some(m => m.total_points > 0);

  return (
    <div className="min-h-screen">
      <Navbar profile={profile} />
      <main className="pt-28 pb-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <LeagueDetailClient
          leagueId={id}
          leagueName={league.name}
          inviteCode={league.invite_code ?? ''}
          isCreator={league.created_by === user.id}
          currentUserId={user.id}
          members={membersWithData}
          tournamentStarted={tournamentStarted}
        />
      </main>
    </div>
  );
}
