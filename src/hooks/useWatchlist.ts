import { useCallback, useEffect, useState } from 'react';
import {
  DEFAULT_WATCHLIST,
  MAX_ENTRIES,
  STORAGE_KEY,
  isValidSolanaAddress,
  loadWatchlist,
  saveWatchlist,
  type WatchedWallet,
} from '../lib/watchlist';

export interface UseWatchlist {
  wallets: WatchedWallet[];
  /** Returns an error message, or null when the address was added. */
  add: (address: string, label?: string) => string | null;
  remove: (address: string) => void;
  reset: () => void;
  isFull: boolean;
  isDefault: boolean;
}

export function useWatchlist(): UseWatchlist {
  const [wallets, setWallets] = useState<WatchedWallet[]>(loadWatchlist);

  useEffect(() => {
    saveWatchlist(wallets);
  }, [wallets]);

  /* Keep tabs in sync. Without this, adding a wallet in one tab leaves the
     other showing stale results until it is reloaded. */
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setWallets(loadWatchlist());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback(
    (address: string, label?: string): string | null => {
      const trimmed = address.trim();

      if (!trimmed) return 'Enter a wallet address.';
      if (!isValidSolanaAddress(trimmed)) {
        return trimmed.startsWith('0x')
          ? 'That is an Ethereum address. Solana addresses are base58 and never start with 0x.'
          : 'Not a valid Solana address.';
      }

      let error: string | null = null;
      setWallets((current) => {
        if (current.some((w) => w.address === trimmed)) {
          error = 'Already on your watchlist.';
          return current;
        }
        if (current.length >= MAX_ENTRIES) {
          error = `Watchlist is limited to ${MAX_ENTRIES} wallets.`;
          return current;
        }
        return [...current, { address: trimmed, label: label?.trim() || undefined }];
      });
      return error;
    },
    []
  );

  const remove = useCallback((address: string) => {
    setWallets((current) => current.filter((w) => w.address !== address));
  }, []);

  const reset = useCallback(() => setWallets(DEFAULT_WATCHLIST), []);

  const isDefault =
    wallets.length === DEFAULT_WATCHLIST.length &&
    wallets.every((w, i) => w.address === DEFAULT_WATCHLIST[i].address);

  return { wallets, add, remove, reset, isFull: wallets.length >= MAX_ENTRIES, isDefault };
}
