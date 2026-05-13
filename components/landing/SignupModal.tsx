'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Eye, EyeOff, XCircle, Check, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function validatePassword(pw: string) {
  return {
    length: pw.length >= 8,
    letter: /[a-zA-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^a-zA-Z0-9]/.test(pw),
  };
}

interface Props {
  selectedGames: Set<'sweepstake' | 'my-golden-six'>;
  onClose: () => void;
}

export function SignupModal({ selectedGames, onClose }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', dateOfBirth: '',
    password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const pwValid = validatePassword(form.password);
  const pwAllValid = Object.values(pwValid).every(Boolean);

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!pwAllValid) { setError('Password does not meet requirements.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    const dob = new Date(form.dateOfBirth);
    const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) { setError('You must be 18 or older to play.'); return; }

    setLoading(true);
    const supabase = createClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });
    if (authError || !authData.user) {
      setError(authError?.message ?? 'Sign up failed. Please try again.');
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      date_of_birth: form.dateOfBirth,
      is_admin: false,
    });
    if (profileError) {
      setError('Account created but profile setup failed. Please contact support.');
      setLoading(false);
      return;
    }

    if (selectedGames.has('my-golden-six')) {
      router.push('/my-golden-six');
    } else {
      router.push('/sweepstake');
    }
    router.refresh();
  }

  const totalPrice = (selectedGames.has('sweepstake') ? 5 : 0) + (selectedGames.has('my-golden-six') ? 10 : 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{ background: 'rgba(5,11,23,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto"
        style={{
          background: '#111E36',
          border: '1px solid rgba(245,241,232,0.18)',
          borderRadius: 4,
          boxShadow: '8px 8px 0 #E33A3A, 0 40px 100px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="eyebrow-red mb-3">Match-day registration</p>
              <h2 className="head" style={{ fontSize: 32 }}>Team sheet</h2>
            </div>
            <button onClick={onClose} className="p-1.5" style={{ color: 'rgba(245,241,232,0.5)' }}>
              <X size={18} />
            </button>
          </div>

          <hr className="programme-rule mb-4" />

          <div className="flex items-baseline justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {selectedGames.has('sweepstake') && (
                <span className="mono" style={{ fontSize: 11, padding: '5px 10px', border: '1px solid rgba(245,241,232,0.24)', borderRadius: 2, color: '#F5F1E8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Sweepstake
                </span>
              )}
              {selectedGames.has('my-golden-six') && (
                <span className="mono" style={{ fontSize: 11, padding: '5px 10px', border: '1px solid #E33A3A', borderRadius: 2, color: '#E33A3A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  My Golden Six
                </span>
              )}
            </div>
            <p className="head" style={{ fontSize: 22 }}>£{totalPrice}</p>
          </div>
        </div>

        <hr className="programme-rule" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-7 py-7 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>First name</label>
              <input value={form.firstName} onChange={e => update('firstName', e.target.value)} placeholder="Jamie" required />
            </div>
            <div>
              <label>Last name</label>
              <input value={form.lastName} onChange={e => update('lastName', e.target.value)} placeholder="Smith" required />
            </div>
          </div>

          <div>
            <label>Email address</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" required />
          </div>

          <div>
            <label>Date of birth</label>
            <input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} required />
          </div>

          <div>
            <label>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => update('password', e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(245,241,232,0.4)' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
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
                value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(245,241,232,0.4)' }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm px-4 py-3" style={{ background: 'rgba(227,58,58,0.1)', border: '1px solid rgba(227,58,58,0.4)', color: '#FF8A8A', borderRadius: 2 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating account…' : <>Register & continue <ArrowRight size={16} /></>}
          </button>

          <p className="text-center mono" style={{ fontSize: 11, color: 'rgba(245,241,232,0.4)', letterSpacing: '0.05em' }}>
            Already on the team sheet?{' '}
            <a href="/auth/login" className="underline" style={{ color: '#F5F1E8' }}>Sign in</a>
          </p>
        </form>
      </div>
    </div>
  );
}
