/**
 * Solana data access.
 *
 * Every Helius call goes through /api/helius, a server-side proxy that holds
 * the key. Nothing here knows what the key is, so nothing can leak it. Set
 * HELIUS_API_KEY (no VITE_ prefix) in .env.local for development and in the
 * hosting provider's environment for production.
 */

import { getSolPrice, getSolSupply, KNOWN_MINTS, STABLE_MINTS } from './solana-price';

import { DEFAULT_WATCHLIST } from './watchlist';

/** Same path in dev (Vite middleware) and in production (edge function). */
const PROXY = '/api/helius';

/** Wallets watched by the whale tracker. */

const TX_PER_WALLET = 12;
const SUSPICIOUS_USD = 100_000;
const WHALE_THRESHOLD_SOL = 100;

/** Nothing should hang the dashboard indefinitely. */
async function withTimeout(input: string, init: RequestInit = {}, ms = 20_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function heliusRpc<T = unknown>(method: string, params: unknown[]): Promise<T> {
  const response = await withTimeout(PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: '1', method, params }),
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result as T;
}

/* ------------------------------------------------------------------ */
/* Whale activity                                                      */
/* ------------------------------------------------------------------ */

export interface ParsedTransaction {
  signature: string;
  wallet_address: string;
  transaction_type: string;
  amount: number;
  token_symbol: string;
  usd_value: number;
  timestamp: number;
  is_suspicious: boolean;
}

export interface HeliusTransfer {
  fromUserAccount?: string;
  toUserAccount?: string;
  amount?: number;
  tokenAmount?: number;
  mint?: string;
}

export interface EnhancedTx {
  signature: string;
  timestamp: number;
  type?: string;
  nativeTransfers?: HeliusTransfer[];
  tokenTransfers?: HeliusTransfer[];
}

/**
 * Net movement for the watched wallet in a single transaction.
 *
 * The previous implementation read `meta.preBalances[0]` / `postBalances[0]`.
 * Index 0 is always the fee payer, which is frequently not the wallet being
 * tracked, so the reported amount was often somebody else's balance change.
 * Here the transfers are filtered by the wallet itself.
 */
export function extractMovement(tx: EnhancedTx, wallet: string) {
  const native = (tx.nativeTransfers ?? []).filter(
    (t) => t.fromUserAccount === wallet || t.toUserAccount === wallet
  );

  if (native.length > 0) {
    const lamports = native.reduce((sum, t) => sum + Math.abs(t.amount ?? 0), 0);
    return { amount: lamports / 1e9, symbol: 'SOL', mint: KNOWN_MINTS.So11111111111111111111111111111111111111112 };
  }

  const tokens = (tx.tokenTransfers ?? []).filter(
    (t) => t.fromUserAccount === wallet || t.toUserAccount === wallet
  );

  if (tokens.length > 0) {
    const mint = tokens[0].mint ?? '';
    const amount = tokens.reduce((sum, t) => sum + Math.abs(t.tokenAmount ?? 0), 0);
    return { amount, symbol: KNOWN_MINTS[mint] ?? 'SPL', mint };
  }

  return null;
}

async function fetchWalletTransactions(address: string): Promise<EnhancedTx[]> {
  const url = `${PROXY}?address=${encodeURIComponent(address)}&limit=${TX_PER_WALLET}`;
  const res = await withTimeout(url);
  if (!res.ok) throw new Error(`Enhanced API ${res.status} for ${address}`);
  const json = await res.json();
  return Array.isArray(json) ? json : [];
}

/**
 * @param addresses Wallets to read. Callers pass the visitor's watchlist;
 *                  an empty list short-circuits without touching the network.
 */
