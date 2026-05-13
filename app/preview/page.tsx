'use client';

import Link from 'next/link';
import { Trophy, Star, BarChart3, Settings, Shield, LogIn, UserPlus, Globe } from 'lucide-react';

const pages = [
  { href: '/preview/landing', label: 'Landing page', desc: 'Public homepage — seen before logging in', icon: Globe, tag: 'Public' },
  { href: '/preview/login', label: 'Login', desc: 'Sign-in form', icon: LogIn, tag: 'Auth' },
  { href: '/preview/signup', label: 'Sign up', desc: 'Registration form with password rules', icon: UserPlus, tag: 'Auth' },
  { href: '/preview/dashboard', label: 'Dashboard', desc: 'Home screen after login', icon: Globe, tag: 'Game' },
  { href: '/preview/sweepstake-empty', label: 'Sweepstake — not entered', desc: 'Before entering', icon: Trophy, tag: 'Game' },
  { href: '/preview/sweepstake-entered', label: 'Sweepstake — entered + paid', desc: 'After entering with payment pending', icon: Trophy, tag: 'Game' },
  { href: '/preview/pick-six-empty', label: 'My Golden Six — not entered', desc: 'Team picker', icon: Star, tag: 'Game' },
  { href: '/preview/pick-six-entered', label: 'My Golden Six — entered', desc: 'Your picks with points', icon: Star, tag: 'Game' },
  { href: '/preview/leaderboard', label: 'Leaderboard', desc: 'Global My Golden Six rankings', icon: BarChart3, tag: 'Game' },
  { href: '/preview/account', label: 'Account settings', desc: 'Edit profile details', icon: Settings, tag: 'Account' },
  { href: '/preview/admin', label: 'Admin dashboard', desc: 'Owner metrics, payments, entries', icon: Shield, tag: 'Admin' },
];

const tagColours: Record<string, { bg: string; color: string }> = {
  Public: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(240,244,255,0.5)' },
  Auth: { bg: 'rgba(0,51,160,0.15)', color: '#7eb3ff' },
  Game: { bg: 'rgba(201,168,76,0.1)', color: '#C9A84C' },
  Account: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80' },
  Admin: { bg: 'rgba(206,17,38,0.1)', color: '#ff8090' },
};

export default function PreviewIndex() {
  return (
    <div className="min-h-screen px-6 py-16 max-w-3xl mx-auto">
      <div className="mb-10">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5 font-bold text-white text-lg" style={{ background: 'linear-gradient(135deg, #0033A0, #C9A84C)' }}>
          K
        </div>
        <h1 className="text-3xl font-black text-white text-center mb-2">kickoff26 — Preview</h1>
        <p className="text-white/50 text-center text-sm">Click any page to preview it. No data is saved. Navigate freely.</p>
      </div>

      <div className="space-y-2">
        {pages.map(page => {
          const tag = tagColours[page.tag];
          return (
            <Link key={page.href} href={page.href} className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-150 group" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.25)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,51,160,0.15)', border: '1px solid rgba(0,51,160,0.25)' }}>
                <page.icon size={16} style={{ color: '#C9A84C' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{page.label}</p>
                <p className="text-xs text-white/40">{page.desc}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0" style={{ background: tag.bg, color: tag.color }}>
                {page.tag}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
