'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, SweepstakeEntry, PickSixEntry } from '@/types';
import { teamsByCode } from '@/data/wc2026-teams';

interface NavbarProps {
  profile?: Profile;
}

export function Navbar({ profile }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [myTeamsOpen, setMyTeamsOpen] = useState(false);
  const [sweepEntries, setSweepEntries] = useState<SweepstakeEntry[]>([]);
  const [pickSixEntry, setPickSixEntry] = useState<PickSixEntry | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const myTeamsRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!profile) return;
    async function loadTeams() {
      const { data: sweep } = await supabase
        .from('sweepstake_entries')
        .select('*, sweepstake:sweepstakes(name)')
        .eq('user_id', profile!.id);
      if (sweep) setSweepEntries(sweep as SweepstakeEntry[]);

      const { data: pick } = await supabase
        .from('pick_six_entries')
        .select('*')
        .eq('user_id', profile!.id)
        .single();
      if (pick) setPickSixEntry(pick as PickSixEntry);
    }
    loadTeams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (myTeamsRef.current && !myTeamsRef.current.contains(e.target as Node)) setMyTeamsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  const initials = profile ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : '';
  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : '';

  const navLinks: { href: string; label: string }[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];

  if (profile?.is_admin) {
    navLinks.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{
      background: 'rgba(10,22,40,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(245,241,232,0.14)',
    }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 sm:px-6 h-16">

        {/* Logo */}
        <Link href={profile ? '/dashboard' : '/'} className="flex items-center gap-2.5">
          <div className="flex items-center justify-center" style={{ width: 28, height: 28, background: '#E33A3A', borderRadius: 2 }}>
            <span className="head" style={{ fontSize: 14, color: '#F5F1E8' }}>K</span>
          </div>
          <span className="head" style={{ fontSize: 14, color: '#F5F1E8' }}>Kickoff26</span>
        </Link>

        {/* Centre nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* My Teams dropdown — only for authenticated users */}
          {profile && <div ref={myTeamsRef} className="relative">
            <button
              onClick={() => setMyTeamsOpen(o => !o)}
              className="flex items-center gap-1.5 mono"
              style={{
                color: myTeamsOpen ? '#E33A3A' : 'rgba(245,241,232,0.7)',
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                padding: '8px 14px',
              }}
            >
              My teams
              <ChevronDown size={11} style={{ transform: myTeamsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {myTeamsOpen && (
              <div className="absolute top-full mt-2 left-0 w-80 p-5 z-50" style={{
                background: '#111E36',
                border: '1px solid rgba(245,241,232,0.18)',
                borderRadius: 3,
                boxShadow: '4px 4px 0 #E33A3A, 0 16px 48px rgba(0,0,0,0.4)',
              }}>
                {sweepEntries.length === 0 && !pickSixEntry ? (
                  <p className="mono" style={{ fontSize: 11, color: 'rgba(245,241,232,0.45)', textAlign: 'center', padding: '8px 0', letterSpacing: '0.05em' }}>
                    You haven&apos;t entered any games yet.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {sweepEntries.map(e => (
                      <div key={e.id}>
                        <p className="eyebrow-red mb-2">Sweepstake</p>
                        {e.team_code ? (
                          <div className="flex items-center gap-2.5">
                            <span style={{ fontSize: 18 }}>{teamsByCode[e.team_code]?.flag_emoji}</span>
                            <span className="head" style={{ fontSize: 15 }}>{teamsByCode[e.team_code]?.name ?? e.team_code}</span>
                          </div>
                        ) : (
                          <p className="mono" style={{ fontSize: 11, color: 'rgba(245,241,232,0.45)', letterSpacing: '0.05em' }}>
                            Draw not yet taken place
                          </p>
                        )}
                      </div>
                    ))}
                    {pickSixEntry && (
                      <div>
                        <div>
                          <p className="eyebrow-red mb-2">Squad Six · <span style={{ color: '#F5F1E8' }}>{pickSixEntry.total_points} pts</span></p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {pickSixEntry.team_picks.map(code => (
                            <span key={code} className="flex items-center gap-1.5 mono" style={{
                              fontSize: 11,
                              padding: '4px 8px',
                              background: 'rgba(245,241,232,0.05)',
                              border: '1px solid rgba(245,241,232,0.12)',
                              borderRadius: 2,
                              color: 'rgba(245,241,232,0.85)',
                              letterSpacing: '0.05em',
                            }}>
                              <span style={{ fontSize: 12 }}>{teamsByCode[code]?.flag_emoji}</span>
                              <span style={{ textTransform: 'uppercase' }}>{teamsByCode[code]?.name ?? code}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>}

          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="mono"
              style={{
                color: pathname === link.href ? '#E33A3A' : 'rgba(245,241,232,0.7)',
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                padding: '8px 14px',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: user menu or sign-in */}
        {profile ? (
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              className="flex items-center gap-2.5"
            >
              <span className="hidden sm:block mono" style={{ fontSize: 11, color: 'rgba(245,241,232,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{fullName}</span>
              <div className="head flex items-center justify-center" style={{
                width: 32, height: 32,
                background: '#E33A3A',
                color: '#F5F1E8',
                borderRadius: 2,
                fontSize: 13,
              }}>
                {initials}
              </div>
              <ChevronDown size={11} style={{ color: 'rgba(245,241,232,0.5)', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {userMenuOpen && (
              <div className="absolute top-full mt-2 right-0 w-56 z-50" style={{
                background: '#111E36',
                border: '1px solid rgba(245,241,232,0.18)',
                borderRadius: 3,
                boxShadow: '4px 4px 0 #E33A3A, 0 16px 48px rgba(0,0,0,0.4)',
                padding: '6px 0',
              }}>
                <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
                  <p className="head" style={{ fontSize: 13 }}>{fullName}</p>
                  <p className="mono mt-1" style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.05em' }}>{profile.email}</p>
                </div>
                {profile.is_admin && (
                  <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 mono" style={{
                    fontSize: 11,
                    padding: '11px 16px',
                    color: '#E33A3A',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    <ShieldCheck size={13} /> Admin
                  </Link>
                )}
                <Link href="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 mono" style={{
                  fontSize: 11,
                  padding: '11px 16px',
                  color: 'rgba(245,241,232,0.7)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  <Settings size={13} /> Account
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 mono" style={{
                  fontSize: 11,
                  padding: '11px 16px',
                  color: 'rgba(245,241,232,0.7)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textAlign: 'left',
                }}>
                  <LogOut size={13} /> Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/auth/login" className="eyebrow" style={{ color: 'rgba(245,241,232,0.7)' }}>
            Sign in →
          </Link>
        )}
      </div>
    </header>
  );
}
