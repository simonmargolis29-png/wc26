'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('Invalid or expired reset link. Please request a new one.');
      return;
    }
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) {
        setError('This reset link has expired. Please request a new one.');
      } else {
        setReady(true);
      }
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/dashboard'), 2000);
  }

  return (
    <div className="glass-card p-8">
      {done ? (
        <div className="text-center space-y-3">
          <p className="text-white font-semibold">Password updated</p>
          <p className="text-sm text-white/50">Taking you to your dashboard...</p>
        </div>
      ) : !ready && error ? (
        <div className="text-center space-y-4">
          <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(206,17,38,0.1)', border: '1px solid rgba(206,17,38,0.3)', color: '#ff6b7a' }}>
            {error}
          </div>
          <Link href="/auth/forgot-password" className="block text-sm font-semibold" style={{ color: '#C9A84C' }}>
            Request a new link
          </Link>
        </div>
      ) : ready ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label>New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: '40px' }}
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(240,244,255,0.4)' }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label>Confirm password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(206,17,38,0.1)', border: '1px solid rgba(206,17,38,0.3)', color: '#ff6b7a' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? 'Updating...' : <><KeyRound size={15} /> Set new password</>}
          </button>
        </form>
      ) : (
        <p className="text-center text-sm text-white/40">Verifying link...</p>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(160deg, #0a0e1a 0%, #0d1535 100%)' }}>
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-white text-lg" style={{ background: 'linear-gradient(135deg, #0033A0, #C9A84C)' }}>
            K
          </div>
          <h1 className="text-2xl font-bold text-white">Set new password</h1>
          <p className="text-white/50 text-sm mt-1">Choose a password you haven&apos;t used before</p>
        </div>
        <Suspense fallback={<div className="glass-card p-8 text-center text-sm text-white/40">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
