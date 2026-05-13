import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Trophy, Star, ArrowRight, Clock } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const { data: sweepEntry } = await supabase
    .from('sweepstake_entries')
    .select('*, sweepstake:sweepstakes(*)')
    .eq('user_id', user.id)
    .maybeSingle();
  const { data: pickSixEntry } = await supabase
    .from('pick_six_entries')
    .select('*, league:leagues(*)')
    .eq('user_id', user.id)
    .maybeSingle();
  const { data: sweepstake } = await supabase
    .from('sweepstakes')
    .select('*, entry_count:sweepstake_entries(count)')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const entryCount = (sweepstake as { entry_count?: { count: number }[] } | null)?.entry_count?.[0]?.count ?? 0;

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Welcome back, {profile?.first_name} 👋
        </h1>
        <p className="text-white/50">World Cup 2026 kicks off 11 June — get your entries in.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Sweepstake card */}
        <div className="glass-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,51,160,0.2)', border: '1px solid rgba(0,51,160,0.35)' }}>
              <Trophy size={18} style={{ color: '#C9A84C' }} />
            </div>
            {sweepEntry ? (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                Entered
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
                {entryCount}/{(sweepstake as { max_players?: number } | null)?.max_players ?? 48} places
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Sweepstake</h2>
          <p className="text-sm text-white/50 mb-5 leading-relaxed">
            {sweepEntry
              ? sweepEntry.team_code
                ? `Your team will be revealed after the draw on 9 June.`
                : 'Draw on 9 June 2026'
              : 'Join 48 players for a random World Cup team draw on 9 June.'}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/40 flex items-center gap-1.5">
              <Clock size={12} /> Draw: 9 June 2026
            </div>
            {sweepEntry ? (
              <Link href="/sweepstake" className="btn-ghost text-sm px-4 py-2">View entry <ArrowRight size={13} /></Link>
            ) : (
              <Link href="/sweepstake" className="btn-primary text-sm px-4 py-2">Enter — £5 <ArrowRight size={13} /></Link>
            )}
          </div>
        </div>

        {/* My Golden Six card */}
        <div className="glass-card p-6" style={{ border: '1px solid rgba(201,168,76,0.15)' }}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)' }}>
              <Star size={18} style={{ color: '#C9A84C' }} />
            </div>
            {pickSixEntry ? (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}>
                {(pickSixEntry as { total_points?: number }).total_points ?? 0} pts
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
                Open
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-white mb-1">My Golden Six</h2>
          <p className="text-sm text-white/50 mb-5 leading-relaxed">
            {pickSixEntry
              ? `Tracking ${(pickSixEntry as { team_picks?: string[] }).team_picks?.length ?? 0} teams in the Global League.`
              : 'Pick 6 teams and earn points across the whole tournament.'}
          </p>
          <div className="flex items-center justify-between">
            <div className="text-xs text-white/40">
              Win 3pts · Draw 1pt · 3+ goals +1pt
            </div>
            {pickSixEntry ? (
              <Link href="/my-golden-six" className="btn-ghost text-sm px-4 py-2">View <ArrowRight size={13} /></Link>
            ) : (
              <Link href="/my-golden-six" className="btn-gold text-sm px-4 py-2">Enter — £10 <ArrowRight size={13} /></Link>
            )}
          </div>
        </div>
      </div>

      {/* Tournament countdown */}
      <div className="glass-card-navy p-6 mt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#C9A84C' }}>Tournament begins</p>
            <p className="text-2xl font-bold text-white">11 June 2026</p>
            <p className="text-sm text-white/40 mt-0.5">USA · Canada · Mexico</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40 mb-1">104 matches</p>
            <p className="text-xs text-white/40">48 nations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
