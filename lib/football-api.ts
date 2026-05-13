const BASE_URL = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY!;

export async function getWorldCupMatches() {
  const res = await fetch(`${BASE_URL}/competitions/WC/matches`, {
    headers: { 'X-Auth-Token': API_KEY },
    next: { revalidate: 300 }, // Cache 5 minutes
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getWorldCupStandings() {
  const res = await fetch(`${BASE_URL}/competitions/WC/standings`, {
    headers: { 'X-Auth-Token': API_KEY },
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  return res.json();
}
