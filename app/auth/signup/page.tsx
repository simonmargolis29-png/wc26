'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, CheckCircle2, XCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function validatePassword(pw: string) {
  return {
    length: pw.length >= 8,
    letter: /[a-zA-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^a-zA-Z0-9]/.test(pw),
  };
}

export default function SignupPage() {
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
    if (age < 18) { setError('You must be 18 or older to participate.'); return; }

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

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(160deg, #0a0e1a 0%, #0d1535 100%)' }}>
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-white text-lg" style={{ background: 'linear-gradient(135deg, #0033A0, #C9A84C)' }}>
            K
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/50 text-sm mt-1">Join kickoff26 for World Cup 2026</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240,244,255,0.4)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  {[
                    { key: 'length', label: 'At least 8 characters' },
                    { key: 'letter', label: 'At least 1 letter' },
                    { key: 'number', label: 'At least 1 number' },
                    { key: 'special', label: 'At least 1 special character' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1.5 text-xs">
                      {pwValid[key as keyof typeof pwValid]
                        ? <CheckCircle2 size={12} style={{ color: '#4ade80' }} />
                        : <XCircle size={12} style={{ color: 'rgba(240,244,255,0.3)' }} />}
                      <span style={{ color: pwValid[key as keyof typeof pwValid] ? '#4ade80' : 'rgba(240,244,255,0.4)' }}>{label}</span>
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
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240,244,255,0.4)' }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(206,17,38,0.1)', border: '1px solid rgba(206,17,38,0.3)', color: '#ff6b7a' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full justify-center py-3 mt-2">
              {loading ? 'Creating account...' : <><UserPlus size={15} /> Create account</>}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold" style={{ color: '#C9A84C' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
