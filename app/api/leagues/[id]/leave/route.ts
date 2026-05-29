import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: league } = await supabase
    .from('leagues').select('created_by').eq('id', id).maybeSingle();
  if (!league) return NextResponse.json({ error: 'League not found.' }, { status: 404 });
  if (league.created_by === user.id)
    return NextResponse.json({ error: 'League creator cannot leave. Delete the league instead.' }, { status: 400 });

  const { error } = await supabase
    .from('league_members').delete().eq('league_id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
