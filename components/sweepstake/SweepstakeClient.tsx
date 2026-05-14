'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, AlertCircle, ArrowRight, Copy, Check, Eye, EyeOff, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { wc2026Teams } from '@/data/wc2026-teams';
import type { Profile, Sweepstake, SweepstakeEntry } from '@/types';

// Key used to carry an anonymous user's sweepstake intent across to /pick-six
// when they pick both games. PickSixClient reads this on signup and inserts
// the sweepstake entry alongside the pick-six entry.
const SWEEPSTAKE_INTENT_KEY = 'kickoff26.sweepstakeIntent';

interface Props {
  profile?: Profile;
  sweepstake: Sweepstake | null;
  existingEntry: SweepstakeEntry | null;
  entryCount: number;
  userId?: string;
}

const BANK_DETAILS = {
  name: 'Simon Margolis',
  sortCode: '60-07-31',
  accountNumber: '46887709',
};
const PAYPAL_HANDLE = '@SimonM80';

const DRAW_DATE = '9 June 2026';
const TOURNAMENT_START = '11 June 2026';

function validatePassword(pw: string) {
  return {
    length: pw.length >= 8,
    letter: /[a-zA-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^a-zA-Z0-9]/.test(pw),
  };
}

// ─── Tap-to-copy row ────────────────────────────────────────────────────────
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy} className="w-full flex items-baseline justify-between py-3" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
      <span className="eyebrow" style={{ color: 'rgba(245,241,232,0.5)' }}>{label}</span>
      <span className="flex items-center gap-2">
        <span className="mono" style={{ fontSize: 14, color: '#F5F1E8' }}>{value}</span>
        {copied
          ? <Check size={13} style={{ color: '#4ADE80' }} />
          : <Copy size={12} style={{ color: 'rgba(245,241,232,0.4)' }} />}
      </span>
    </button>
  );
}

type Step = 'info' | 'confirm' | 'signup' | 'payment' | 'confirmed';

