import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/Navbar';
import { Star } from 'lucide-react';
import type { Profile } from '@/types';

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

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [profileResult, rankingsResult] = await Promise.all([
    user ? supabase.from('profiles').select('*').eq('id', user.id).single() : Promise.resolve({ data: null }),
    supabase
      .from('pick_six_entries')
      .select('*, profile:profiles(first_name, last_name), league:leagues(name, type)')
      .order('total_points', { ascending: false })
      .limit(100),
  ]);

  const profile = profileResult.data as Profile | null;
  const pickSixRankings = rankingsResult.data ?? [];
  const ranks = computeRanks(pickSixRankings as { total_points: number }[]);

  const myIdx = user
    ? pickSixRankings.findIndex(e => (e as { user_id: string }).user_id === user.id)
    : -1;

  const myRank = myIdx >= 0 ? ranks[myIdx] : null;

  return (
    <div className="min-h-screen">
      <Navbar profile={profile ?? undefined} />
      <main className="pt-28 pb-16 px-4 sm:px-6 max-w-3xl mx-auto animate-fade-up">

        <div className="mb-10">
          <p className="eyebrow-red mb-3">§ Leaderboard</p>
          <h1 className="head" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>My Golden Six</h1>
          <hr className="programme-rule-strong mt-6 mb-4" />
          <p style={{ color: 'rgba(245,241,232,0.55)', fontSize: 15 }}>
            One global league. All players ranked by total points.
          </p>
        </div>

        {/* Your position — only when logged in and entered */}
        {myRank !== null && profile && (
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

        {/* Rankings table */}
        <div className="programme-card overflow-hidden">
          {!pickSixRankings.length ? (
            <div className="text-center py-16" style={{ color: 'rgba(245,241,232,0.3)' }}>
              <Star size={32} className="mx-auto mb-3 opacity-30" />
              <p>No entries yet. Be the first to enter My Golden Six!</p>
            </div>
          ) : (
            <div>
              {pickSixRankings.map((entry, idx) => {
                const e = entry as {
                  id: string;
                  user_id: string;
                  total_points?: number;
                  profile?: { first_name?: string; last_name?: string };
                  league?: { name?: string };
                };
                const isMe = user ? e.user_id === user.id : false;
                const rank = ranks[idx];
                const isTied = pickSixRankings.filter((_, j) => ranks[j] === rank).length > 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

                return (
                  <div
                    key={e.id}
                    className="flex items-center px-5 py-4"
                    style={{
                      borderBottom: '1px solid rgba(245,241,232,0.07)',
                      background: isMe ? 'rgba(227,58,58,0.07)' : 'transparent',
                    }}
                  >
                    {/* Rank */}
                    <div className="w-10 shrink-0 text-center">
                      {medal
                        ? <span style={{ fontSize: 18 }}>{medal}</span>
                        : <span className="head" style={{ fontSize: 15, color: 'rgba(245,241,232,0.35)' }}>#{rank}</span>}
                    </div>

                    {/* Name + league */}
                    <div className="flex-1 ml-4 min-w-0">
                      <p className="head truncate" style={{ fontSize: 16, color: isMe ? '#E33A3A' : '#F5F1E8' }}>
                        {e.profile?.first_name} {e.profile?.last_name}
                        {isMe && <span className="mono ml-2" style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.05em' }}>you</span>}
                        {isTied && <span className="mono ml-2" style={{ fontSize: 10, color: 'rgba(245,241,232,0.3)', letterSpacing: '0.05em' }}>tied</span>}
                      </p>
                      <p className="eyebrow mt-0.5" style={{ fontSize: 10, color: 'rgba(245,241,232,0.35)' }}>
                        Global League
                      </p>
                    </div>

                    {/* Points */}
                    <div className="text-right ml-4">
                      <p className="head" style={{ fontSize: 18, color: isMe ? '#E33A3A' : '#F5F1E8' }}>
                        {e.total_points ?? 0}
                      </p>
                      <p className="eyebrow" style={{ fontSize: 10, color: 'rgba(245,241,232,0.35)' }}>pts</p>
                    </div>
                  </div>
                );
              })}

              <div className="px-5 py-4">
                <p className="mono" style={{ fontSize: 10, color: 'rgba(245,241,232,0.3)', letterSpacing: '0.05em' }}>
                  Tied players share the combined prizes for their positions equally.
                </p>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
