'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, X, Eye, EyeOff, XCircle, Copy, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { wc2026Teams } from '@/data/wc2026-teams';
import type { Profile, PickSixEntry, WCTeam } from '@/types';

// Carries an anonymous user's deferred sweepstake entry across from
// /sweepstake when both games were picked on the landing page.
const SWEEPSTAKE_INTENT_KEY = 'kickoff26.sweepstakeIntent';

interface SweepstakeIntent {
  sweepstakeId: string;
  createdAt: number;
}

// ─── Payment details ────────────────────────────────────────────────────────
const BANK_DETAILS = {
  name: 'Simon Margolis',
  sortCode: '60-07-31',
  accountNumber: '46887709',
};
const PAYPAL_HANDLE = '@SimonM80';

// ─── Game rules ─────────────────────────────────────────────────────────────
// Pick exactly 6 teams. Spend up to 15 points.
// Win = 3 pts · Draw = 1 pt · 3+ goals scored in a match = +1 pt
const SQUAD_SIZE = 6;
const BUDGET = 15;
const ENTRY_DEADLINE = '9 June 2026, 21:00 BST';

type TierLabel = 'Elite' | 'Contender' | 'Dark Horse' | 'Wildcard';

const TEAM_TIERS: Record<string, { label: TierLabel; cost: number }> = {
  // Elite — 5 pts
  ARG: { label: 'Elite', cost: 5 },
  FRA: { label: 'Elite', cost: 5 },
  ENG: { label: 'Elite', cost: 5 },
  BRA: { label: 'Elite', cost: 5 },
  ESP: { label: 'Elite', cost: 5 },
  GER: { label: 'Elite', cost: 5 },
  // Contender — 3 pts
  POR: { label: 'Contender', cost: 3 },
  NED: { label: 'Contender', cost: 3 },
  BEL: { label: 'Contender', cost: 3 },
  URU: { label: 'Contender', cost: 3 },
  CRO: { label: 'Contender', cost: 3 },
  // Dark Horse — 2 pts
  USA: { label: 'Dark Horse', cost: 2 },
  MAR: { label: 'Dark Horse', cost: 2 },
  COL: { label: 'Dark Horse', cost: 2 },
  JPN: { label: 'Dark Horse', cost: 2 },
  MEX: { label: 'Dark Horse', cost: 2 },
  KOR: { label: 'Dark Horse', cost: 2 },
  TUR: { label: 'Dark Horse', cost: 2 },
  GHA: { label: 'Dark Horse', cost: 2 },
  NOR: { label: 'Dark Horse', cost: 2 },
};

const TIER_GROUPS: { label: TierLabel; cost: number; color: string }[] = [
  { label: 'Elite', cost: 5, color: '#D4A52E' },
  { label: 'Contender', cost: 3, color: '#5FA9D6' },
  { label: 'Dark Horse', cost: 2, color: '#A78BFA' },
  { label: 'Wildcard', cost: 1, color: '#F5F1E8' },
];

function tierFor(code: string): { label: TierLabel; cost: number; color: string } {
  const t = TEAM_TIERS[code];
  if (t) {
    const colour = TIER_GROUPS.find(g => g.label === t.label)?.color ?? '#F5F1E8';
    return { ...t, color: colour };
  }
  return { label: 'Wildcard', cost: 1, color: '#F5F1E8' };
}

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
    <button onClick={copy} className="w-full flex items-baseline justify-between py-3 group" style={{ borderBottom: '1px solid rgba(245,241,232,0.1)' }}>
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

// ─── Kit tile ───────────────────────────────────────────────────────────────
function KitTile({ team, isSelected, isSwapTarget, isDisabled, onToggle }: {
  team: WCTeam;
  isSelected: boolean;
  isSwapTarget: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}) {
  const tier = tierFor(team.code);
  const cls = ['kit-tile'];
  if (isSelected) cls.push('is-selected');
  if (isDisabled) cls.push('is-disabled');
  if (isSwapTarget) cls.push('is-swap-target');

  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className={cls.join(' ')}
      style={{ ['--tile-accent' as string]: tier.color } as React.CSSProperties}
    >
      <span className="kit-number">{tier.cost}</span>
      <span className="kit-flag">{team.flag_emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="kit-name truncate">{team.name}</p>
      </div>
    </button>
  );
}

