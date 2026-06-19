import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Navbar } from '@/components/layout/Navbar';
import { Star } from 'lucide-react';
import type { Profile } from '@/types';
import { computeEntryStats } from '@/lib/entry-stats';

function computeRanks(entries: { total_points: number }[]): number[] {
  const ranks: number[] = [];
  let rank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].total_points < entries[i - 1].total_points) {
      rank = i + 1;
    }
    ranks.push(rank);
  }
  return ranks;
}

const STAT_COLS = ['P', 'W', 'D', 'L', 'G', 'PTS'] as const;

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profileResult, rankingsResult, matchesResult] = await Promise.all([
    user ? supabase.from('profiles').select('*').eq('id', user.id).single() : Promise.resolve({ data: null }),
    admin
      .from('pick_six_entries')
      .select('*, profile:profiles(first_name, last_name), league:leagues(name, type)')
      .order('total_points', { ascending: false })
      .limit(100),
    admin
      .from('matches')
      .select('home_team_code, away_team_code, home_score, away_score')
      .eq('status', 'FINISHED'),
  ]);

  const profile = profileResult.data as Profile | null;
  const pickSixRankings = rankingsResult.data ?? [];
  const finishedMatches = (matchesResult.data ?? []) as {
    home_team_code: string;
    away_team_code: string;
    home_score: number;
    away_score: number;
  }[];

  const tournamentStarted = pickSixRankings.some(
    e => ((e as { total_points?: number }).total_points ?? 0) > 0
  );

  const ranks = computeRanks(pickSixRankings as { total_points: number }[]);

  const myIdx = user
    ? pickSixRankings.findIndex(e => (e as { user_id: string }).user_id === user.id)
    : -1;

  const myRank = myIdx >= 0 ? ranks[myIdx] : null;
  const isEntered = myIdx >= 0;

  return (
    <div className="min-h-screen">
      <Navbar profile={profile ?? undefined} />
      <main className="pt-28 pb-16 px-4 sm:px-6 max-w-3xl mx-auto animate-fade-up">

        <div className="mb-10">
          <p className="eyebrow-red mb-3">§ Leaderboard</p>
          <h1 className="head" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>My Golden Six</h1>
          <hr className="programme-rule-strong mt-6 mb-4" />
          <p style={{ color: 'rgba(245,241,232,0.55)', fontSize: 15 }}>
            {tournamentStarted
              ? 'One global league. All players ranked by total points.'
              : 'One global league. Rankings go live when the first match kicks off.'}
          </p>
        </div>

        {/* Pre-tournament banner */}
        {!tournamentStarted && pickSixRankings.length > 0 && (
          <div className="programme-card p-5 mb-6 flex items-center gap-4">
            <div className="shrink-0 flex items-center justify-center" style={{
              width: 40, height: 40,
              background: 'rgba(227,58,58,0.12)',
              border: '1px solid rgba(227,58,58,0.3)',
              borderRadius: 2,
            }}>
              <Star size={18} style={{ color: '#E33A3A' }} />
            </div>
            <div>
              <p className="head" style={{ fontSize: 15 }}>Leaderboard activates 11 June</p>
              <p className="mono mt-1" style={{ fontSize: 11, color: 'rgba(245,241,232,0.45)', letterSpacing: '0.05em' }}>
                Points update after every match. Check back at kick-off.
              </p>
            </div>
          </div>
        )}

        {/* Your entry confirmed banner — pre-tournament only */}
        {!tournamentStarted && isEntered && profile && (
          <div className="programme-card p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="eyebrow mb-1" style={{ color: 'rgba(245,241,232,0.45)', fontSize: 10 }}>Your entry</p>
              <p className="head" style={{ fontSize: 20 }}>{profile.first_name} {profile.last_name}</p>
            </div>
            <span className="stamp" style={{ color: '#4ADE80' }}>Confirmed</span>
          </div>
        )}

        {/* Your position — live tournament only */}
        {tournamentStarted && myRank !== null && profile && (
          <div className="programme-card p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="eyebrow mb-1" style={{ color: 'rgba(245,241,232,0.45)', fontSize: 10 }}>Your position</p>
              <p className="head" style={{ fontSize: 20 }}>{profile.first_name} {profile.last_name}</p>
            </div>
            <div className="text-right">
              <p className="head" style={{ fontSize: 32, color: '#E33A3A' }}>#{myRank}</p>
              <p className="mono" style={{ fontSize: 12, color: 'rgba(245,241,232,0.4)' }}>
                {(pickSixRankings[myIdx] as { total_points?: number }).total_points ?? 0} pts
              </p>
            </div>
          </div>
        )}

        {/* Entrants / rankings table */}
        <div className="programme-card overflow-hidden">
          {!pickSixRankings.length ? (
            <div className="text-center py-16" style={{ color: 'rgba(245,241,232,0.3)' }}>
              <Star size={32} className="mx-auto mb-3 opacity-30" />
              <p>No entries yet. Be the first to enter My Golden Six!</p>
            </div>
          ) : tournamentStarted ? (
            /* ── Live rankings ── */
            <div>
              {/* Column headers */}
              <div className="flex items-center px-5 py-3" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
                <div className="w-10 shrink-0" />
                <div className="flex-1 ml-4 min-w-0">
                  <span className="eyebrow" style={{ fontSize: 9, color: 'rgba(245,241,232,0.35)', letterSpacing: '0.12em' }}>PLAYER</span>
                </div>
                {STAT_COLS.map(col => (
                  <div key={col} className="w-8 text-center shrink-0">
                    <span className="eyebrow" style={{ fontSize: 9, color: 'rgba(245,241,232,0.35)', letterSpacing: '0.12em' }}>{col}</span>
                  </div>
                ))}
              </div>

              {pickSixRankings.map((entry, idx) => {
                const e = entry as {
                  id: string;
                  user_id: string;
                  total_points?: number;
                  team_picks?: string[];
                  profile?: { first_name?: string; last_name?: string };
                };
                const isMe = user ? e.user_id === user.id : false;
                const rank = ranks[idx];
                const isTied = pickSixRankings.filter((_, j) => ranks[j] === rank).length > 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                const stats = computeEntryStats(e.team_picks ?? [], finishedMatches);
                const pts = e.total_points ?? 0;
                const statValues = [stats.P, stats.W, stats.D, stats.L, stats.B, pts];

                return (
                  <div
                    key={e.id}
                    className="flex items-center px-5 py-4"
                    style={{
                      borderBottom: '1px solid rgba(245,241,232,0.07)',
                      background: isMe ? 'rgba(227,58,58,0.07)' : 'transparent',
                    }}
                  >
                    <div className="w-10 shrink-0 text-center">
                      {medal
                        ? <span style={{ fontSize: 18 }}>{medal}</span>
                        : <span className="head" style={{ fontSize: 15, color: 'rgba(245,241,232,0.35)' }}>#{rank}</span>}
                    </div>
                    <div className="flex-1 ml-4 min-w-0">
                      <p className="head truncate" style={{ fontSize: 15, color: isMe ? '#E33A3A' : '#F5F1E8' }}>
                        {e.profile?.first_name} {e.profile?.last_name}
                        {isMe && <span className="mono ml-2" style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.05em' }}>you</span>}
                        {isTied && <span className="mono ml-2" style={{ fontSize: 10, color: 'rgba(245,241,232,0.3)', letterSpacing: '0.05em' }}>tied</span>}
                      </p>
                    </div>
                    {statValues.map((val, i) => {
                      const isPts = i === statValues.length - 1;
                      return (
                        <div key={i} className="w-8 text-center shrink-0">
                          <span
                            className={isPts ? 'head' : 'mono'}
                            style={{
                              fontSize: isPts ? 15 : 13,
                              color: isPts
                                ? (isMe ? '#E33A3A' : '#F5F1E8')
                                : 'rgba(245,241,232,0.55)',
                            }}
                          >
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              <div className="px-5 py-4 flex items-start gap-4 flex-wrap">
                <p className="mono" style={{ fontSize: 10, color: 'rgba(245,241,232,0.3)', letterSpacing: '0.05em' }}>
                  G = pick scored 3+ goals in a match · Tied players share combined prizes equally.
                </p>
              </div>
            </div>
          ) : (
            /* ── Pre-tournament entrant list ── */
            <div>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
                <p className="eyebrow" style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)' }}>
                  {pickSixRankings.length} {pickSixRankings.length === 1 ? 'player' : 'players'} entered
                </p>
              </div>
              {pickSixRankings.map((entry) => {
                const e = entry as {
                  id: string;
                  user_id: string;
                  profile?: { first_name?: string; last_name?: string };
                };
                const isMe = user ? e.user_id === user.id : false;
                return (
                  <div
                    key={e.id}
                    className="flex items-center px-5 py-4"
                    style={{
                      borderBottom: '1px solid rgba(245,241,232,0.07)',
                      background: isMe ? 'rgba(227,58,58,0.07)' : 'transparent',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="head truncate" style={{ fontSize: 16, color: isMe ? '#E33A3A' : '#F5F1E8' }}>
                        {e.profile?.first_name} {e.profile?.last_name}
                        {isMe && <span className="mono ml-2" style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.05em' }}>you</span>}
                      </p>
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: 'rgba(245,241,232,0.3)', letterSpacing: '0.05em' }}>Entered</span>
                  </div>
                );
              })}
              <div className="px-5 py-4">
                <p className="mono" style={{ fontSize: 10, color: 'rgba(245,241,232,0.3)', letterSpacing: '0.05em' }}>
                  Rankings and points go live at kick-off · 11 June 2026
                </p>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
