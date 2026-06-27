import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  return profile?.is_admin ? user : null;
}

// Mark a team as eliminated
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { teamCode } = await request.json();
  if (!teamCode) return NextResponse.json({ error: 'teamCode required' }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from('eliminated_teams').upsert({ team_code: teamCode });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// Reinstate a team (remove from eliminated)
export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { teamCode } = await request.json();
  if (!teamCode) return NextResponse.json({ error: 'teamCode required' }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from('eliminated_teams').delete().eq('team_code', teamCode);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
