export type EntryStats = { P: number; W: number; D: number; L: number; B: number };

type FinishedMatch = {
  home_team_code: string;
  away_team_code: string;
  home_score: number;
  away_score: number;
};

export function computeEntryStats(picks: string[], matches: FinishedMatch[]): EntryStats {
  let P = 0, W = 0, D = 0, L = 0, B = 0;
  for (const m of matches) {
    const pairs: [string, number, number][] = [
      [m.home_team_code, m.home_score, m.away_score],
      [m.away_team_code, m.away_score, m.home_score],
    ];
    for (const [code, scored, conceded] of pairs) {
      if (!picks.includes(code)) continue;
      P++;
      if (scored > conceded) W++;
      else if (scored === conceded) D++;
      else L++;
      if (scored >= 3) B++;
    }
  }
  return { P, W, D, L, B };
}
