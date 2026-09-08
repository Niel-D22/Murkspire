/**
 * Server-side Helius proxy.
 *
 * The key used to live in VITE_HELIUS_API_KEY, which Vite inlines into the
 * client bundle — readable by anyone who opens DevTools, and trivially
 * reusable until the quota is gone. It now lives in HELIUS_API_KEY, a server
 * environment variable that never reaches the browser.
 *
 * Two shapes are proxied:
 *   POST /api/helius            JSON-RPC body  -> mainnet.helius-rpc.com
 *   GET  /api/helius?address=X  &limit=N       -> Enhanced Transactions API
 */

export const config = { runtime: 'edge' };

/**
 * Only the methods the dashboard actually calls. Without this the proxy is an
 * open relay to a paid endpoint, and someone could burn the quota with
 * expensive calls the app never makes.
 */
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
      // Responses are identical for every visitor, so let the edge cache them
      // briefly. This is what keeps the upstream quota under control.
      'cache-control': 'public, max-age=10, s-maxage=10, stale-while-revalidate=30',
    },
  });

export default async function handler(req: Request): Promise<Response> {
  const key = process.env.HELIUS_API_KEY;
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
        `https://api.helius.xyz/v0/addresses/${address}/transactions` +
          `?api-key=${key}&limit=${limit}`
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
