import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PreviewNavbar } from '@/components/preview/PreviewNavbar';
import { mockProfile, mockPickSixEntry, mockSweepstakeEntryWithTeam } from '@/lib/mock-data';
import { wc2026Teams } from '@/data/wc2026-teams';

export default function PreviewDashboard() {
  const assignedTeam = wc2026Teams.find(t => t.code === mockSweepstakeEntryWithTeam.team_code);

  return (
    <div className="min-h-screen">
      <PreviewNavbar profile={mockProfile} pickSixEntry={mockPickSixEntry} />
      <main className="pt-28 pb-16 px-4 sm:px-6 max-w-3xl mx-auto animate-fade-up">

        <div className="mb-10">
          <p className="eyebrow-red mb-3">§ Dashboard</p>
          <h1 className="head" style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
            Welcome back, {mockProfile.first_name}.
          </h1>
          <hr className="programme-rule-strong mt-5 mb-4" />
          <p style={{ color: 'rgba(245,241,232,0.6)', fontSize: 15 }}>
            Tournament kicks off <strong style={{ color: '#F5F1E8' }}>11 June 2026</strong>. Both entries confirmed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          {/* Sweepstake card */}
          <div className="programme-card p-6">
            <div className="flex items-baseline justify-between mb-4">
              <p className="eyebrow-red">Game 01</p>
              <span className="stamp" style={{ color: '#4ADE80' }}>Entered</span>
            </div>
            <p className="head mb-4" style={{ fontSize: 22 }}>Sweepstake</p>
            <hr className="programme-rule mb-4" />
            {assignedTeam ? (
              <div className="flex items-center gap-3 mb-4">
                <span style={{ fontSize: 36, lineHeight: 1 }}>{assignedTeam.flag_emoji}</span>
                <div>
                  <p className="head" style={{ fontSize: 18 }}>{assignedTeam.name}</p>
                  <p className="eyebrow mt-0.5" style={{ color: 'rgba(245,241,232,0.5)', fontSize: 10 }}>Drawn 9 June</p>
                </div>
              </div>
            ) : (
              <p className="text-sm mb-4" style={{ color: 'rgba(245,241,232,0.6)' }}>
                Team drawn on 9 June. Check back after the draw.
              </p>
            )}
            <Link href="/preview/sweepstake-entered" className="eyebrow flex items-center gap-2" style={{ color: 'rgba(245,241,232,0.5)', fontSize: 11 }}>
              View entry <ArrowRight size={11} />
            </Link>
          </div>

          {/* My Golden Six card */}
          <div className="programme-card p-6">
            <div className="flex items-baseline justify-between mb-4">
              <p className="eyebrow-red">Game 02</p>
              <span className="stamp" style={{ color: '#E33A3A' }}>{mockPickSixEntry.total_points} pts</span>
            </div>
            <p className="head mb-4" style={{ fontSize: 22 }}>My Golden Six</p>
            <hr className="programme-rule mb-4" />
            <div className="flex flex-wrap gap-1.5 mb-4">
              {mockPickSixEntry.team_picks.map(code => {
                const team = wc2026Teams.find(t => t.code === code);
                return (
                  <span key={code} className="mono" style={{ fontSize: 11, padding: '3px 8px', border: '1px solid rgba(245,241,232,0.2)', borderRadius: 2, color: '#F5F1E8', letterSpacing: '0.06em' }}>
                    {team?.flag_emoji} {team?.name}
                  </span>
                );
              })}
            </div>
            <Link href="/preview/pick-six-entered" className="eyebrow flex items-center gap-2" style={{ color: 'rgba(245,241,232,0.5)', fontSize: 11 }}>
              View squad <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        {/* Tournament info strip */}
        <div className="programme-card p-5 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {[
              ['Kick-off', '11 June 2026'],
              ['Draw', '9 June 2026'],
              ['Final', '19 July 2026'],
              ['Matches', '104'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="eyebrow" style={{ color: 'rgba(245,241,232,0.45)', fontSize: 10 }}>{label}</p>
                <p className="head mt-1" style={{ fontSize: 16 }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Preview nav */}
        <div className="programme-card p-5">
          <p className="eyebrow mb-3" style={{ color: 'rgba(245,241,232,0.4)' }}>Preview other screens</p>
          <div className="flex flex-wrap gap-2">
            {[
              ['/preview/sweepstake-entered', 'Sweepstake'],
              ['/preview/pick-six-entered', 'My Golden Six'],
              ['/preview/leaderboard', 'Leaderboard'],
              ['/preview/account', 'Account'],
              ['/preview/admin', 'Admin'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="eyebrow" style={{ fontSize: 11, padding: '5px 12px', border: '1px solid rgba(245,241,232,0.18)', borderRadius: 2, color: 'rgba(245,241,232,0.6)' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
