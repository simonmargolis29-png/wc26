'use client';

import { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';

const countries = [
  'United Kingdom', 'United States', 'Canada', 'Australia', 'Ireland',
  'Germany', 'France', 'Spain', 'Italy', 'Netherlands', 'Portugal',
  'Brazil', 'Argentina', 'Mexico', 'South Africa', 'Nigeria', 'Ghana',
  'Japan', 'South Korea', 'India', 'Other',
];

export function AccountClient({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email,
    date_of_birth: profile.date_of_birth,
    country_of_residence: profile.country_of_residence,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  function update(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('profiles').update(form).eq('id', profile.id);
    if (err) { setError('Failed to save changes.'); } else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setLoading(false);
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Account settings</h1>
        <p className="text-white/50 text-sm">Update your profile information.</p>
      </div>
      <div className="glass-card p-8">
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label>First name</label><input value={form.first_name} onChange={e => update('first_name', e.target.value)} required /></div>
            <div><label>Last name</label><input value={form.last_name} onChange={e => update('last_name', e.target.value)} required /></div>
          </div>
          <div><label>Email address</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} required /></div>
          <div><label>Date of birth</label><input type="date" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} required /></div>
          <div>
            <label>Country of residence</label>
            <select value={form.country_of_residence ?? ''} onChange={e => update('country_of_residence', e.target.value)} required>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {error && <div className="text-sm px-4 py-3 rounded-xl" style={{ background: 'rgba(206,17,38,0.1)', border: '1px solid rgba(206,17,38,0.3)', color: '#ff6b7a' }}>{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {saved ? <><CheckCircle2 size={15} /> Saved!</> : loading ? 'Saving...' : <><Save size={15} /> Save changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
