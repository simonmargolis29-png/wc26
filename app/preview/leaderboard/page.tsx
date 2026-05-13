import { Star } from 'lucide-react';
import { PreviewNavbar } from '@/components/preview/PreviewNavbar';
import { mockProfile, mockLeaderboard, mockPickSixEntry } from '@/lib/mock-data';

export default function PreviewLeaderboard() {
  const myRank = mockLeaderboard.findIndex(e => e.user_id === mockProfile.id);

  return (
    <div className="min-h-screen">
      <PreviewNavbar profile={mockProfile} pickSixEntry={mockPickSixEntry} />
      <main className="pt-28 pb-16 px-4 sm:px-6 max-w-3xl mx-auto animate-fade-up">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#C9A84C' }}>My Golden Six</p>
          <h1 className="text-3xl font-black text-white mb-1">Global Leaderboard</h1>
          <p className="text-white/50 text-sm">One global league. All players ranked by total points.</p>
        </div>

        {/* Your position */}
        <div className="glass-card-navy p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #0033A0, #C9A84C)' }}>
              SM
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Your position</p>
              <p className="text-xs text-white/40">Simon Margolis</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-black" style={{ color: '#C9A84C' }}>#{myRank + 1}</p>
            <p className="text-xs text-white/40">{mockLeaderboard[myRank]?.total_points} pts</p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {mockLeaderboard.map((entry, idx) => {
              const isMe = entry.user_id === mockProfile.id;
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
              return (
                <div key={entry.id} className="flex items-center px-5 py-3.5" style={{ background: isMe ? 'rgba(0,51,160,0.1)' : 'transparent' }}>
                  <div className="w-8 text-sm font-bold text-center" style={{ color: idx < 3 ? '#C9A84C' : 'rgba(240,244,255,0.3)' }}>
                    {medal ?? `#${idx + 1}`}
                  </div>
                  <div className="flex-1 ml-3">
                    <p className="text-sm font-semibold" style={{ color: isMe ? '#C9A84C' : '#f0f4ff' }}>
                      {(entry.profile as any).first_name} {(entry.profile as any).last_name}
                      {isMe && <span className="ml-2 text-xs opacity-60">(you)</span>}
                    </p>
                    <p className="text-xs text-white/40">
                      {(entry.league as any).name} · {(entry.profile as any).country_of_residence}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: isMe ? '#C9A84C' : '#f0f4ff' }}>{entry.total_points}</p>
                    <p className="text-xs text-white/30">pts</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
