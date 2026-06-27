import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { SweepstakeClient } from '@/components/sweepstake/SweepstakeClient';
import type { Profile, Sweepstake, SweepstakeEntry } from '@/types';

export default async function SweepstakePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Anonymous users see the sweepstake details and can enter — they'll be
  // asked to register before payment.
  const { data: sweepstake } = await supabase
    .from('sweepstakes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  let profile: Profile | null = null;
  let entry: SweepstakeEntry | null = null;
  if (user) {
    const [{ data: p }, { data: e }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('sweepstake_entries').select('*').eq('user_id', user.id).maybeSingle(),
    ]);
    profile = p as Profile | null;
    entry = e as SweepstakeEntry | null;
  }

  const [{ count }, { data: eliminatedData }] = await Promise.all([
    supabase.from('sweepstake_entries').select('*', { count: 'exact', head: true }).eq('sweepstake_id', sweepstake?.id ?? ''),
    supabase.from('eliminated_teams').select('team_code'),
  ]);

  const eliminatedTeams = (eliminatedData ?? []).map((r: { team_code: string }) => r.team_code);

  return (
    <div className="min-h-screen">
      {profile && <Navbar profile={profile} />}
      <main className={`${profile ? 'pt-24' : 'pt-12'} pb-16 px-4 sm:px-6 max-w-3xl mx-auto`}>
        <SweepstakeClient
          profile={profile ?? undefined}
          sweepstake={sweepstake as Sweepstake | null}
          existingEntry={entry}
          entryCount={count ?? 0}
          userId={user?.id}
          eliminatedTeams={eliminatedTeams}
        />
      </main>
    </div>
  );
}