type Step = 'pick' | 'signup' | 'payment' | 'confirmed';

interface Props {
  profile?: Profile;
  existingEntry: PickSixEntry | null;
  userId?: string;
  initialStep?: Step;
  entryCount?: number;
}

interface LeagueMemberPicks {
  team_picks: string[];
  user_id: string;
}

function PickSixClientInner({ profile, existingEntry, userId, initialStep, entryCount = 0 }: Props) {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(initialStep ?? (existingEntry ? 'confirmed' : 'pick'));

  // Everyone plays in the general league. League id is loaded once on mount.
  const [generalLeagueId, setGeneralLeagueId] = useState<string | null>(null);

  // If user came from /sweepstake?then=pick-six, the sweepstake entry is
  // deferred — pick it up from sessionStorage and save it alongside the
  // pick-six entry at signup/confirm time.
  const [sweepstakeIntent, setSweepstakeIntent] = useState<SweepstakeIntent | null>(null);
  const withSweepstake = sweepstakeIntent !== null || searchParams.get('with') === 'sweepstake';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(SWEEPSTAKE_INTENT_KEY);
      if (raw) setSweepstakeIntent(JSON.parse(raw) as SweepstakeIntent);
    } catch { /* ignore — sessionStorage unavailable or corrupt */ }
  }, []);

  const [picks, setPicks] = useState<string[]>([]);
  const [duplicateConflict, setDuplicateConflict] = useState<string | null>(null);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set());
  const [leagueMembers, setLeagueMembers] = useState<LeagueMemberPicks[]>([]);

  // Signup step state (used when unauthenticated)
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

  // Load default General league id on mount so duplicate-check can fire.
  useEffect(() => {
    supabase
      .from('leagues')
      .select('id')
      .eq('type', 'general')
      .single()
      .then(({ data }) => {
        if (data) setGeneralLeagueId((data as { id: string }).id);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch existing picks in the league to check duplicates.
  useEffect(() => {
    if (!generalLeagueId || !userId) return;
    supabase
      .from('pick_six_entries')
      .select('team_picks, user_id')
      .eq('league_id', generalLeagueId)
      .neq('user_id', userId)
      .then(({ data }) => setLeagueMembers((data as LeagueMemberPicks[]) ?? []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generalLeagueId]);

  function checkDuplicate(candidatePicks: string[]): boolean {
    if (candidatePicks.length !== SQUAD_SIZE) return false;
    return leagueMembers.some(member => {
      const memberPicks = [...member.team_picks].sort();
      const myPicks = [...candidatePicks].sort();
      return JSON.stringify(memberPicks) === JSON.stringify(myPicks);
    });
  }

  const budgetUsed = picks.reduce((sum, code) => sum + tierFor(code).cost, 0);
  const remainingBudget = BUDGET - budgetUsed;
  const slotsLeft = SQUAD_SIZE - picks.length;

  function canAddTeam(code: string): boolean {
    if (picks.includes(code)) return true;
    if (picks.length >= SQUAD_SIZE) return false;
    return budgetUsed + tierFor(code).cost <= BUDGET;
  }

  function toggleTeam(code: string) {
    if (swapIndex !== null) {
      const newPicks = [...picks];
      newPicks[swapIndex] = code;
      // make sure the swap is valid budget-wise
      const newCost = newPicks.reduce((s, c) => s + tierFor(c).cost, 0);
      if (newCost > BUDGET) return;
      setPicks(newPicks);
      setSwapIndex(null);
      setDuplicateConflict(checkDuplicate(newPicks)
        ? 'Your picks still match another player in this league. Swap a different team.'
        : null);
      return;
    }

    if (picks.includes(code)) {
      const newPicks = picks.filter(p => p !== code);
      setPicks(newPicks);
      setDuplicateConflict(null);
      return;
    }
    if (!canAddTeam(code)) return;
    const newPicks = [...picks, code];
    setPicks(newPicks);
    setDuplicateConflict(checkDuplicate(newPicks)
      ? 'Someone in this league has already picked the same six teams. Swap one out.'
      : null);
  }

  // Submitting the picker IS the confirmation — there's no separate confirm
  // step. Anonymous users go straight to registration, authed users save and
  // go to payment.
  async function handleSubmitPicks() {
    if (picks.length !== SQUAD_SIZE) { setError(`Pick exactly ${SQUAD_SIZE} teams (you have ${picks.length}).`); return; }
    if (budgetUsed > BUDGET) { setError(`Squad costs ${budgetUsed} pts — over the ${BUDGET}-pt budget.`); return; }
    if (duplicateConflict) { setError(duplicateConflict); return; }

    if (!userId) {
      setError('');
      setStep('signup');
      return;
    }

    setLoading(true);
    setError('');

    const { error: entryErr } = await supabase.from('pick_six_entries').insert({
      user_id: userId,
      league_id: generalLeagueId,
      team_picks: picks,
      total_points: 0,
      payment_status: 'pending',
    });

    if (entryErr) {
      setError('Failed to save your picks. Please try again.');
      setLoading(false);
      return;
    }

    // If the user is doing both games, also save the deferred sweepstake entry.
    if (sweepstakeIntent) {
      await supabase.from('sweepstake_entries').insert({
        sweepstake_id: sweepstakeIntent.sweepstakeId,
        user_id: userId,
        payment_status: 'pending',
      });
      try { sessionStorage.removeItem(SWEEPSTAKE_INTENT_KEY); } catch { /* ignore */ }
    }

    setStep('payment');
    setLoading(false);
  }

  async function handleSignupAndSave(e: React.FormEvent) {
    e.preventDefault();
    setSignupError('');

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

    let finalLeagueId = generalLeagueId;
    if (!finalLeagueId) {
      const { data: general } = await client.from('leagues').select('id').eq('type', 'general').single();
      finalLeagueId = (general as { id: string } | null)?.id ?? null;
    }

    const { error: entryErr } = await client.from('pick_six_entries').insert({
      user_id: newUserId,
      league_id: finalLeagueId,
      team_picks: picks,
      total_points: 0,
      payment_status: 'pending',
    });
    if (entryErr) {
      setSignupError('Account created but picks could not be saved. Please contact support.');
      setSignupLoading(false);
      return;
    }

    if (sweepstakeIntent) {
      const { error: sweepErr } = await client.from('sweepstake_entries').insert({
        sweepstake_id: sweepstakeIntent.sweepstakeId,
        user_id: newUserId,
        payment_status: 'pending',
      });
      if (sweepErr) {
        setError('My Golden Six entry saved, but the sweepstake entry failed. Re-enter the sweepstake from your dashboard.');
      }
      try { sessionStorage.removeItem(SWEEPSTAKE_INTENT_KEY); } catch { /* ignore */ }
    }

    setSavedName({ first: signupForm.firstName, last: signupForm.lastName });
    setSignupLoading(false);
    setStep('payment');
  }

  // ─── Confirmed view ──────────────────────────────────────────────────────
  if (step === 'confirmed' && existingEntry) {
    return (
      <div className="animate-fade-up">
        <div className="mb-10">
          <p className="eyebrow-red mb-3">§ My Golden Six</p>
          <h1 className="head" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>Your squad</h1>
          <hr className="programme-rule-strong mt-6 mb-4" />
          <div className="flex flex-wrap gap-x-6 gap-y-2 items-baseline">
            <span className="head" style={{ fontSize: 22, color: '#E33A3A' }}>{existingEntry.total_points} pts</span>
            <span className="eyebrow" style={{ color: 'rgba(245,241,232,0.55)' }}>Global League</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {existingEntry.team_picks.map(code => {
            const team = wc2026Teams.find(t => t.code === code);
            if (!team) return null;
            return (
              <KitTile key={code} team={team} isSelected={true} isSwapTarget={false} isDisabled={true} onToggle={() => {}} />
            );
          })}
        </div>

        {existingEntry.payment_status === 'pending' && profile && (
          <div className="programme-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={14} style={{ color: '#E33A3A' }} />
              <p className="eyebrow-red">Payment pending — £10</p>
            </div>
            <p className="text-sm mb-5" style={{ color: 'rgba(245,241,232,0.65)' }}>
              Pay £10 to confirm your entry. Tap any field to copy.
            </p>
            <p className="eyebrow mb-1" style={{ color: 'rgba(245,241,232,0.55)' }}>Bank transfer</p>
            <CopyRow label="Account name" value={BANK_DETAILS.name} />
            <CopyRow label="Sort code" value={BANK_DETAILS.sortCode} />
            <CopyRow label="Account number" value={BANK_DETAILS.accountNumber} />
            <CopyRow label="Reference" value="WC26 Game" />
            <p className="eyebrow mt-5 mb-1" style={{ color: 'rgba(245,241,232,0.55)' }}>Or PayPal</p>
            <CopyRow label="PayPal" value={PAYPAL_HANDLE} />
          </div>
        )}
      </div>
    );
  }

  // ─── Signup step (unauthenticated flow) ─────────────────────────────────
  if (step === 'signup') {
    const pwValid = validatePassword(signupForm.password);

    return (
      <div className="animate-fade-up max-w-md mx-auto">
        <div className="mb-8">
          <p className="eyebrow-red mb-3">{withSweepstake ? 'Step 03 / 04 · Register' : 'Step 02 / 03 · Register'}</p>
          <h1 className="head" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
            {withSweepstake ? 'Lock in both entries' : 'Lock in your squad'}
          </h1>
          <hr className="programme-rule-strong mt-5 mb-4" />
          <p className="text-sm" style={{ color: 'rgba(245,241,232,0.6)' }}>
            {picks.length} teams · {budgetUsed} pts spent{withSweepstake ? ' · Sweepstake entry attached' : ''}
          </p>
        </div>

        <form onSubmit={handleSignupAndSave} className="programme-card p-7 space-y-5">
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
            {signupLoading ? 'Saving picks…' : <>Register & confirm <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    );
  }

  // ─── Payment step ────────────────────────────────────────────────────────
  if (step === 'payment') {
    const displayFirst = profile?.first_name ?? savedName?.first ?? '';
    const displayLast = profile?.last_name ?? savedName?.last ?? '';
    const totalAmount = withSweepstake ? 15 : 10;
    const reference = 'WC26 Game';
    const stepNumber = withSweepstake ? '04 / 04' : '03 / 03';
    const blurb = withSweepstake
      ? `One last thing — settle the £${totalAmount} entry (£10 My Golden Six + £5 Sweepstake) by bank transfer.`
      : `One last thing — settle the £${totalAmount} entry by bank transfer.`;

    return (
      <div className="animate-fade-up max-w-md mx-auto">
        <div className="mb-8">
          <p className="eyebrow-red mb-3">Step {stepNumber} · Pay</p>
          <h1 className="head" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
            {withSweepstake ? 'Entries confirmed' : 'Squad confirmed'}
          </h1>
          <hr className="programme-rule-strong mt-5 mb-4" />
          <p className="text-sm" style={{ color: 'rgba(245,241,232,0.65)' }}>
            {blurb}
          </p>
        </div>

        <div className="programme-card p-7">
          <div className="flex items-baseline justify-between mb-5">
            <p className="head" style={{ fontSize: 22 }}>£{totalAmount} transfer</p>
            <span className="stamp" style={{ color: '#E33A3A' }}>Pending</span>
          </div>
          {withSweepstake && (
            <>
              <hr className="programme-rule mb-2" />
              <div className="flex items-baseline justify-between py-3">
                <span style={{ color: 'rgba(245,241,232,0.7)', fontSize: 14 }}>My Golden Six</span>
                <span className="mono" style={{ fontSize: 14 }}>£10.00</span>
              </div>
              <div className="flex items-baseline justify-between py-3">
                <span style={{ color: 'rgba(245,241,232,0.7)', fontSize: 14 }}>Sweepstake</span>
                <span className="mono" style={{ fontSize: 14 }}>£5.00</span>
              </div>
            </>
          )}
          <hr className="programme-rule mb-2" />
          <p className="eyebrow mt-3 mb-1" style={{ color: 'rgba(245,241,232,0.55)' }}>Bank transfer</p>
          <CopyRow label="Account name" value={BANK_DETAILS.name} />
          <CopyRow label="Sort code" value={BANK_DETAILS.sortCode} />
          <CopyRow label="Account number" value={BANK_DETAILS.accountNumber} />
          <CopyRow label="Amount" value={`£${totalAmount}.00`} />
          <CopyRow label="Reference" value={reference} />

          <p className="eyebrow mt-5 mb-1" style={{ color: 'rgba(245,241,232,0.55)' }}>Or PayPal</p>
          <CopyRow label="PayPal" value={PAYPAL_HANDLE} />
          <p className="mono mt-2" style={{ fontSize: 11, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.04em' }}>
            Use your name as the note so we can match the payment.
          </p>

          <p className="eyebrow mt-5" style={{ color: 'rgba(245,241,232,0.4)' }}>
            We reconcile transfers each weekday morning. Your entries are saved.
          </p>
        </div>

        <Link href="/dashboard" className="btn-primary mt-6 justify-center">
          Go to your dashboard <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  // ─── Pick step ──────────────────────────────────────────────────────────
  const budgetPct = Math.min((budgetUsed / BUDGET) * 100, 100);
  const isValidSquad = picks.length === SQUAD_SIZE && budgetUsed <= BUDGET && !duplicateConflict;

  // Teams grouped by tier (Elite → Contender → Dark Horse → Wildcard).
  const groupedTeams: Record<string, WCTeam[]> = {};
  TIER_GROUPS.forEach(tg => {
    groupedTeams[tg.label] = wc2026Teams.filter(t => {
      if (tg.label === 'Wildcard') return !TEAM_TIERS[t.code];
      return TEAM_TIERS[t.code]?.label === tg.label;
    });
  });

  return (
    <div className="animate-fade-up">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <p className="eyebrow-red">{withSweepstake ? 'Step 02 / 04 · Build squad' : 'Step 01 / 03 · Build squad'}</p>
          <p className="eyebrow" style={{ color: 'rgba(245,241,232,0.55)' }}>Entries close · {ENTRY_DEADLINE}</p>
        </div>
        <h1 className="head" style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}>
          My <span style={{ color: '#E33A3A' }}>Golden</span> Six.
        </h1>
        <hr className="programme-rule-strong mt-5 mb-4" />
        <p className="max-w-xl" style={{ color: 'rgba(245,241,232,0.7)', lineHeight: 1.55, fontSize: 15 }}>
          Pick 6 teams. Spend up to {BUDGET} points.
        </p>
        <div className="mt-3 space-y-1">
          {[
            'Win = 3 pts',
            'Draw = 1 pt',
            'Your team scores 3+ goals in a match = 1 pt',
          ].map(rule => (
            <p key={rule} className="mono" style={{ fontSize: 12, color: 'rgba(245,241,232,0.5)', letterSpacing: '0.05em' }}>
              — {rule}
            </p>
          ))}
        </div>
      </div>

      {/* Prize fund */}
      {(() => {
        const entriesPot = entryCount * 10;
        const pot = entriesPot + 100;
        const hasPot = entriesPot > 0;
        return (
          <div className="programme-card p-5 mb-6">
            <div className="flex items-baseline justify-between mb-3">
              <p className="eyebrow-red">Prize fund</p>
              {hasPot
                ? <p className="head" style={{ fontSize: 18 }}>£{pot} pot · {entryCount} {entryCount === 1 ? 'entry' : 'entries'} + £100</p>
                : <p className="mono" style={{ fontSize: 11, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.05em' }}>£10 × entries + £100</p>}
            </div>
            <hr className="programme-rule mb-3" />
            {[
              { place: '1st', pct: 50 },
              { place: '2nd', pct: 30 },
              { place: '3rd', pct: 20 },
            ].map(({ place, pct }) => (
              <div key={place} className="flex items-baseline justify-between py-2" style={{ borderBottom: '1px solid rgba(245,241,232,0.08)' }}>
                <span style={{ fontSize: 14, color: 'rgba(245,241,232,0.7)' }}>{place}</span>
                <span className="head" style={{ fontSize: 16 }}>
                  {hasPot ? `£${Math.round(pot * pct / 100)}` : `${pct}%`}
                  <span className="mono ml-2" style={{ fontSize: 11, color: 'rgba(245,241,232,0.35)' }}>
                    {hasPot ? `(${pct}%)` : 'of pot'}
                  </span>
                </span>
              </div>
            ))}
            <p className="mono mt-3" style={{ fontSize: 10, color: 'rgba(245,241,232,0.35)', letterSpacing: '0.05em' }}>
              Tied players share the combined prizes for their positions equally.
            </p>
          </div>
        );
      })()}

      {/* Scoreboard — squad + budget */}
      <div className="scoreboard mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="eyebrow" style={{ color: 'rgba(245,241,232,0.5)' }}>Squad</p>
            <p className="scoreboard-digit mt-1" style={{ fontSize: 36 }}>
              {String(picks.length).padStart(2, '0')}<span style={{ color: 'rgba(245,241,232,0.3)' }}>/{SQUAD_SIZE}</span>
            </p>
          </div>
          <div style={{ width: 1, height: 50, background: 'rgba(245,241,232,0.14)' }} />
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-baseline justify-between mb-2">
              <p className="eyebrow" style={{ color: 'rgba(245,241,232,0.5)' }}>Budget</p>
              <p className="scoreboard-digit" style={{ fontSize: 16 }}>
                {budgetUsed} <span style={{ color: 'rgba(245,241,232,0.3)' }}>/ {BUDGET} pts</span>
              </p>
            </div>
            <div className="scoreboard-bar">
              <div style={{
                width: `${budgetPct}%`,
                background: budgetUsed > BUDGET ? '#E33A3A' : '#F5F1E8',
              }} />
            </div>
            <p className="mono mt-2" style={{ fontSize: 10, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.05em' }}>
              {slotsLeft > 0
                ? `${slotsLeft} slot${slotsLeft !== 1 ? 's' : ''} left · ${remainingBudget} pts to spend`
                : budgetUsed > BUDGET
                  ? `${budgetUsed - BUDGET} pts over budget — swap a team`
                  : `Squad full · ${remainingBudget} pts unspent`}
            </p>
          </div>
        </div>
      </div>

      {/* Selected picks chips */}
      {picks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {picks.map((code) => {
            const team = wc2026Teams.find(t => t.code === code);
            const tier = tierFor(code);
            return (
              <button key={code} onClick={() => toggleTeam(code)} className="flex items-center gap-2 mono" style={{
                background: '#19294A',
                border: `1px solid ${tier.color}40`,
                borderLeft: `3px solid ${tier.color}`,
                borderRadius: 2,
                padding: '8px 12px 8px 10px',
                fontSize: 12,
                color: '#F5F1E8',
                letterSpacing: '0.05em',
              }}>
                <span style={{ fontSize: 14 }}>{team?.flag_emoji}</span>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>{team?.name}</span>
                <span className="head" style={{ fontSize: 12, color: tier.color }}>{tier.cost}</span>
                <X size={11} style={{ color: 'rgba(245,241,232,0.4)' }} />
              </button>
            );
          })}
        </div>
      )}

      {/* Duplicate conflict warning */}
      {duplicateConflict && (
        <div className="p-4 mb-6 flex items-start gap-3" style={{ background: 'rgba(227,58,58,0.08)', border: '1px solid rgba(227,58,58,0.4)', borderRadius: 2 }}>
          <AlertCircle size={16} className="shrink-0 mt-0.5" style={{ color: '#E33A3A' }} />
          <div className="flex-1">
            <p className="head" style={{ fontSize: 14, color: '#F5F1E8' }}>{duplicateConflict}</p>
            <p className="mono mt-2" style={{ fontSize: 11, color: 'rgba(245,241,232,0.55)', letterSpacing: '0.05em' }}>Tap a selected team to swap it.</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {picks.map((code, i) => {
                const team = wc2026Teams.find(t => t.code === code);
                return (
                  <button key={code} onClick={() => setSwapIndex(swapIndex === i ? null : i)} className="px-2 py-1 mono" style={{
                    background: swapIndex === i ? 'rgba(227,58,58,0.25)' : 'rgba(245,241,232,0.06)',
                    border: swapIndex === i ? '1px solid rgba(227,58,58,0.6)' : '1px solid rgba(245,241,232,0.14)',
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    borderRadius: 2,
                  }}>
                    {team?.flag_emoji} {team?.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Grouped teams (by tier) */}
      {Object.entries(groupedTeams).map(([label, teams]) => {
        const tg = TIER_GROUPS.find(t => t.label === label);
        const isExpanded = expandedTiers.has(label);
        const toggle = () => setExpandedTiers(prev => {
          const next = new Set(prev);
          next.has(label) ? next.delete(label) : next.add(label);
          return next;
        });
        return (
          <div key={label} className="mb-4">
            <button
              onClick={toggle}
              className="w-full flex items-center gap-4 mb-0"
              style={{ textAlign: 'left' }}
            >
              <p className="head shrink-0" style={{ fontSize: 18, color: tg?.color ?? '#F5F1E8', letterSpacing: '0.04em' }}>{label}</p>
              <p className="mono flex-1 text-center" style={{ fontSize: 11, color: 'rgba(245,241,232,0.28)', letterSpacing: '0.06em' }}>
                {isExpanded ? 'click to collapse' : 'click to expand'}
              </p>
              <p className="mono shrink-0" style={{ fontSize: 11, color: 'rgba(245,241,232,0.45)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {tg?.cost} pt{tg?.cost !== 1 ? 's' : ''} each
              </p>
            </button>
            <hr className="programme-rule mt-3 mb-4" />
            {isExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {teams.map(team => {
                  const isSelected = picks.includes(team.code);
                  const isSwapTarget = swapIndex !== null && picks[swapIndex] === team.code;
                  const isDisabled = !isSelected && !canAddTeam(team.code) && swapIndex === null;
                  return (
                    <KitTile key={team.code} team={team} isSelected={isSelected} isSwapTarget={isSwapTarget} isDisabled={isDisabled}
                      onToggle={() => !isDisabled && toggleTeam(team.code)} />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {error && (
        <div className="text-sm px-4 py-3 mb-5" style={{ background: 'rgba(227,58,58,0.1)', border: '1px solid rgba(227,58,58,0.4)', color: '#FF8A8A', borderRadius: 2 }}>
          {error}
        </div>
      )}

      <button onClick={handleSubmitPicks} disabled={!isValidSquad || loading} className="btn-primary">
        {loading ? 'Saving…'
          : picks.length < SQUAD_SIZE ? `Pick ${SQUAD_SIZE - picks.length} more team${SQUAD_SIZE - picks.length !== 1 ? 's' : ''}`
          : budgetUsed > BUDGET ? `${budgetUsed - BUDGET} pts over budget`
          : duplicateConflict ? 'Resolve duplicate to continue'
          : <>Submit squad <ArrowRight size={16} /></>}
      </button>

    </div>
  );
}

export function PickSixClient(props: Props) {
  return (
    <Suspense fallback={null}>
      <PickSixClientInner {...props} />
    </Suspense>
  );
}
