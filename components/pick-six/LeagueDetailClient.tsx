'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, Check, ArrowLeft, UserMinus, LogOut } from 'lucide-react';
import { teamsByCode } from '@/data/wc2026-teams';

interface Member {
  user_id: string;
  first_name: string;
  last_name: string;
  total_points: number;
  team_picks: string[];
}

interface Props {
  leagueId: string;
  leagueName: string;
  inviteCode: string;
  isCreator: boolean;
  currentUserId: string;
  members: Member[];
  tournamentStarted: boolean;
}

export function LeagueDetailClient({
  leagueId, leagueName, inviteCode, isCreator, currentUserId, members, tournamentStarted,
}: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [ejecting, setEjecting] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState('');

  function copyCode() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function ejectMember(userId: string, name: string) {
    if (!confirm(`Remove ${name} from this league?`)) return;
    setEjecting(userId);
    setError('');
    const res = await fetch(`/api/leagues/${leagueId}/eject`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to remove member.');
    } else {
      router.refresh();
    }
    setEjecting(null);
  }

  async function leaveLeague() {
    if (!confirm('Leave this league?')) return;
    setLeaving(true);
    setError('');
    const res = await fetch(`/api/leagues/${leagueId}/leave`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Failed to leave league.');
      setLeaving(false);
    } else {
      router.push('/my-golden-six');
    }
  }

  const sorted = [...members].sort((a, b) => b.total_points - a.total_points);

  return (
    <div className="animate-fade-up">

      {/* Header */}
      <div className="mb-8">
        <Link href="/my-golden-six" className="flex items-center gap-2 mb-6 eyebrow" style={{ color: 'rgba(245,241,232,0.4)', fontSize: 11 }}>
          <ArrowLeft size={12} /> My Golden Six
        </Link>
        <p className="eyebrow-red mb-2">Private League</p>
        <h1 className="head" style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}>{leagueName}</h1>
        <hr className="programme-rule-strong mt-4 mb-4" />
      </div>

      {/* Invite code card */}
      <div className="programme-card p-5 mb-6">
        <p className="eyebrow mb-3" style={{ color: 'rgba(245,241,232,0.45)', fontSize: 10 }}>
          {isCreator ? 'Share this code to invite players' : 'League code'}
        </p>
        <div className="flex items-center justify-between">
          <span className="head" style={{ fontSize: 32, letterSpacing: '0.12em', color: '#E33A3A' }}>{inviteCode}</span>
          <button onClick={copyCode} className="flex items-center gap-2 eyebrow" style={{ color: copied ? '#4ADE80' : 'rgba(245,241,232,0.6)', fontSize: 11 }}>
            {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
      </div>

      {/* Members / leaderboard */}
      <div className="programme-card overflow-hidden mb-6">
        <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
          <p className="eyebrow" style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)' }}>
            {members.length} {members.length === 1 ? 'player' : 'players'} · {tournamentStarted ? 'Live standings' : 'Rankings go live 11 June'}
          </p>
        </div>

        {sorted.map((member, idx) => {
          const isMe = member.user_id === currentUserId;
          return (
            <div
              key={member.user_id}
              className="flex items-center px-5 py-4 gap-4"
              style={{
                borderBottom: '1px solid rgba(245,241,232,0.07)',
                background: isMe ? 'rgba(227,58,58,0.07)' : 'transparent',
              }}
            >
              {tournamentStarted && (
                <span className="head w-6 text-center shrink-0" style={{ fontSize: 14, color: 'rgba(245,241,232,0.35)' }}>
                  #{idx + 1}
                </span>
              )}
              <div className="flex-1 min-w-0">
                <p className="head truncate" style={{ fontSize: 16, color: isMe ? '#E33A3A' : '#F5F1E8' }}>
                  {member.first_name} {member.last_name}
                  {isMe && <span className="mono ml-2" style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.05em' }}>you</span>}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {member.team_picks.map(code => (
                    <span key={code} className="mono" style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.04em' }}>
                      {teamsByCode[code]?.flag_emoji} {teamsByCode[code]?.name}
                    </span>
                  ))}
                </div>
              </div>
              {tournamentStarted && (
                <div className="text-right shrink-0">
                  <p className="head" style={{ fontSize: 18, color: isMe ? '#E33A3A' : '#F5F1E8' }}>{member.total_points}</p>
                  <p className="eyebrow" style={{ fontSize: 10, color: 'rgba(245,241,232,0.35)' }}>pts</p>
                </div>
              )}
              {isCreator && !isMe && (
                <button
                  onClick={() => ejectMember(member.user_id, `${member.first_name} ${member.last_name}`)}
                  disabled={ejecting === member.user_id}
                  className="shrink-0 flex items-center gap-1.5 mono"
                  style={{ fontSize: 10, color: 'rgba(245,241,232,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
                >
                  <UserMinus size={12} />
                  {ejecting === member.user_id ? '...' : 'Eject'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-sm text-sm" style={{ background: 'rgba(206,17,38,0.1)', border: '1px solid rgba(206,17,38,0.3)', color: '#ff6b7a' }}>
          {error}
        </div>
      )}

      {/* Leave league (non-creators only) */}
      {!isCreator && (
        <button
          onClick={leaveLeague}
          disabled={leaving}
          className="flex items-center gap-2 mono"
          style={{ fontSize: 11, color: 'rgba(245,241,232,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          <LogOut size={12} /> {leaving ? 'Leaving...' : 'Leave league'}
        </button>
      )}
    </div>
  );
}
