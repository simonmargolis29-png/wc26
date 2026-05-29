'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Hash, ArrowRight, Users, ChevronRight } from 'lucide-react';

interface LeagueSummary {
  id: string;
  name: string;
  invite_code: string | null;
  created_by: string;
  member_count: number;
}

interface Props {
  leagues: LeagueSummary[];
  currentUserId: string;
}

export function LeaguesSection({ leagues, currentUserId }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<null | 'create' | 'join'>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createLeague(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/leagues/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Failed to create league.'); setLoading(false); return; }
    router.push(`/my-golden-six/leagues/${data.league.id}`);
  }

  async function joinLeague(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/leagues/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Failed to join league.'); setLoading(false); return; }
    router.push(`/my-golden-six/leagues/${data.league.id}`);
  }

  function cancel() { setMode(null); setName(''); setCode(''); setError(''); }

  return (
    <div id="leagues" className="mt-10">
      <hr className="programme-rule mb-8" />
      <p className="eyebrow-red mb-2">Private Leagues</p>
      <p className="mb-6" style={{ fontSize: 14, color: 'rgba(245,241,232,0.55)', lineHeight: 1.6 }}>
        Compete against friends in a private league. Your picks and global league entry are unaffected — private leagues are purely for bragging rights.
      </p>

      {/* League list */}
      {leagues.length > 0 && (
        <div className="programme-card overflow-hidden mb-5">
          {leagues.map(league => (
            <Link
              key={league.id}
              href={`/my-golden-six/leagues/${league.id}`}
              className="flex items-center px-5 py-4 gap-4"
              style={{ borderBottom: '1px solid rgba(245,241,232,0.07)' }}
            >
              <div className="flex-1 min-w-0">
                <p className="head truncate" style={{ fontSize: 16 }}>{league.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="mono flex items-center gap-1" style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.08em' }}>
                    <Users size={10} /> {league.member_count} {league.member_count === 1 ? 'player' : 'players'}
                  </span>
                  {league.created_by === currentUserId && (
                    <span className="eyebrow" style={{ fontSize: 9, color: '#E33A3A' }}>Admin</span>
                  )}
                </div>
              </div>
              <ChevronRight size={14} style={{ color: 'rgba(245,241,232,0.3)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      )}

      {/* Action forms */}
      {mode === null && (
        <div className="flex gap-3">
          <button onClick={() => setMode('create')} className="btn-primary text-sm px-4 py-2.5">
            <Plus size={14} /> Create league
          </button>
          <button onClick={() => setMode('join')} className="btn-ghost text-sm px-4 py-2.5">
            <Hash size={14} /> Join with code
          </button>
        </div>
      )}

      {mode === 'create' && (
        <form onSubmit={createLeague} className="programme-card p-5">
          <p className="head mb-4" style={{ fontSize: 16 }}>Create a league</p>
          <div className="mb-4">
            <label>League name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. The Office League"
              required
              autoFocus
            />
          </div>
          {error && (
            <div className="mb-4 text-sm px-4 py-3 rounded-sm" style={{ background: 'rgba(206,17,38,0.1)', border: '1px solid rgba(206,17,38,0.3)', color: '#ff6b7a' }}>
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary text-sm px-4 py-2.5">
              {loading ? 'Creating...' : <>Create <ArrowRight size={13} /></>}
            </button>
            <button type="button" onClick={cancel} className="btn-ghost text-sm px-4 py-2.5">Cancel</button>
          </div>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={joinLeague} className="programme-card p-5">
          <p className="head mb-4" style={{ fontSize: 16 }}>Join a league</p>
          <div className="mb-4">
            <label>Invite code</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AB1C2D"
              maxLength={6}
              required
              autoFocus
              className="mono"
              style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}
            />
          </div>
          {error && (
            <div className="mb-4 text-sm px-4 py-3 rounded-sm" style={{ background: 'rgba(206,17,38,0.1)', border: '1px solid rgba(206,17,38,0.3)', color: '#ff6b7a' }}>
              {error}
            </div>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary text-sm px-4 py-2.5">
              {loading ? 'Joining...' : <>Join <ArrowRight size={13} /></>}
            </button>
            <button type="button" onClick={cancel} className="btn-ghost text-sm px-4 py-2.5">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
