import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Navbar } from '@/components/layout/Navbar';
import { PickSixClient } from '@/components/pick-six/PickSixClient';
import { LeaguesSection } from '@/components/pick-six/LeaguesSection';
import type { Profile, PickSixEntry } from '@/types';

export default async function MyGoldenSixPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let entry: PickSixEntry | null = null;

  const { data: countData } = await supabase.rpc('pick_six_entry_count');
  const entryCount = typeof countData === 'number' ? countData : 0;

  if (user) {
    const [{ data: p }, { data: e }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('pick_six_entries').select('*, league:leagues(*)').eq('user_id', user.id).maybeSingle(),
    ]);
    profile = p as Profile | null;
    entry = e as PickSixEntry | null;
  }

  // Fetch private leagues for entered users
  let userLeagues: { id: string; name: string; invite_code: string | null; created_by: string; member_count: number }[] = [];
  if (user && entry) {
    const admin = createAdminClient();
    const { data: memberships } = await admin
      .from('league_members')
      .select('league_id, league:leagues(id, name, type, invite_code, created_by)')
      .eq('user_id', user.id);

    const privateLeagues = (memberships ?? [])
      .map(m => m.league as { id: string; name: string; type: string; invite_code: string | null; created_by: string } | null)
      .filter((l): l is NonNullable<typeof l> => !!l && l.type === 'private');

    if (privateLeagues.length > 0) {
      const { data: allMembers } = await admin
        .from('league_members')
        .select('league_id')
        .in('league_id', privateLeagues.map(l => l.id));

      const countByLeague = (allMembers ?? []).reduce((acc, m) => {
        acc[m.league_id] = (acc[m.league_id] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      userLeagues = privateLeagues.map(l => ({
        id: l.id,
        name: l.name,
        invite_code: l.invite_code,
        created_by: l.created_by,
        member_count: countByLeague[l.id] ?? 0,
      }));
    }
  }

  return (
    <div className="min-h-screen">
      {profile && <Navbar profile={profile} />}
      <main className={`${profile ? 'pt-24' : 'pt-12'} pb-16 px-4 sm:px-6 max-w-3xl mx-auto`}>
        <PickSixClient
          profile={profile ?? undefined}
          existingEntry={entry}
          userId={user?.id}
          entryCount={entryCount ?? 0}
        />
        {entry && user && (
          <LeaguesSection
            leagues={userLeagues}
            currentUserId={user.id}
          />
        )}
      </main>
    </div>
  );
}
