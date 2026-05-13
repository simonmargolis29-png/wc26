import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { AdminClient } from '@/components/admin/AdminClient';
import type { Profile } from '@/types';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || !(profile as Profile).is_admin) redirect('/dashboard');

  const [
    { count: totalUsers },
    { count: sweepEntries },
    { count: pickSixEntries },
    { data: allProfiles },
    { data: allSweepEntries },
    { data: allPickSixEntries },
    { data: countryStats },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('sweepstake_entries').select('*', { count: 'exact', head: true }),
    supabase.from('pick_six_entries').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('sweepstake_entries').select('*, profile:profiles(first_name, last_name, email), sweepstake:sweepstakes(name)'),
    supabase.from('pick_six_entries').select('*, profile:profiles(first_name, last_name, country_of_residence), league:leagues(name, type)').order('total_points', { ascending: false }),
    supabase.from('profiles').select('country_of_residence'),
  ]);

  // Calculate country distribution
  const countryCount: Record<string, number> = {};
  (countryStats ?? []).forEach((p: { country_of_residence?: string }) => {
    if (p.country_of_residence) {
      countryCount[p.country_of_residence] = (countryCount[p.country_of_residence] ?? 0) + 1;
    }
  });

  // Calculate team pick frequency for Pick Six
  const teamPickCount: Record<string, number> = {};
  (allPickSixEntries ?? []).forEach((e: { team_picks?: string[] }) => {
    (e.team_picks ?? []).forEach((code: string) => {
      teamPickCount[code] = (teamPickCount[code] ?? 0) + 1;
    });
  });

  const paidSweepCount = (allSweepEntries ?? []).filter((e: { payment_status?: string }) => e.payment_status === 'paid').length;
  const paidPickSixCount = (allPickSixEntries ?? []).filter((e: { payment_status?: string }) => e.payment_status === 'paid').length;
  const revenue = (paidSweepCount * 5) + (paidPickSixCount * 10);

  return (
    <div className="min-h-screen">
      <Navbar profile={profile as Profile} />
      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <AdminClient
          totalUsers={totalUsers ?? 0}
          sweepEntries={sweepEntries ?? 0}
          pickSixEntries={pickSixEntries ?? 0}
          paidSweepCount={paidSweepCount}
          paidPickSixCount={paidPickSixCount}
          revenue={revenue}
          allProfiles={(allProfiles ?? []) as Profile[]}
          allSweepEntries={allSweepEntries ?? []}
          allPickSixEntries={allPickSixEntries ?? []}
          countryCount={countryCount}
          teamPickCount={teamPickCount}
        />
      </main>
    </div>
  );
}
