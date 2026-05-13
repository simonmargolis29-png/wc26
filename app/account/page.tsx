import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { AccountClient } from '@/components/account/AccountClient';
import type { Profile } from '@/types';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) redirect('/auth/login');
  return (
    <div className="min-h-screen">
      <Navbar profile={profile as Profile} />
      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-xl mx-auto">
        <AccountClient profile={profile as Profile} />
      </main>
    </div>
  );
}
