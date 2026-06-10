import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { wc2026Teams } from '@/data/wc2026-teams';

// Teams excluded from the sweepstake draw pool — not allocated to any entry.
const EXCLUDED_TEAMS = ['QAT', 'UZB', 'JOR', 'IRN', 'HTI', 'CPV', 'COD'];

// Top teams guaranteed a place in the draw pool (so they go to a player) when not all teams are needed.
const PRIORITY_TEAMS = ['ENG', 'ARG', 'BRA', 'FRA', 'ESP', 'NED', 'POR', 'GER', 'BEL', 'USA', 'CRO'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createAdminClient();

  const { data: sweepstake } = await admin.from('sweepstakes').select('id, status').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!sweepstake) return NextResponse.json({ error: 'No sweepstake found' }, { status: 404 });
  if (sweepstake.status === 'drawn') return NextResponse.json({ error: 'Draw has already been run' }, { status: 409 });

  const { data: entries } = await admin
    .from('sweepstake_entries')
    .select('id')
    .eq('sweepstake_id', sweepstake.id)
    .eq('payment_status', 'paid');

  if (!entries || entries.length === 0) return NextResponse.json({ error: 'No paid entries to draw' }, { status: 400 });

  const eligibleTeams = wc2026Teams.filter(t => !EXCLUDED_TEAMS.includes(t.code));
  const maxEntries = Math.floor(eligibleTeams.length / 2);
  if (entries.length > maxEntries) return NextResponse.json({ error: `Too many entries (${entries.length}) — only ${maxEntries} players can get 2 teams from ${eligibleTeams.length}` }, { status: 400 });

  // Guarantee priority teams are included in the pool of teams actually allocated,
  // then fill any remaining slots randomly from the rest.
  const neededCount = entries.length * 2;
  const priorityTeams = eligibleTeams.filter(t => PRIORITY_TEAMS.includes(t.code));
  const restTeams = shuffle(eligibleTeams.filter(t => !PRIORITY_TEAMS.includes(t.code)));
  const pool = [...priorityTeams, ...restTeams].slice(0, neededCount);
  const teams = shuffle(pool);
  const now = new Date().toISOString();

  const updates = entries.map((entry, i) => ({
    id: entry.id,
    team_code: teams[i * 2].code,
    team_code_2: teams[i * 2 + 1].code,
    assigned_at: now,
  }));

  for (const update of updates) {
    const { error } = await admin.from('sweepstake_entries').update({
      team_code: update.team_code,
      team_code_2: update.team_code_2,
      assigned_at: update.assigned_at,
    }).eq('id', update.id);
    if (error) return NextResponse.json({ error: `Failed to update entry ${update.id}: ${error.message}` }, { status: 500 });
  }

  await admin.from('sweepstakes').update({ status: 'drawn' }).eq('id', sweepstake.id);

  return NextResponse.json({ ok: true, drawn: entries.length });
}
