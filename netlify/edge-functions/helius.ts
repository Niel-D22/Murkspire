/**
 * Netlify Edge Function: server-side Helius proxy.
 *
 * Mirrors api/helius.ts, which is the Vercel equivalent. The two are kept
 * separate rather than shared because the runtimes differ — Vercel Edge runs
 * on V8 with process.env, Netlify Edge runs on Deno with Netlify.env. The
 * logic is small enough that duplicating it is clearer than shimming it.
 *
 * The key lives in HELIUS_API_KEY, a server variable. It never reaches the
 * browser.
 */

/** Only the methods the dashboard actually calls, so this is not an open relay. */
const ALLOWED_METHODS = new Set([
  'getSignaturesForAddress',
  'getTransaction',
  'getVoteAccounts',
  'getEpochInfo',
  'getInflationRate',
  'getSlot',
  'getBalance',
  'getTokenSupply',
  'getAsset',
]);

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=10, s-maxage=10, stale-while-revalidate=30',
    },
  });

/** Netlify exposes env as Netlify.env; Deno.env is the fallback locally. */
function readKey(): string {
  const g = globalThis as unknown as {
    Netlify?: { env: { get(name: string): string | undefined } };
    Deno?: { env: { get(name: string): string | undefined } };
  };
  return g.Netlify?.env.get('HELIUS_API_KEY') ?? g.Deno?.env.get('HELIUS_API_KEY') ?? '';
}

export default async function handler(req: Request): Promise<Response> {
  const key = readKey();
  if (!key) return json({ error: 'HELIUS_API_KEY is not configured' }, 500);

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const address = url.searchParams.get('address') ?? '';
      const limit = Math.min(Number(url.searchParams.get('limit') ?? 12) || 12, 100);

      if (!BASE58.test(address)) {
        return json({ error: 'address must be a base58 Solana address' }, 400);
      }

      const upstream = await fetch(
        `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${key}&limit=${limit}`
      );
      if (!upstream.ok) return json({ error: `upstream ${upstream.status}` }, 502);
      return json(await upstream.json());
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const method = typeof body?.method === 'string' ? body.method : '';

      if (!ALLOWED_METHODS.has(method)) {
        return json({ error: `method not allowed: ${method || '(missing)'}` }, 403);
      }

      const upstream = await fetch(`https://mainnet.helius-rpc.com/?api-key=${key}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: body.id ?? '1',
          method,
          params: body.params ?? [],
        }),
      });

      if (!upstream.ok) return json({ error: `upstream ${upstream.status}` }, 502);
      return json(await upstream.json());
    }

    return json({ error: 'method not allowed' }, 405);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'proxy failed' }, 500);
  }
}

export const config = { path: '/api/helius' };