function SweepstakeClientInner({ profile, sweepstake, existingEntry, entryCount, userId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const continueToPickSix = searchParams.get('then') === 'my-golden-six';

  const [step, setStep] = useState<Step>(existingEntry ? 'confirmed' : 'info');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Signup state — used when user is anonymous
  const [signupForm, setSignupForm] = useState({
    firstName: '', lastName: '', email: '', dateOfBirth: '',
    password: '', confirmPassword: '',
  });
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savedName, setSavedName] = useState<{ first: string; last: string } | null>(null);

  const supabase = createClient();

  // Authenticated path: register entry, advance to payment (or push on to
  // Pick Six if the user picked both games on the landing page).
  async function handleEnterAuthed() {
    if (!sweepstake || !userId) return;
    setLoading(true);
    setError('');

    const { error: err } = await supabase.from('sweepstake_entries').insert({
      sweepstake_id: sweepstake.id,
      user_id: userId,
      payment_status: 'pending',
    });

    if (err) {
      setError('Failed to register your entry. You may already be entered.');
      setLoading(false);
      return;
    }

    if (continueToPickSix) {
      router.push('/my-golden-six?with=sweepstake');
      return;
    }

    setStep('payment');
    setLoading(false);
  }

  // Anonymous path: collect signup, then save the entry, then advance to payment.
  async function handleSignupAndEnter(e: React.FormEvent) {
    e.preventDefault();
    setSignupError('');

    if (!sweepstake) { setSignupError('No active sweepstake to enter.'); return; }

    const pwValid = validatePassword(signupForm.password);
    if (!Object.values(pwValid).every(Boolean)) { setSignupError('Password does not meet requirements.'); return; }
    if (signupForm.password !== signupForm.confirmPassword) { setSignupError('Passwords do not match.'); return; }
    const dob = new Date(signupForm.dateOfBirth);
    const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) { setSignupError('You must be 18 or older to play.'); return; }

    setSignupLoading(true);
    const client = createClient();

    const { data: authData, error: authError } = await client.auth.signUp({
      email: signupForm.email,
      password: signupForm.password,
    });
    if (authError || !authData.user) {
      setSignupError(authError?.message ?? 'Sign up failed. Please try again.');
      setSignupLoading(false);
      return;
    }
    const newUserId = authData.user.id;

    const { error: profileError } = await client.from('profiles').insert({
      id: newUserId,
      first_name: signupForm.firstName,
      last_name: signupForm.lastName,
      email: signupForm.email,
      date_of_birth: signupForm.dateOfBirth,
      is_admin: false,
    });
    if (profileError) {
      setSignupError('Account created but profile setup failed. Please contact support.');
      setSignupLoading(false);
      return;
    }

    const { error: entryErr } = await client.from('sweepstake_entries').insert({
      sweepstake_id: sweepstake.id,
      user_id: newUserId,
      payment_status: 'pending',
    });
    if (entryErr) {
      setSignupError('Account created but entry could not be saved. Please contact support.');
      setSignupLoading(false);
      return;
    }

    setSavedName({ first: signupForm.firstName, last: signupForm.lastName });
    setSignupLoading(false);
    setStep('payment');
  }

  // From the info screen — always send the user through the explicit
  // "confirm — random team will be drawn for you" step before we save anything
  // or ask them to register.
  function handleEnterClick() {
    if (!sweepstake) { setError('No active sweepstake to enter.'); return; }
    setStep('confirm');
  }

  // From the confirm screen — proceed through the existing branches.
  function handleConfirmContinue() {
    // Combined flow: defer the sweepstake save, hand off to Pick Six.
    if (continueToPickSix && !userId) {
      if (!sweepstake) { setError('No active sweepstake to enter.'); return; }
      try {
        sessionStorage.setItem(SWEEPSTAKE_INTENT_KEY, JSON.stringify({
          sweepstakeId: sweepstake.id,
          createdAt: Date.now(),
        }));
      } catch { /* sessionStorage unavailable — proceed anyway */ }
      router.push('/my-golden-six?with=sweepstake');
      return;
    }

    if (userId) handleEnterAuthed();
    else setStep('signup');
  }

  const maxPlayers = sweepstake?.max_players ?? 48;
  const isFull = entryCount >= maxPlayers;
  const spotsLeft = maxPlayers - entryCount;
  const fillPct = Math.min((entryCount / maxPlayers) * 100, 100);

  // ─── Confirmed / payment view ──────────────────────────────────────────
  if (step === 'confirmed' || step === 'payment') {
    const displayFirst = profile?.first_name ?? savedName?.first ?? '';
    const displayLast = profile?.last_name ?? savedName?.last ?? '';
    const assignedTeam = existingEntry?.team_code
      ? wc2026Teams.find(t => t.code === existingEntry.team_code)
      : null;

    return (
      <div className="animate-fade-up">
        <div className="mb-10">
          <p className="eyebrow-red mb-3">§ Sweepstake</p>
          <h1 className="head" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>
            You&rsquo;re <span style={{ color: '#E33A3A' }}>in</span>.
          </h1>
          <hr className="programme-rule-strong mt-5 mb-4" />
          {assignedTeam ? (
            <div>
              <p className="text-sm mb-3" style={{ color: 'rgba(245,241,232,0.65)' }}>Your drawn team:</p>
              <div className="flex items-center gap-4">
                <span style={{ fontSize: 48, lineHeight: 1 }}>{assignedTeam.flag_emoji}</span>
                <div>
                  <p className="head" style={{ fontSize: 32 }}>{assignedTeam.name}</p>
                  <p className="eyebrow mt-1" style={{ color: 'rgba(245,241,232,0.5)' }}>{assignedTeam.confederation} · Group {assignedTeam.group_name}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'rgba(245,241,232,0.65)' }}>
              Entry registered. Your team is drawn at random on {DRAW_DATE}. Check back here after the draw to see who you got.
            </p>
          )}
        </div>

        {step === 'payment' && (
          <div className="programme-card p-7 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={14} style={{ color: '#E33A3A' }} />
              <p className="eyebrow-red">Payment pending — £5</p>
            </div>
            <p className="text-sm mb-5" style={{ color: 'rgba(245,241,232,0.65)' }}>
              Your entry is reserved but won&rsquo;t make the draw until payment clears. Tap any field to copy.
            </p>
            <p className="eyebrow mt-3 mb-1" style={{ color: 'rgba(245,241,232,0.55)' }}>Bank transfer</p>
            <CopyRow label="Account name" value={BANK_DETAILS.name} />
            <CopyRow label="Sort code" value={BANK_DETAILS.sortCode} />
            <CopyRow label="Account number" value={BANK_DETAILS.accountNumber} />
            <CopyRow label="Amount" value="£5.00" />
            <CopyRow label="Reference" value="WC26 Game" />

            <p className="eyebrow mt-5 mb-1" style={{ color: 'rgba(245,241,232,0.55)' }}>Or PayPal</p>
            <CopyRow label="PayPal" value={PAYPAL_HANDLE} />
            <p className="mono mt-2" style={{ fontSize: 11, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.04em' }}>
              Use your name as the note so we can match the payment.
            </p>

            <p className="eyebrow mt-5" style={{ color: 'rgba(245,241,232,0.4)' }}>
              We reconcile transfers each weekday morning.
            </p>
          </div>
        )}

        <div className="programme-card p-7">
          <p className="head mb-4" style={{ fontSize: 22 }}>Fixture details</p>
          <hr className="programme-rule mb-2" />
          {[
            ['Draw date', DRAW_DATE],
            ['Tournament starts', TOURNAMENT_START],
            ['Winner', '£100'],
            ['Runner-up', '£40'],
            ['Losing semi-finalist', '£25 each'],
            ['0 pts in group stage', '£5 refund'],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between py-3" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
              <span className="eyebrow" style={{ color: 'rgba(245,241,232,0.5)' }}>{k}</span>
              <span className="mono" style={{ fontSize: 14 }}>{v}</span>
            </div>
          ))}
        </div>

        {step === 'payment' && (
          <Link href="/dashboard" className="btn-primary mt-6 justify-center">
            Go to your dashboard <ArrowRight size={16} />
          </Link>
        )}
      </div>
    );
  }

  // ─── Confirm step ─────────────────────────────────────────────────────
  if (step === 'confirm') {
    const stepLabel = continueToPickSix ? 'Step 01 / 04 · Confirm' : 'Step 01 / 03 · Confirm';
    return (
      <div className="animate-fade-up max-w-md mx-auto">
        <div className="mb-8">
          <p className="eyebrow-red mb-3">{stepLabel}</p>
          <h1 className="head" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
            Confirm your <span style={{ color: '#E33A3A' }}>entry</span>
          </h1>
          <hr className="programme-rule-strong mt-5 mb-4" />
        </div>

        <div className="programme-card p-7 mb-6">
          <p className="head mb-4" style={{ fontSize: 22 }}>You&rsquo;re entering the sweepstake</p>
          <hr className="programme-rule mb-2" />
          {[
            ['Random team drawn', DRAW_DATE],
            ['Tournament starts', TOURNAMENT_START],
            ['Entry fee', '£5'],
            ['Slot reserved', `${entryCount + 1} of ${maxPlayers}`],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between py-3" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
              <span className="eyebrow" style={{ color: 'rgba(245,241,232,0.5)' }}>{k}</span>
              <span className="mono" style={{ fontSize: 14 }}>{v}</span>
            </div>
          ))}
          <p className="mono mt-4" style={{ fontSize: 11, color: 'rgba(245,241,232,0.5)', letterSpacing: '0.04em', lineHeight: 1.6 }}>
            A team will be drawn for you at random — you don&rsquo;t pick. You follow that team all the way through the tournament.
          </p>
        </div>

        {error && (
          <div className="text-sm px-4 py-3 mb-5" style={{ background: 'rgba(227,58,58,0.1)', border: '1px solid rgba(227,58,58,0.4)', color: '#FF8A8A', borderRadius: 2 }}>
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => setStep('info')} className="btn-ghost" style={{ flex: '0 0 auto' }}>
            ← Back
          </button>
          <button onClick={handleConfirmContinue} disabled={loading} className="btn-primary" style={{ flex: 1 }}>
            {loading ? 'Saving…'
              : continueToPickSix
                ? <>Confirm & build My Golden Six <ArrowRight size={16} /></>
                : <>Confirm & continue <ArrowRight size={16} /></>}
          </button>
        </div>
      </div>
    );
  }

  // ─── Signup step (anonymous flow) ─────────────────────────────────────
  if (step === 'signup') {
    const pwValid = validatePassword(signupForm.password);

    return (
      <div className="animate-fade-up max-w-md mx-auto">
        <div className="mb-8">
          <p className="eyebrow-red mb-3">Step 02 / 03 · Register</p>
          <h1 className="head" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>Lock in your entry</h1>
          <hr className="programme-rule-strong mt-5 mb-4" />
          <p className="text-sm" style={{ color: 'rgba(245,241,232,0.6)' }}>
            One step to confirm — register, then we&rsquo;ll show you the £5 transfer details.
          </p>
        </div>

        <form onSubmit={handleSignupAndEnter} className="programme-card p-7 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>First name</label>
              <input value={signupForm.firstName} onChange={e => setSignupForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Jamie" required />
            </div>
            <div>
              <label>Last name</label>
              <input value={signupForm.lastName} onChange={e => setSignupForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Smith" required />
            </div>
          </div>

          <div>
            <label>Email address</label>
            <input type="email" value={signupForm.email} onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
          </div>

          <div>
            <label>Date of birth</label>
            <input type="date" value={signupForm.dateOfBirth} onChange={e => setSignupForm(f => ({ ...f, dateOfBirth: e.target.value }))} required />
          </div>

          <div>
            <label>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={signupForm.password}
                onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(245,241,232,0.4)' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {signupForm.password && (
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                {[
                  { key: 'length', label: '8+ chars' },
                  { key: 'letter', label: 'A letter' },
                  { key: 'number', label: 'A number' },
                  { key: 'special', label: 'A symbol' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-1.5 mono" style={{ fontSize: 11, letterSpacing: '0.05em' }}>
                    {pwValid[key as keyof typeof pwValid]
                      ? <Check size={11} style={{ color: '#4ADE80' }} />
                      : <XCircle size={11} style={{ color: 'rgba(245,241,232,0.3)' }} />}
                    <span style={{ color: pwValid[key as keyof typeof pwValid] ? '#4ADE80' : 'rgba(245,241,232,0.4)' }}>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label>Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={signupForm.confirmPassword}
                onChange={e => setSignupForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                required
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(245,241,232,0.4)' }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {signupError && (
            <div className="text-sm px-4 py-3" style={{ background: 'rgba(227,58,58,0.1)', border: '1px solid rgba(227,58,58,0.4)', color: '#FF8A8A', borderRadius: 2 }}>
              {signupError}
            </div>
          )}

          <button type="submit" disabled={signupLoading} className="btn-primary">
            {signupLoading ? 'Registering…' : <>Register & confirm entry <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    );
  }

  // ─── Info step ────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-up">
      <div className="mb-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <p className="eyebrow-red">{continueToPickSix ? '§ Sweepstake · 4 steps to enter both' : '§ Sweepstake'}</p>
          <p className="eyebrow" style={{ color: 'rgba(245,241,232,0.55)' }}>Draw · {DRAW_DATE}</p>
        </div>
        <h1 className="head" style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}>
          One team.<br /><span style={{ color: '#E33A3A' }}>All</span> the way.
        </h1>
        <hr className="programme-rule-strong mt-5 mb-4" />
        <p className="max-w-xl" style={{ color: 'rgba(245,241,232,0.7)', lineHeight: 1.55, fontSize: 15 }}>
          Forty-eight players, forty-eight teams. Pay £5, get a team drawn at random on {DRAW_DATE}, follow them all the way to the final.
        </p>
      </div>

      {/* Scoreboard — entries */}
      <div className="scoreboard mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Users size={14} style={{ color: '#E33A3A' }} />
            <p className="eyebrow" style={{ color: 'rgba(245,241,232,0.5)' }}>Entries</p>
          </div>
          <p className="scoreboard-digit" style={{ fontSize: 28 }}>
            {String(entryCount).padStart(2, '0')}<span style={{ color: 'rgba(245,241,232,0.3)' }}>/{maxPlayers}</span>
          </p>
        </div>
        <div className="scoreboard-bar">
          <div style={{
            width: `${fillPct}%`,
            background: isFull ? '#E33A3A' : '#F5F1E8',
          }} />
        </div>
        {!isFull && (
          <p className="mono" style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.05em' }}>
            {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      {/* Prize breakdown */}
      <div className="programme-card p-7 mb-6">
        <p className="eyebrow-red mb-3">Prize fund</p>
        <hr className="programme-rule mb-2" />
        {[
          { label: 'Winner', value: '£100', accent: true },
          { label: 'Runner-up', value: '£40', accent: false },
          { label: 'Losing semi-finalist', value: '£25 each', accent: false },
          { label: '0 pts in group stage', value: '£5 refund', accent: false },
        ].map((row) => (
          <div key={row.label} className="flex items-baseline justify-between py-3" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
            <span style={{ fontSize: 15, color: 'rgba(245,241,232,0.7)' }}>{row.label}</span>
            <span className="head" style={{ fontSize: 22, color: row.accent ? '#E33A3A' : '#F5F1E8' }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Draw note */}
      <div className="programme-card p-5 mb-8 flex items-start gap-3">
        <AlertCircle size={14} className="mt-1" style={{ color: '#E33A3A' }} />
        <div>
          <p className="head" style={{ fontSize: 14, letterSpacing: '0.04em' }}>Random draw on {DRAW_DATE}</p>
          <p className="mono mt-1" style={{ fontSize: 11, color: 'rgba(245,241,232,0.5)', letterSpacing: '0.04em' }}>
            Teams are assigned irrespective of entry order
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm px-4 py-3 mb-5" style={{ background: 'rgba(227,58,58,0.1)', border: '1px solid rgba(227,58,58,0.4)', color: '#FF8A8A', borderRadius: 2 }}>
          {error}
        </div>
      )}

      {isFull ? (
        <div className="text-center py-8">
          <p className="head" style={{ fontSize: 22 }}>Sweepstake full</p>
          <p className="mono mt-2" style={{ fontSize: 11, color: 'rgba(245,241,232,0.45)', letterSpacing: '0.06em' }}>
            Watch out for the next one
          </p>
        </div>
      ) : (
        <button onClick={handleEnterClick} disabled={loading} className="btn-primary">
          {loading ? 'Registering…'
            : continueToPickSix
              ? <>Confirm & build My Golden Six <ArrowRight size={16} /></>
              : <>Enter sweepstake — £5 <ArrowRight size={16} /></>}
        </button>
      )}
    </div>
  );
}

export function SweepstakeClient(props: Props) {
  return (
    <Suspense fallback={null}>
      <SweepstakeClientInner {...props} />
    </Suspense>
  );
}
