import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import type { Profile } from '@/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) redirect('/auth/login');

  return (
    <div className="min-h-screen">
      <Navbar profile={profile as Profile} />
      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
        {children}
      </main>
    </div>
  );
}
