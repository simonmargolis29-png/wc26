'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Settings, LogOut, Trophy, Star, BarChart3, Layers } from 'lucide-react';
import { teamsByCode } from '@/data/wc2026-teams';
import type { Profile, PickSixEntry, SweepstakeEntry } from '@/types';

interface Props {
  profile: Profile;
  sweepEntries?: SweepstakeEntry[];
  pickSixEntry?: PickSixEntry | null;
}

export function PreviewNavbar({ profile, sweepEntries = [], pickSixEntry = null }: Props) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [myTeamsOpen, setMyTeamsOpen] = useState(false);

  const initials = `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  const fullName = `${profile.first_name} ${profile.last_name}`;

  const navLinks = [
    { href: '/preview/dashboard', label: 'Dashboard' },
    { href: '/preview/leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { href: '/preview/admin', label: 'Admin', icon: Layers },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4 sm:px-6">
      {/* Preview banner */}
      <div className="max-w-5xl mx-auto mb-2 flex items-center justify-center">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(206,17,38,0.15)', border: '1px solid rgba(206,17,38,0.3)', color: '#ff8090' }}>
          👁 Preview mode — navigate freely, no data is saved
        </div>
      </div>

      <div
        className="max-w-5xl mx-auto flex items-center justify-between px-5 h-14 rounded-2xl"
        style={{
          background: 'rgba(10,14,26,0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <Link href="/preview/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #0033A0, #C9A84C)' }}>
            K
          </div>
          <span className="font-bold text-sm text-white/90">kickoff26</span>
        </Link>

        {/* Centre nav */}
        <nav className="hidden md:flex items-center gap-1">
          {/* My Teams */}
          <div className="relative">
            <button
              onClick={() => { setMyTeamsOpen(o => !o); setUserMenuOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: myTeamsOpen ? '#C9A84C' : 'rgba(240,244,255,0.7)' }}
            >
              <Trophy size={14} /> My Teams
              <ChevronDown size={12} style={{ transform: myTeamsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {myTeamsOpen && (
              <div className="absolute top-full mt-2 left-0 w-72 rounded-2xl p-4 z-50" style={{ background: 'rgba(10,14,26,0.97)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#C9A84C' }}>Sweepstake</p>
                    <p className="text-xs text-white/40 italic">Draw on 10 June 2026 — team TBC</p>
                  </div>
                  {pickSixEntry && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#C9A84C' }}>My Golden Six</p>
                      <div className="flex flex-wrap gap-1.5">
                        {pickSixEntry.team_picks.map(code => (
                          <span key={code} className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(240,244,255,0.8)' }}>
                            <span>{teamsByCode[code]?.flag_emoji}</span>
                            <span>{teamsByCode[code]?.name ?? code}</span>
                          </span>
                        ))}
                      </div>
                      <p className="text-xs mt-2" style={{ color: '#C9A84C' }}>{pickSixEntry.total_points} points</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMyTeamsOpen(false)}
              className="px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: pathname === link.href ? '#C9A84C' : 'rgba(240,244,255,0.7)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setUserMenuOpen(o => !o); setMyTeamsOpen(false); }}
            className="flex items-center gap-2.5"
          >
            <span className="hidden sm:block text-sm font-medium" style={{ color: 'rgba(240,244,255,0.8)' }}>{fullName}</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #0033A0, #C9A84C)' }}>
              {initials}
            </div>
            <ChevronDown size={13} style={{ color: 'rgba(240,244,255,0.5)', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {userMenuOpen && (
            <div className="absolute top-full mt-2 right-0 w-52 rounded-2xl py-2 z-50" style={{ background: 'rgba(10,14,26,0.97)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}>
              <div className="px-4 py-2 border-b mb-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-semibold text-white/90">{fullName}</p>
                <p className="text-xs text-white/40 truncate">{profile.email}</p>
              </div>
              <Link href="/preview/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                <Settings size={14} /> Account settings
              </Link>
              <Link href="/preview" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                <LogOut size={14} /> Log out (preview)
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
