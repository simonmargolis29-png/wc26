'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import { wc2026Teams } from '@/data/wc2026-teams';

type Game = 'sweepstake' | 'my-golden-six';

export default function LandingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<Game>>(new Set());

  // If a user picks both: Sweepstake first (confirm intent), then My Golden Six,
  // then sign-up at the end which saves both entries in one go.
  function handleEnter() {
    const both = selected.has('sweepstake') && selected.has('my-golden-six');
    if (both) router.push('/sweepstake?then=my-golden-six');
    else if (selected.has('sweepstake')) router.push('/sweepstake');
    else if (selected.has('my-golden-six')) router.push('/my-golden-six');
  }

  function toggle(game: Game) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(game)) next.delete(game);
      else next.add(game);
      return next;
    });
  }

  const sweepSelected = selected.has('sweepstake');
  const pickSelected = selected.has('my-golden-six');
  const canEnter = selected.size > 0;

  // Countdown to first WC2026 match — 11 June 2026, 20:00 BST (19:00 UTC)
  const KICKOFF = new Date('2026-06-11T19:00:00Z').getTime();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, started: false });

  useEffect(() => {
    function tick() {
      const diff = KICKOFF - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, started: true });
        return;
      }
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        started: true,
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ background: '#0A1628', color: '#F5F1E8' }}>

      {/* ============================================================
          HERO — match-day programme cover
          ============================================================ */}
      <section className="relative overflow-hidden grain" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Background image */}
        <Image
          src="/Fifa image.png"
          alt="FIFA World Cup 2026"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 22%', filter: 'saturate(0.7) contrast(1.05)' }}
        />

        {/* Heavy darken */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(10,22,40,0.82) 0%, rgba(10,22,40,0.55) 35%, rgba(10,22,40,0.78) 75%, rgba(10,22,40,0.98) 100%)',
        }} />

        {/* Participating-nations strip — 48 flags running across the bottom of the
            hero, behind the stats rail. Decorative, reads as "all nations welcome". */}
        <div className="absolute left-0 right-0 z-0 hidden md:flex items-center justify-center flex-wrap gap-x-3 gap-y-2 overflow-hidden pointer-events-none px-6 sm:px-12" style={{
          bottom: 90,
          maxHeight: 60,
          opacity: 0.55,
        }}>
          {wc2026Teams.map(t => (
            <span key={t.code} style={{ fontSize: 22, lineHeight: 1, userSelect: 'none' }} aria-hidden>
              {t.flag_emoji}
            </span>
          ))}
        </div>

        {/* ─── NAV ─── */}
        <nav className="relative z-20 flex items-center justify-between px-6 sm:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: 32, height: 32, background: '#E33A3A', borderRadius: 2, boxShadow: '3px 3px 0 #0A1628' }}>
              <span className="head" style={{ fontSize: 18, color: '#F5F1E8' }}>K</span>
            </div>
            <div>
              <p className="head" style={{ fontSize: 16, letterSpacing: '0.04em' }}>Kickoff26</p>
            </div>
          </div>
          <Link href="/auth/login" className="eyebrow" style={{ color: 'rgba(245,241,232,0.7)' }}>
            Sign in →
          </Link>
        </nav>

        {/* ─── HERO CONTENT ─── */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full max-w-6xl mx-auto px-6 sm:px-12 py-12">

            {/* Top eyebrow rail */}
            <div className="flex items-center gap-3 mb-8 flex-wrap">
              <span className="block h-px w-10" style={{ background: '#E33A3A' }} />
              <p className="eyebrow-red">FIFA World Cup · 11 June — 19 July 2026</p>
              <span className="hidden sm:block eyebrow" style={{ color: 'rgba(245,241,232,0.4)' }}>USA · CAN · MEX</span>
            </div>

            <div className="max-w-3xl">

              {/* Headline */}
              <h1 className="head" style={{
                fontSize: 'clamp(48px, 8vw, 104px)',
                letterSpacing: '-0.01em',
              }}>
                Two games.<br />
                <span style={{ color: '#E33A3A' }}>One</span> tournament.
              </h1>

              <hr className="programme-rule-strong my-8" style={{ maxWidth: 480 }} />

              <p className="max-w-lg" style={{ fontSize: 17, lineHeight: 1.55, color: 'rgba(245,241,232,0.72)' }}>
                Pick your team in the Sweepstake, enter My Golden Six, or play both. Pick a game, register, and get on the board before kick-off.
              </p>
            </div>

            {/* ─── Countdown ─── */}
            {countdown.started && (
              <div className="mt-10 max-w-2xl">
                <p className="eyebrow mb-4" style={{ color: 'rgba(245,241,232,0.45)', letterSpacing: '0.14em' }}>
                  Kick-off · 11 June 2026 · 20:00 BST
                </p>
                <div className="flex items-end gap-3 sm:gap-5">
                  {[
                    { value: countdown.days, label: 'Days' },
                    { value: countdown.hours, label: 'Hrs' },
                    { value: countdown.minutes, label: 'Min' },
                    { value: countdown.seconds, label: 'Sec' },
                  ].map(({ value, label }, i) => (
                    <div key={label} className="flex items-end gap-3 sm:gap-5">
                      {i > 0 && (
                        <span className="head mb-2" style={{ fontSize: 'clamp(24px, 4vw, 48px)', color: 'rgba(245,241,232,0.2)', lineHeight: 1 }}>:</span>
                      )}
                      <div className="text-center">
                        <div
                          className="scoreboard-digit"
                          style={{
                            fontSize: 'clamp(40px, 7vw, 80px)',
                            lineHeight: 1,
                            color: '#F5F1E8',
                            minWidth: 'clamp(56px, 9vw, 100px)',
                            display: 'block',
                          }}
                        >
                          {String(value).padStart(2, '0')}
                        </div>
                        <p className="eyebrow mt-2" style={{ fontSize: 10, color: 'rgba(245,241,232,0.35)', letterSpacing: '0.14em' }}>
                          {label}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#E33A3A', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <p className="mono" style={{ fontSize: 11, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.08em' }}>
                    Entries close at kick-off
                  </p>
                </div>
              </div>
            )}

            {/* ─── Game tiles ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 max-w-3xl">

              {/* Sweepstake tile */}
              <button
                onClick={() => toggle('sweepstake')}
                className="text-left transition-all duration-150"
                style={{
                  background: sweepSelected ? '#E33A3A' : '#111E36',
                  color: '#F5F1E8',
                  border: sweepSelected ? '1px solid #E33A3A' : '1px solid rgba(245,241,232,0.18)',
                  borderRadius: 3,
                  padding: '24px',
                  position: 'relative',
                  boxShadow: sweepSelected ? '5px 5px 0 #F5F1E8' : '5px 5px 0 transparent',
                  transform: sweepSelected ? 'translate(-2px, -2px)' : 'none',
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="eyebrow" style={{ color: sweepSelected ? 'rgba(245,241,232,0.7)' : 'rgba(245,241,232,0.55)' }}>Game 01</p>
                    <p className="head mt-2" style={{ fontSize: 32 }}>Sweepstake</p>
                  </div>
                  <div className="stamp" style={{ color: sweepSelected ? '#F5F1E8' : '#E33A3A' }}>£5</div>
                </div>
                <p className="text-sm mb-6" style={{ color: sweepSelected ? 'rgba(245,241,232,0.85)' : 'rgba(245,241,232,0.55)', lineHeight: 1.5 }}>
                  48 players. 48 teams. Random draw. Follow your team to the final.
                </p>
                <div className="flex items-center gap-2">
                  <span className="eyebrow" style={{ color: '#F5F1E8' }}>
                    {sweepSelected ? 'Selected' : 'Add to entry'}
                  </span>
                  {sweepSelected ? (
                    <span style={{ width: 14, height: 14, background: '#F5F1E8', borderRadius: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} strokeWidth={3} color="#000" />
                    </span>
                  ) : (
                    <span style={{ width: 14, height: 14, border: '1.5px solid rgba(245,241,232,0.4)', borderRadius: 1, display: 'inline-block' }} />
                  )}
                </div>
              </button>

              {/* My Golden Six tile */}
              <button
                onClick={() => toggle('my-golden-six')}
                className="text-left transition-all duration-150"
                style={{
                  background: pickSelected ? '#E33A3A' : '#111E36',
                  color: pickSelected ? '#F5F1E8' : '#F5F1E8',
                  border: pickSelected ? '1px solid #E33A3A' : '1px solid rgba(245,241,232,0.18)',
                  borderRadius: 3,
                  padding: '24px',
                  position: 'relative',
                  boxShadow: pickSelected ? '5px 5px 0 #F5F1E8' : '5px 5px 0 transparent',
                  transform: pickSelected ? 'translate(-2px, -2px)' : 'none',
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="eyebrow" style={{ color: pickSelected ? 'rgba(245,241,232,0.7)' : 'rgba(245,241,232,0.55)' }}>Game 02</p>
                    <p className="head mt-2" style={{ fontSize: 32 }}>My Golden Six</p>
                  </div>
                  <div className="stamp" style={{ color: pickSelected ? '#F5F1E8' : '#E33A3A' }}>£10</div>
                </div>
                <p className="text-sm mb-6" style={{ color: pickSelected ? 'rgba(245,241,232,0.85)' : 'rgba(245,241,232,0.55)', lineHeight: 1.5 }}>
                  Pick 6 teams, spend your 15 point budget and earn points with every match your teams play. Reach the top of the leaderboard to win.
                </p>
                <div className="flex items-center gap-2">
                  <span className="eyebrow" style={{ color: '#F5F1E8' }}>
                    {pickSelected ? 'Selected' : 'Add to entry'}
                  </span>
                  {pickSelected ? (
                    <span style={{ width: 14, height: 14, background: '#F5F1E8', borderRadius: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} strokeWidth={3} color="#000" />
                    </span>
                  ) : (
                    <span style={{ width: 14, height: 14, border: '1.5px solid rgba(245,241,232,0.4)', borderRadius: 1, display: 'inline-block' }} />
                  )}
                </div>
              </button>
            </div>

            {/* CTA */}
            <div className="mt-8 max-w-3xl">
              <button
                onClick={handleEnter}
                disabled={!canEnter}
                className="btn-primary"
                style={{ maxWidth: 480 }}
              >
                {canEnter ? <>Continue <ArrowRight size={16} /></> : 'Pick a game above'}
              </button>
              <p className="mt-5 text-sm" style={{ color: 'rgba(245,241,232,0.4)' }}>
                Already on the team sheet?{' '}
                <Link href="/auth/login" className="underline" style={{ color: '#F5F1E8', textUnderlineOffset: 4 }}>Sign in</Link>
              </p>
            </div>
          </div>
        </div>

        {/* ─── Stats rail ─── */}
        <div className="relative z-10" style={{ borderTop: '1px solid rgba(245,241,232,0.14)' }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-12 py-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-10">
              {[
                ['48', 'Teams'],
                ['12', 'Groups'],
                ['104', 'Matches'],
                ['39', 'Days'],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="head" style={{ fontSize: 28 }}>{n}</p>
                  <p className="eyebrow mt-1" style={{ fontSize: 10 }}>{l}</p>
                </div>
              ))}
            </div>
            <p className="eyebrow" style={{ color: 'rgba(245,241,232,0.4)' }}>Vol. 1 / 2026</p>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS — programme spread
          ============================================================ */}
      <section className="relative px-6 sm:px-12 py-24 grain" style={{ background: '#0A1628' }}>
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 items-end">
            <div className="md:col-span-2">
              <p className="eyebrow-red">§ 01</p>
            </div>
            <div className="md:col-span-7">
              <h2 className="head" style={{ fontSize: 'clamp(40px, 5vw, 72px)' }}>
                How <span style={{ color: '#E33A3A' }}>it</span> works
              </h2>
            </div>
            <div className="md:col-span-3">
              <p className="eyebrow" style={{ color: 'rgba(245,241,232,0.55)' }}>Pick one or both</p>
            </div>
          </div>

          <hr className="programme-rule-strong mb-16" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">

            {/* Sweepstake spread */}
            <div>
              <div className="flex items-baseline justify-between mb-6">
                <p className="eyebrow">Game 01</p>
                <span className="stamp" style={{ color: '#E33A3A' }}>£5 entry</span>
              </div>
              <h3 className="head mb-4" style={{ fontSize: 56 }}>Sweepstake</h3>
              <hr className="programme-rule mb-5" />
              <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(245,241,232,0.65)' }}>
                Forty-eight players, forty-eight teams, one random draw on 10 June. You get who you get — and follow them all the way through.
              </p>

              <div className="space-y-3">
                {[
                  ['Winner', '£100'],
                  ['Runner-up', '£40'],
                  ['Losing semi-finalist', '£25'],
                  ['0 pts in group stage', '£5 refund'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between py-2" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
                    <span style={{ color: 'rgba(245,241,232,0.7)', fontSize: 15 }}>{k}</span>
                    <span className="head" style={{ fontSize: 22 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* My Golden Six spread */}
            <div>
              <div className="flex items-baseline justify-between mb-6">
                <p className="eyebrow">Game 02</p>
                <span className="stamp" style={{ color: '#E33A3A' }}>£10 entry</span>
              </div>
              <h3 className="head mb-4" style={{ fontSize: 56 }}>My Golden Six</h3>
              <hr className="programme-rule mb-5" />
              <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(245,241,232,0.65)' }}>
                Pick 6 teams, spend your 15 point budget and earn points with every match your teams play. Reach the top of the leaderboard to win.
              </p>

              <div className="space-y-3 mb-8">
                <p className="eyebrow" style={{ color: 'rgba(245,241,232,0.45)', fontSize: 10 }}>Scoring</p>
                {[
                  ['Win', '3 pts'],
                  ['Draw', '1 pt'],
                  ['3+ goals scored', '+1 pt'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between py-2" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
                    <span style={{ color: 'rgba(245,241,232,0.7)', fontSize: 15 }}>{k}</span>
                    <span className="head" style={{ fontSize: 22, color: '#E33A3A' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <p className="eyebrow" style={{ color: 'rgba(245,241,232,0.45)', fontSize: 10 }}>Prizes · top 3 from the prize pot (£10 × entries)</p>
                {[
                  ['1st place', '50%'],
                  ['2nd place', '30%'],
                  ['3rd place', '20%'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between py-2" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
                    <span style={{ color: 'rgba(245,241,232,0.7)', fontSize: 15 }}>{k}</span>
                    <span className="head" style={{ fontSize: 22 }}>{v}</span>
                  </div>
                ))}
                <p className="mono pt-1" style={{ fontSize: 10, color: 'rgba(245,241,232,0.35)', letterSpacing: '0.05em' }}>
                  Tied players share the combined prizes for their positions equally.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <hr className="programme-rule-strong mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7">
              <p className="head" style={{ fontSize: 'clamp(28px, 3.5vw, 44px)' }}>
                Entries close <span style={{ color: '#E33A3A' }}>5pm, 11 June</span>
              </p>
              <p className="mt-2 eyebrow" style={{ color: 'rgba(245,241,232,0.55)' }}>Draw + first match-day · 11 June 2026</p>
            </div>
            <div className="md:col-span-5">
              <Link href="/my-golden-six" className="btn-primary">
                Enter My Golden Six <ArrowRight size={16} />
              </Link>
              <p className="mt-3 eyebrow" style={{ color: 'rgba(245,241,232,0.4)', textAlign: 'center' }}>
                Or try the <Link href="/sweepstake" className="underline" style={{ color: '#F5F1E8' }}>sweepstake</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER
          ============================================================ */}
      <footer className="px-6 sm:px-12 py-10" style={{ borderTop: '1px solid rgba(245,241,232,0.14)', background: '#050B17' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: 28, height: 28, background: '#E33A3A', borderRadius: 2 }}>
              <span className="head" style={{ fontSize: 14 }}>K</span>
            </div>
            <span className="head" style={{ fontSize: 14 }}>Kickoff26</span>
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            <p className="eyebrow" style={{ color: 'rgba(245,241,232,0.35)' }}>For entertainment only · Not affiliated with FIFA</p>
            <Link href="/cookie-policy" className="eyebrow" style={{ color: 'rgba(245,241,232,0.35)', fontSize: 10, textDecoration: 'underline', textUnderlineOffset: 3 }}>Cookie policy</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
