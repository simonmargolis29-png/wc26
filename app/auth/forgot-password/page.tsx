'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(160deg, #0a0e1a 0%, #0d1535 100%)' }}>
      <div className="w-full max-w-sm animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-white text-lg" style={{ background: 'linear-gradient(135deg, #0033A0, #C9A84C)' }}>
            K
          </div>
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="text-white/50 text-sm mt-1">We&apos;ll send you a reset link</p>
        </div>

        <div className="glass-card p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
                <Mail size={20} style={{ color: '#4ade80' }} />
              </div>
              <p className="text-white font-semibold">Check your inbox</p>
              <p className="text-sm text-white/50">
                We&apos;ve sent a reset link to <span className="text-white">{email}</span>. It expires in 1 hour.
              </p>
              <Link href="/auth/login" className="block text-sm font-semibold mt-4" style={{ color: '#C9A84C' }}>
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {error && (
                  <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(206,17,38,0.1)', border: '1px solid rgba(206,17,38,0.3)', color: '#ff6b7a' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <p className="text-center text-sm text-white/40 mt-6">
                <Link href="/auth/login" className="flex items-center justify-center gap-1.5 font-semibold" style={{ color: '#C9A84C' }}>
                  <ArrowLeft size={13} /> Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
