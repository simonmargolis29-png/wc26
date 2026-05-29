import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: league } = await supabase
    .from('leagues').select('created_by').eq('id', id).maybeSingle();
  if (!league || league.created_by !== user.id)
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 400 });
  if (userId === user.id) return NextResponse.json({ error: 'Cannot eject the league creator.' }, { status: 400 });

  const { error } = await supabase
    .from('league_members').delete().eq('league_id', id).eq('user_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