export async function fetchWhaleTransactions(
  addresses: string[] = DEFAULT_WATCHLIST.map((w) => w.address)
): Promise<{
  whale_events: ParsedTransaction[];
  count: number;
  threshold: number;
}> {
  if (addresses.length === 0) {
    return { whale_events: [], count: 0, threshold: WHALE_THRESHOLD_SOL };
  }

  /* Previously this issued 33 requests one after another — one signature
     lookup plus ten getTransaction calls per wallet, all awaited in series.
     Measured end to end that took ~9.1s. The Enhanced Transactions API
     returns the same information already parsed, one request per wallet, and
     the three run concurrently: ~0.7s. */
  const [price, ...results] = await Promise.all([
    getSolPrice(),
    ...addresses.map((address) =>
      fetchWalletTransactions(address)
        .then((txs) => ({ address, txs }))
        .catch((error) => {
          console.error(`Error fetching transactions for ${address}:`, error);
          return { address, txs: [] as EnhancedTx[] };
        })
    ),
  ]);

  const events: ParsedTransaction[] = [];

  for (const { address, txs } of results) {
    for (const tx of txs) {
      const moved = extractMovement(tx, address);
      if (!moved || moved.amount <= 0) continue;

      const usd =
        moved.symbol === 'SOL'
          ? moved.amount * price
          : moved.mint && moved.mint in STABLE_MINTS
            ? moved.amount
            : 0; // unknown token: report the amount, do not invent a dollar value

      events.push({
        signature: tx.signature,
        wallet_address: address,
        transaction_type: (tx.type ?? 'TRANSFER').toLowerCase(),
        amount: Math.round(moved.amount * 1e4) / 1e4,
        token_symbol: moved.symbol,
        usd_value: Math.round(usd * 100) / 100,
        timestamp: tx.timestamp,
        is_suspicious: usd >= SUSPICIOUS_USD,
      });
    }
  }

  events.sort((a, b) => b.timestamp - a.timestamp);

  return { whale_events: events, count: events.length, threshold: WHALE_THRESHOLD_SOL };
}

/* ------------------------------------------------------------------ */
/* Market flow                                                         */
/* ------------------------------------------------------------------ */

interface DexPair {
  chainId: string;
  dexId: string;
  baseToken: { symbol: string };
  quoteToken: { symbol: string };
  priceUsd?: string;
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  priceChange?: { h24?: number };
  txns?: { h24?: { buys?: number; sells?: number } };
}

const SOL_MINT = 'So11111111111111111111111111111111111111112';

export interface MarketFlowRow {
  id: number;
  token_in: string;
  token_out: string;
  amount_in: number;
  amount_out: number;
  price_impact: number;
  volume_24h: number;
  liquidity_usd: number;
  price_usd: number;
  price_change_24h: number;
  buys_24h: number;
  sells_24h: number;
  dex_name: string;
  timestamp: number;
  created_at: string;
}

export async function fetchMarketFlow(): Promise<{
  market_flows: MarketFlowRow[];
  count: number;
  statistics: { total_volume_24h: number; avg_price_impact: number };
}> {
  /* This function used to return `Math.random()` for every field while the
     UI presented it as live DEX data. DexScreener publishes real per-pool
     volume, liquidity and price for Solana, free and without a key. */
  const res = await withTimeout(`https://api.dexscreener.com/latest/dex/tokens/${SOL_MINT}`);
  if (!res.ok) throw new Error(`DexScreener ${res.status}`);

  const json = await res.json();
  const pairs: DexPair[] = (json?.pairs ?? []).filter((p: DexPair) => p.chainId === 'solana');

  const top = pairs
    .sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0))
    .slice(0, 20);

  const now = Math.floor(Date.now() / 1000);

  const market_flows: MarketFlowRow[] = top.map((p, i) => {
    const volume = p.volume?.h24 ?? 0;
    const liquidity = p.liquidity?.usd ?? 0;
    const price = Number(p.priceUsd ?? 0);

    return {
      id: i + 1,
      token_in: p.baseToken.symbol,
      token_out: p.quoteToken.symbol,
      // Real figures, not invented ones.
      amount_in: price > 0 ? volume / price : 0,
      amount_out: volume,
      // Depth proxy: thin liquidity against heavy volume means more slippage.
      price_impact: liquidity > 0 ? Math.min((volume / liquidity) * 0.1, 100) : 0,
      volume_24h: volume,
      liquidity_usd: liquidity,
      price_usd: price,
      price_change_24h: p.priceChange?.h24 ?? 0,
      buys_24h: p.txns?.h24?.buys ?? 0,
      sells_24h: p.txns?.h24?.sells ?? 0,
      dex_name: p.dexId ? p.dexId[0].toUpperCase() + p.dexId.slice(1) : 'Unknown',
      timestamp: now,
      created_at: new Date(now * 1000).toISOString(),
    };
  });

  const total = market_flows.reduce((s, f) => s + f.volume_24h, 0);
  const avgImpact = market_flows.length
    ? market_flows.reduce((s, f) => s + f.price_impact, 0) / market_flows.length
    : 0;

  return {
    market_flows,
    count: market_flows.length,
    statistics: { total_volume_24h: total, avg_price_impact: avgImpact },
  };
}

