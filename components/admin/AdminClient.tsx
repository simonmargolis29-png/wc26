'use client';

import { useState } from 'react';
import { Users, Trophy, Star, Globe, TrendingUp, DollarSign, CheckCircle2, Clock, Shuffle, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { teamsByCode } from '@/data/wc2026-teams';
import type { Profile } from '@/types';

interface Props {
  totalUsers: number;
  sweepEntries: number;
  pickSixEntries: number;
  paidSweepCount: number;
  paidPickSixCount: number;
  revenue: number;
  allProfiles: Profile[];
  allSweepEntries: Record<string, unknown>[];
  allPickSixEntries: Record<string, unknown>[];
  countryCount: Record<string, number>;
  teamPickCount: Record<string, number>;
  sweepstakeId: string | null;
  sweepstakeDrawn: boolean;
}

type Tab = 'overview' | 'sweepstake' | 'picksix' | 'users';

export function AdminClient({
  totalUsers, sweepEntries, pickSixEntries,
  paidSweepCount, paidPickSixCount, revenue,
  allProfiles, allSweepEntries, allPickSixEntries,
  countryCount, teamPickCount,
  sweepstakeDrawn,
}: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [drawConfirm, setDrawConfirm] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const supabase = createClient();

  async function runDraw() {
    setDrawing(true);
    setDrawError(null);
    try {
      const res = await fetch('/api/run-draw', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setDrawError(data.error ?? 'Draw failed — please try again');
        setDrawing(false);
      } else {
        window.location.reload();
      }
    } catch {
      setDrawError('Network error — please try again');
      setDrawing(false);
    }
  }

  const profileById = Object.fromEntries(allProfiles.map(p => [p.id, p]));

  async function markPaid(table: string, id: string) {
    await supabase.from(table).update({ payment_status: 'paid' }).eq('id', id);
    window.location.reload();
  }

  const topTeams = Object.entries(teamPickCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topCountries = Object.entries(countryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'sweepstake', label: 'Sweepstake' },
    { key: 'picksix', label: 'My Golden Six' },
    { key: 'users', label: 'Users' },
  ];

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#CE1126' }}>Admin</p>
        <h1 className="text-3xl font-black text-white mb-1">Dashboard</h1>
        <p className="text-white/50 text-sm">kickoff26 game metrics and management.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: tab === t.key ? 'rgba(0,51,160,0.25)' : 'transparent', color: tab === t.key ? '#C9A84C' : 'rgba(240,244,255,0.5)', border: tab === t.key ? '1px solid rgba(0,51,160,0.35)' : '1px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total users', value: totalUsers, icon: Users, color: '#C9A84C' },
              { label: 'Revenue collected', value: `£${revenue}`, icon: DollarSign, color: '#4ade80' },
              { label: 'Sweepstake entries', value: sweepEntries, icon: Trophy, color: '#C9A84C' },
              { label: 'My Golden Six entries', value: pickSixEntries, icon: Star, color: '#C9A84C' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass-card p-5">
                <Icon size={18} className="mb-3" style={{ color }} />
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Geographic distribution */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><Globe size={15} style={{ color: '#C9A84C' }} /> Players by country</h3>
              <div className="space-y-2">
                {topCountries.map(([country, count]) => (
                  <div key={country} className="flex items-center gap-3">
                    <span className="text-xs text-white/60 w-32 truncate">{country}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(count / totalUsers) * 100}%`, background: 'linear-gradient(90deg, #0033A0, #C9A84C)' }} />
                    </div>
                    <span className="text-xs font-semibold text-white/60 w-4 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most picked teams */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp size={15} style={{ color: '#C9A84C' }} /> Most picked teams (My Golden Six)</h3>
              {topTeams.length === 0 ? (
                <p className="text-xs text-white/30">No entries yet</p>
              ) : (
                <div className="space-y-2">
                  {topTeams.map(([code, count]) => {
                    const team = teamsByCode[code];
                    return (
                      <div key={code} className="flex items-center gap-2">
                        <span className="text-base">{team?.flag_emoji}</span>
                        <span className="text-xs text-white/60 flex-1">{team?.name ?? code}</span>
                        <span className="text-xs font-bold text-white/80">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {tab === 'sweepstake' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-5"><p className="text-2xl font-black text-white">{sweepEntries}</p><p className="text-xs text-white/40">Total entries</p></div>
            <div className="glass-card p-5"><p className="text-2xl font-black" style={{ color: '#4ade80' }}>{paidSweepCount}</p><p className="text-xs text-white/40">Paid</p></div>
            <div className="glass-card p-5"><p className="text-2xl font-black" style={{ color: '#CE1126' }}>{sweepEntries - paidSweepCount}</p><p className="text-xs text-white/40">Pending payment</p></div>
          </div>

          {/* Draw control */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-white flex items-center gap-2"><Shuffle size={15} style={{ color: '#C9A84C' }} /> Run the draw</p>
              {sweepstakeDrawn && <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>Draw complete</span>}
            </div>
            {sweepstakeDrawn ? (
              <p className="text-xs text-white/40">Teams have been assigned. Results are visible to each player on their sweepstake page.</p>
            ) : (
              <>
                <p className="text-xs text-white/40 mb-4">Randomly assigns 2 teams to each paid entrant ({paidSweepCount} paid). This cannot be undone.</p>
                {drawError && (
                  <div className="flex items-center gap-2 text-xs mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(206,17,38,0.1)', color: '#CE1126' }}>
                    <AlertTriangle size={12} /> {drawError}
                  </div>
                )}
                {!drawConfirm ? (
                  <button
                    onClick={() => setDrawConfirm(true)}
                    disabled={paidSweepCount === 0}
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all disabled:opacity-40"
                    style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}
                  >
                    <Shuffle size={14} /> Run draw for {paidSweepCount} paid {paidSweepCount === 1 ? 'entry' : 'entries'}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-xs font-semibold" style={{ color: '#CE1126' }}>Are you sure? This cannot be undone.</p>
                    <button
                      onClick={runDraw}
                      disabled={drawing}
                      className="text-sm font-bold px-4 py-2 rounded-lg transition-all"
                      style={{ background: '#CE1126', color: '#fff' }}
                    >
                      {drawing ? 'Running…' : 'Confirm draw'}
                    </button>
                    <button
                      onClick={() => setDrawConfirm(false)}
                      className="text-sm px-3 py-2 rounded-lg text-white/50 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold text-white">All entries</p>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {allSweepEntries.map((entry) => {
                const e = entry as { id: string; user_id?: string; team_code?: string; team_code_2?: string; payment_status?: string };
                const profile = profileById[e.user_id ?? ''];
                return (
                  <div key={e.id} className="flex items-center px-5 py-3 gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-white">{profile?.first_name} {profile?.last_name}</p>
                      <p className="text-xs text-white/40">{profile?.email}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      {e.team_code ? (
                        <>
                          <span className="text-sm">{teamsByCode[e.team_code]?.flag_emoji} {teamsByCode[e.team_code]?.name}</span>
                          {e.team_code_2 && <span className="text-sm">{teamsByCode[e.team_code_2]?.flag_emoji} {teamsByCode[e.team_code_2]?.name}</span>}
                        </>
                      ) : (
                        <span className="text-xs text-white/30">Not yet drawn</span>
                      )}
                    </div>
                    <div>
                      {e.payment_status === 'paid' ? (
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
                          <CheckCircle2 size={10} /> Paid
                        </span>
                      ) : (
                        <button onClick={() => markPaid('sweepstake_entries', e.id)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
                          <Clock size={10} /> Mark paid
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'picksix' && (
        <div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-5"><p className="text-2xl font-black text-white">{pickSixEntries}</p><p className="text-xs text-white/40">Total entries</p></div>
            <div className="glass-card p-5"><p className="text-2xl font-black" style={{ color: '#4ade80' }}>{paidPickSixCount}</p><p className="text-xs text-white/40">Paid</p></div>
            <div className="glass-card p-5"><p className="text-2xl font-black" style={{ color: '#CE1126' }}>{pickSixEntries - paidPickSixCount}</p><p className="text-xs text-white/40">Pending payment</p></div>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-sm font-semibold text-white">Rankings</p>
            </div>
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {allPickSixEntries.map((entry, idx) => {
                const e = entry as { id: string; user_id?: string; total_points?: number; payment_status?: string; team_picks?: string[]; league?: { name?: string } };
                const profile = profileById[e.user_id ?? ''];
                return (
                  <div key={e.id} className="flex items-center px-5 py-3 gap-4">
                    <span className="text-sm font-bold w-6 text-center" style={{ color: idx < 3 ? '#C9A84C' : 'rgba(240,244,255,0.3)' }}>#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm text-white">{profile?.first_name} {profile?.last_name}</p>
                      <p className="text-xs text-white/40">{e.league?.name} · {profile?.country_of_residence}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(e.team_picks ?? []).map((code: string) => (
                          <span key={code} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(240,244,255,0.6)' }}>
                            {teamsByCode[code]?.flag_emoji} {teamsByCode[code]?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black" style={{ color: '#C9A84C' }}>{e.total_points}</p>
                      <p className="text-xs text-white/30">pts</p>
                    </div>
                    <div>
                      {e.payment_status === 'paid' ? (
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
                          <CheckCircle2 size={10} /> Paid
                        </span>
                      ) : (
                        <button onClick={() => markPaid('pick_six_entries', e.id)} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
                          <Clock size={10} /> Mark paid
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-semibold text-white">All users ({totalUsers})</p>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {allProfiles.map((p: Profile) => (
              <div key={p.id} className="flex items-center px-5 py-3 gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg, #0033A0, #C9A84C)' }}>
                  {p.first_name[0]}{p.last_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-white/40 truncate">{p.email} · {p.country_of_residence}</p>
                </div>
                <p className="text-xs text-white/30">{new Date(p.created_at).toLocaleDateString('en-GB')}</p>
                {p.is_admin && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(206,17,38,0.15)', color: '#CE1126' }}>Admin</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
