import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: entry } = await supabase
    .from('pick_six_entries').select('id').eq('user_id', user.id).maybeSingle();
  if (!entry) return NextResponse.json({ error: 'You must enter My Golden Six before creating a league.' }, { status: 400 });

  const { name } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'League name is required.' }, { status: 400 });

  let league = null;
  for (let i = 0; i < 5; i++) {
    const { data, error } = await supabase
      .from('leagues')
      .insert({ name: name.trim(), type: 'private', invite_code: generateCode(), created_by: user.id })
      .select().single();
    if (!error) { league = data; break; }
    if (!error.message.includes('unique') && !error.message.includes('duplicate'))
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!league) return NextResponse.json({ error: 'Failed to generate a unique code. Please try again.' }, { status: 500 });

  await supabase.from('league_members').insert({ league_id: league.id, user_id: user.id });

  return NextResponse.json({ league });
}