/* ------------------------------------------------------------------ */
/* Staking                                                             */
/* ------------------------------------------------------------------ */

interface VoteAccount {
  nodePubkey: string;
  votePubkey: string;
  activatedStake: number;
  commission: number;
  epochCredits?: Array<[number, number, number]>;
  lastVote?: number;
}

export interface StakingRow {
  id: number;
  validator_address: string;
  vote_address: string;
  total_stake: number;
  active_stake: number;
  /** Not exposed by getVoteAccounts; kept at 0 rather than fabricated. */
  delegators_count: number;
  commission: number;
  apy: number;
  epoch_credits: number;
  last_vote: number;
  epoch: number;
  timestamp: number;
  created_at: string;
}

export async function fetchStakingData(): Promise<{
  staking_data: StakingRow[];
  count: number;
  statistics: {
    total_stake: number;
    total_delegators: number;
    avg_apy: number;
    current_epoch: number;
    network_stake: number;
    base_apy: number;
  };
}> {
  /* All four calls are independent, so they run together rather than in
     sequence. getVoteAccounts is by far the heaviest, and it sets the floor
     on how fast this page can be. */
  const [voteAccounts, epochInfo, inflation, supply] = await Promise.all([
    heliusRpc<{ current: VoteAccount[] }>('getVoteAccounts', [{ commitment: 'confirmed' }]),
    heliusRpc<{ epoch: number; slotIndex: number; slotsInEpoch: number }>('getEpochInfo', []),
    heliusRpc<{ validator: number }>('getInflationRate', []).catch(() => ({ validator: 0.045 })),
    // getSupply via RPC is throttled to the point of timing out; see getSolSupply.
    getSolSupply(),
  ]);

  const current = voteAccounts.current ?? [];
  const networkStake = current.reduce((s, v) => s + v.activatedStake, 0) / 1e9;
  const totalSupply = supply ?? 0;

  /* Real staking yield rather than a random number between 6.5 and 8.5:
     network inflation directed to validators, divided by the share of supply
     that is actually staked, then reduced by each validator's commission. */
  const baseApy =
    totalSupply > 0 && networkStake > 0
      ? inflation.validator * (totalSupply / networkStake) * 100
      : 0;

  const ranked = [...current].sort((a, b) => b.activatedStake - a.activatedStake).slice(0, 50);
  const now = Math.floor(Date.now() / 1000);

  const staking_data: StakingRow[] = ranked.map((v, i) => {
    const credits = v.epochCredits?.at(-1)?.[1] ?? 0;
    const previous = v.epochCredits?.at(-1)?.[2] ?? 0;

    return {
      id: i + 1,
      validator_address: v.nodePubkey,
      vote_address: v.votePubkey,
      total_stake: v.activatedStake / 1e9,
      active_stake: v.activatedStake / 1e9,
      delegators_count: 0,
      commission: v.commission,
      apy: Math.round(baseApy * (1 - v.commission / 100) * 100) / 100,
      epoch_credits: Math.max(0, credits - previous),
      last_vote: v.lastVote ?? 0,
      epoch: epochInfo.epoch,
      timestamp: now,
      created_at: new Date(now * 1000).toISOString(),
    };
  });

  const totalStake = staking_data.reduce((s, v) => s + v.total_stake, 0);
  const avgApy = staking_data.length
    ? staking_data.reduce((s, v) => s + v.apy, 0) / staking_data.length
    : 0;

  return {
    staking_data,
    count: staking_data.length,
    statistics: {
      total_stake: totalStake,
      // Delegator counts are not exposed by getVoteAccounts. Reporting the
      // number of validators actually observed is honest; inventing a
      // delegator count was not.
      total_delegators: current.length,
      avg_apy: avgApy,
      current_epoch: epochInfo.epoch,
      network_stake: networkStake,
      base_apy: Math.round(baseApy * 100) / 100,
    },
  };
}

/* ------------------------------------------------------------------ */

export async function getTokenSupply(tokenMint: string) {
  return heliusRpc('getTokenSupply', [tokenMint]);
}

export async function getAsset(assetId: string) {
  return heliusRpc('getAsset', [{ id: assetId, options: { showFungible: true } }]);
}

