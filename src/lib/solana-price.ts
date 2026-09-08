/**
 * Live SOL price.
 *
 * Replaces the hardcoded `const solPrice = 98` that every USD figure in the
 * app used to be derived from. At the time of writing SOL trades around $104,
 * so that constant was roughly 6% out and drifting further every day.
 *
 * Jupiter is primary because it is the pricing source the Solana ecosystem
 * itself uses. CoinGecko is the fallback. Both are free and keyless.
 */

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const TTL_MS = 60_000;
const FALLBACK_USD = 100;

let cached: { usd: number; at: number } | null = null;
let inFlight: Promise<number> | null = null;

async function fromJupiter(): Promise<number> {
  const res = await fetch(`https://lite-api.jup.ag/price/v3?ids=${SOL_MINT}`);
  if (!res.ok) throw new Error(`jupiter ${res.status}`);
  const json = await res.json();
  const usd = json?.[SOL_MINT]?.usdPrice;
  if (typeof usd !== 'number' || !Number.isFinite(usd)) throw new Error('jupiter: no price');
  return usd;
}

async function fromCoinGecko(): Promise<number> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
  );
  if (!res.ok) throw new Error(`coingecko ${res.status}`);
  const json = await res.json();
  const usd = json?.solana?.usd;
  if (typeof usd !== 'number' || !Number.isFinite(usd)) throw new Error('coingecko: no price');
  return usd;
}

/** Cached for a minute, and de-duplicated so parallel callers share one request. */
export async function getSolPrice(): Promise<number> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.usd;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      let usd: number;
      try {
        usd = await fromJupiter();
      } catch {
        usd = await fromCoinGecko();
      }
      cached = { usd, at: Date.now() };
      return usd;
    } catch (error) {
      console.warn('[Murkspire] SOL price unavailable, using last known value', error);
      return cached?.usd ?? FALLBACK_USD;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

/**
 * Total SOL supply, needed to derive the real staking yield.
 *
 * The obvious source is the `getSupply` RPC method, but Helius throttles it
 * hard: measured, it hangs past 60s and aborts. CoinGecko publishes the same
 * figure instantly.
 */
let supplyCache: { total: number; at: number } | null = null;
const SUPPLY_TTL_MS = 15 * 60_000;

export async function getSolSupply(): Promise<number | null> {
  if (supplyCache && Date.now() - supplyCache.at < SUPPLY_TTL_MS) return supplyCache.total;
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/coins/solana' +
        '?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false'
    );
    if (!res.ok) throw new Error(`coingecko ${res.status}`);
    const json = await res.json();
    const total = json?.market_data?.total_supply;
    if (typeof total !== 'number' || !Number.isFinite(total)) throw new Error('no supply');
    supplyCache = { total, at: Date.now() };
    return total;
  } catch (error) {
    console.warn('[Murkspire] SOL supply unavailable', error);
    return supplyCache?.total ?? null;
  }
}

/** Stablecoin mints priced 1:1 so their USD value is not simply dropped. */
export const STABLE_MINTS: Record<string, string> = {
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 'USDC',
  Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: 'USDT',
};

export const KNOWN_MINTS: Record<string, string> = {
  ...STABLE_MINTS,
  So11111111111111111111111111111111111111112: 'SOL',
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 'RAY',
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: 'JUP',
  DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: 'BONK',
};
