export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.warn('[apple-wallet-log]', JSON.stringify(body));
  } catch {
    // ignore parse errors
  }
  return new Response(null, { status: 200 });
}
