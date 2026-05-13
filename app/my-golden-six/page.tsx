import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { PickSixClient } from '@/components/pick-six/PickSixClient';
import type { Profile, PickSixEntry } from '@/types';

export default async function MyGoldenSixPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  let entry: PickSixEntry | null = null;

  // Use an RPC so anonymous visitors also get the count (RLS blocks direct reads).
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
      </main>
    </div>
  );
}
