/**
 * The set of wallets the dashboard follows.
 *
 * Until now three addresses were hardcoded, which made the product a demo of
 * somebody else's portfolio. The list now lives in the visitor's own browser:
 * no account, no server, nothing to leak.
 */

const STORAGE_KEY = 'murkspire.watchlist.v1';
const MAX_ENTRIES = 10;

/** Solana addresses are base58 — no 0x, no l/I/0/O. */
const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export interface WatchedWallet {
  address: string;
  /** Optional human label, so a list of base58 strings stays readable. */
  label?: string;
}

/** Seeded for first-time visitors so the dashboard is never empty. */
export const DEFAULT_WATCHLIST: WatchedWallet[] = [
  { address: '86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY', label: 'Whale 1' },
  { address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK', label: 'Whale 2' },
  { address: '3emsAVdmGKERbHjmGfQ6oZ1e35dkf5iYcS6U4CPKFVaa', label: 'Whale 3' },
];

export function isValidSolanaAddress(address: string): boolean {
  return BASE58.test(address.trim());
}

export function shortenAddress(address: string, lead = 4, tail = 4): string {
  return address.length <= lead + tail + 1
    ? address
    : `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

/** Reads the stored list, falling back to the defaults on anything unexpected. */
export function loadWatchlist(): WatchedWallet[] {
  if (typeof window === 'undefined') return DEFAULT_WATCHLIST;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WATCHLIST;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_WATCHLIST;

    const clean = parsed
      .filter(
        (entry): entry is WatchedWallet =>
          typeof entry === 'object' &&
          entry !== null &&
          typeof (entry as WatchedWallet).address === 'string' &&
          isValidSolanaAddress((entry as WatchedWallet).address)
      )
      .slice(0, MAX_ENTRIES);

    // An empty stored list is a deliberate choice, not a reason to re-seed.
    return raw === '[]' ? [] : clean.length > 0 ? clean : DEFAULT_WATCHLIST;
  } catch {
    // Private mode, disabled storage, corrupted JSON — none should break the page.
    return DEFAULT_WATCHLIST;
  }
}

export function saveWatchlist(list: WatchedWallet[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
  } catch {
    // Storage can be unavailable; the in-memory list still works for the session.
  }
}

export { MAX_ENTRIES, STORAGE_KEY };