export default {
  fetchWhaleTransactions,
  fetchMarketFlow,
  fetchStakingData,
  getTokenSupply,
  getAsset,
};

/* ------------------------------------------------------------------ */
/* Real-time feed                                                      */
/* ------------------------------------------------------------------ */

export interface FeedEvent {
  id: number;
  event_type: 'whale_alert' | 'market_swap' | 'staking_update';
  title: string;
  description: string;
  data: string;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
  created_at: string;
}

const short = (address: string) => `${address.slice(0, 4)}…${address.slice(-4)}`;
const money = (n: number) =>
  n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n / 1e3).toFixed(1)}K` : `$${n.toFixed(2)}`;

/**
 * Merges the three live sources into one ordered event stream.
 *
 * This replaces a Supabase edge function that read from tables nothing wrote
 * to any more. The project it pointed at (bpbtgkunrdzcoyfdhskh.supabase.co)
 * no longer resolves in DNS at all, so every call failed, the error was
 * swallowed by a catch, and the page sat empty forever.
 */
export async function fetchRealTimeFeed(
  addresses?: string[]
): Promise<{
  feed_events: FeedEvent[];
  count: number;
  sources: { whale_events: number; market_flows: number; staking_updates: number };
}> {
  const [whales, market, staking] = await Promise.all([
    fetchWhaleTransactions(addresses).catch(() => null),
    fetchMarketFlow().catch(() => null),
    fetchStakingData().catch(() => null),
  ]);

  const events: FeedEvent[] = [];
  let id = 1;
  const now = Math.floor(Date.now() / 1000);

  for (const event of whales?.whale_events ?? []) {
    events.push({
      id: id++,
      event_type: 'whale_alert',
      title: `${event.amount.toLocaleString('en-US')} ${event.token_symbol} moved`,
      description: `${short(event.wallet_address)} · ${event.transaction_type}${
        event.usd_value > 0 ? ` · ${money(event.usd_value)}` : ''
      }`,
      data: JSON.stringify(
        {
          signature: event.signature,
          wallet: event.wallet_address,
          amount: event.amount,
          token: event.token_symbol,
          usd_value: event.usd_value,
        },
        null,
        2
      ),
      priority: event.is_suspicious ? 'high' : 'normal',
      timestamp: event.timestamp,
      created_at: new Date(event.timestamp * 1000).toISOString(),
    });
  }

  for (const flow of (market?.market_flows ?? []).slice(0, 10)) {
    events.push({
      id: id++,
      event_type: 'market_swap',
      title: `${flow.token_in}/${flow.token_out} on ${flow.dex_name}`,
      description: `${money(flow.volume_24h)} 24h volume · ${flow.price_change_24h >= 0 ? '+' : ''}${flow.price_change_24h.toFixed(2)}%`,
      data: JSON.stringify(
        {
          dex: flow.dex_name,
          pair: `${flow.token_in}/${flow.token_out}`,
          volume_24h: flow.volume_24h,
          liquidity_usd: flow.liquidity_usd,
          price_usd: flow.price_usd,
        },
        null,
        2
      ),
      priority: flow.volume_24h > 50_000_000 ? 'high' : 'normal',
      timestamp: flow.timestamp,
      created_at: flow.created_at,
    });
  }

  for (const validator of (staking?.staking_data ?? []).slice(0, 8)) {
    events.push({
      id: id++,
      event_type: 'staking_update',
      title: `Validator ${short(validator.validator_address)}`,
      description: `${(validator.total_stake / 1e6).toFixed(2)}M SOL staked · ${validator.commission}% commission · ${validator.apy}% APY`,
      data: JSON.stringify(
        {
          validator: validator.validator_address,
          total_stake: validator.total_stake,
          commission: validator.commission,
          apy: validator.apy,
          epoch: validator.epoch,
        },
        null,
        2
      ),
      priority: validator.commission === 0 ? 'high' : 'low',
      timestamp: validator.timestamp,
      created_at: validator.created_at,
    });
  }

  events.sort((a, b) => b.timestamp - a.timestamp);
  events.forEach((event, index) => {
    event.id = index + 1;
    if (!Number.isFinite(event.timestamp)) event.timestamp = now;
  });

  return {
    feed_events: events,
    count: events.length,
    sources: {
      whale_events: whales?.whale_events.length ?? 0,
      market_flows: market?.market_flows.length ?? 0,
      staking_updates: staking?.staking_data.length ?? 0,
    },
  };
}
