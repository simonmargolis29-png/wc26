export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return Response.json({
    supabaseUrl: url ? `${url.slice(0, 20)}…` : '(not set)',
    supabaseKey: key ? `${key.slice(0, 10)}…` : '(not set)',
    urlValid: url.trim().startsWith('https://'),
    urlHasWhitespace: url !== url.trim(),
    keyHasWhitespace: key !== key.trim(),
    keyLength: key.length,
  });
}
