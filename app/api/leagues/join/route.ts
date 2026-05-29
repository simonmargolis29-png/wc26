import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: entry } = await supabase
    .from('pick_six_entries').select('id').eq('user_id', user.id).maybeSingle();
  if (!entry) return NextResponse.json({ error: 'You must enter My Golden Six before joining a league.' }, { status: 400 });

  const { code } = await request.json();
  if (!code?.trim()) return NextResponse.json({ error: 'Invite code is required.' }, { status: 400 });

  const { data: league } = await supabase
    .from('leagues').select('*').ilike('invite_code', code.trim()).eq('type', 'private').maybeSingle();
  if (!league) return NextResponse.json({ error: 'No league found with that code.' }, { status: 404 });

  const { data: existing } = await supabase
    .from('league_members').select('id').eq('league_id', league.id).eq('user_id', user.id).maybeSingle();
  if (existing) return NextResponse.json({ error: 'You are already in this league.' }, { status: 400 });

  const { error } = await supabase.from('league_members').insert({ league_id: league.id, user_id: user.id });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ league });
}
