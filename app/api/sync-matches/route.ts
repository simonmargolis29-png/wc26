import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorldCupMatches } from '@/lib/football-api';

// Called by a cron job or manually to sync match results and update points
async function syncMatches(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const matchData = await getWorldCupMatches();
  if (!matchData) return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });

  const finishedMatches = matchData.matches?.filter((m: { status: string }) => m.status === 'FINISHED') ?? [];

  for (const match of finishedMatches) {
    const homeCode: string = match.homeTeam?.tla;
    const awayCode: string = match.awayTeam?.tla;
    const homeScore: number = match.score?.fullTime?.home;
    const awayScore: number = match.score?.fullTime?.away;

    // Upsert match
    await supabase.from('matches').upsert({
      id: String(match.id),
      home_team_code: homeCode,
      away_team_code: awayCode,
      home_score: homeScore,
      away_score: awayScore,
      stage: match.stage,
      match_date: match.utcDate,
      status: match.status,
      updated_at: new Date().toISOString(),
    });

    // Process points for all Pick Six entries
    const { data: entries } = await supabase.from('pick_six_entries').select('id, team_picks, user_id');

    for (const entry of entries ?? []) {
      const picks: string[] = entry.team_picks ?? [];
      const teams = [
        { code: homeCode, scored: homeScore, conceded: awayScore },
        { code: awayCode, scored: awayScore, conceded: homeScore },
      ];

      for (const { code, scored, conceded } of teams) {
        if (!picks.includes(code)) continue;

        let pts = 0;
        let reason: string | null = null;

        if (scored > conceded) { pts = 3; reason = 'win'; }
        else if (scored === conceded) { pts = 1; reason = 'draw'; }

        if (reason) {
          await supabase.from('points_ledger').upsert({
            entry_id: entry.id,
            match_id: String(match.id),
            team_code: code,
            points: pts,
            reason,
          }, { onConflict: 'entry_id,match_id,team_code,reason' });
        }

        // Bonus: 3+ goals
        if (scored >= 3) {
          await supabase.from('points_ledger').upsert({
            entry_id: entry.id,
            match_id: String(match.id),
            team_code: code,
            points: 1,
            reason: 'bonus_goals',
          }, { onConflict: 'entry_id,match_id,team_code,reason' });
        }
      }

      // Recalculate total points for this entry
      const { data: ledger } = await supabase
        .from('points_ledger')
        .select('points')
        .eq('entry_id', entry.id);

      const total = (ledger ?? []).reduce((sum: number, row: { points: number }) => sum + row.points, 0);
      await supabase.from('pick_six_entries').update({ total_points: total }).eq('id', entry.id);
    }
  }

  return NextResponse.json({ ok: true, processed: finishedMatches.length });
}

// Vercel Cron sends GET requests; allow POST too for manual triggers.
export async function GET(request: Request) {
  return syncMatches(request);
}

export async function POST(request: Request) {
  return syncMatches(request);
}
