import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet, ChevronDown, Copy, LogOut, ExternalLink, Check } from 'lucide-react';

export const WalletButton: FC = () => {
  const { publicKey, disconnect, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* Was written as useState(() => ...), which only runs its initialiser once
     on mount and throws the result away, so the balance never arrived after
     connecting. It needs to be an effect keyed on the connected key. */
  useEffect(() => {
    let cancelled = false;
    if (!publicKey || !connected) {
      setBalance(null);
      return;
    }
    connection
      .getBalance(publicKey)
      .then((lamports) => {
        if (!cancelled) setBalance(lamports / LAMPORTS_PER_SOL);
      })
      .catch(() => {
        if (!cancelled) setBalance(null);
      });
    return () => {
      cancelled = true;
    };
  }, [publicKey, connected, connection]);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const short = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;

  const copyAddress = useCallback(() => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [publicKey]);

  if (!connected || !publicKey) {
    return (
      <div className="wallet-button-wrapper">
        <WalletMultiButton />
      </div>
    );
  }

  const address = publicKey.toString();

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-9 items-center gap-2 rounded-[10px] border border-white/[0.09] bg-white/[0.03] px-2.5 transition-colors hover:border-white/20 sm:gap-2.5 sm:px-3"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-spire/15 ring-1 ring-spire/30">
          <Wallet className="h-3 w-3 text-spire" />
        </span>

        {/* Compact on phones: address only. Labels and balance appear when
            there is room for them. */}
        <span className="font-mono text-[12px] text-bone">{short(address)}</span>

        {balance !== null && (
          <span className="hidden border-l border-white/[0.09] pl-2.5 font-mono text-[12px] text-zinc-400 lg:inline">
            {balance.toFixed(2)} SOL
          </span>
        )}

        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="glass absolute right-0 z-50 mt-2 w-[min(17rem,calc(100vw-2rem))] overflow-hidden shadow-glass">
          <div className="border-b border-white/[0.07] p-4">
            <p className="mono-label">Wallet address</p>
            <p className="mt-1.5 break-all font-mono text-[12px] text-bone">{address}</p>

            {balance !== null && (
              <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3">
                <span className="mono-label">Balance</span>
                <span className="font-mono text-base text-spire">{balance.toFixed(4)} SOL</span>
              </div>
            )}
          </div>

          <div className="p-1.5">
            <button
              onClick={copyAddress}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-spire" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-zinc-500" />
              )}
              <span className="text-[13px] text-zinc-300">
                {copied ? 'Copied' : 'Copy address'}
              </span>
            </button>

            <a
              href={`https://solscan.io/account/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
            >
              <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-[13px] text-zinc-300">View on Solscan</span>
            </a>

            <div className="my-1.5 border-t border-white/[0.07]" />

            <button
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
            >
              <LogOut className="h-3.5 w-3.5 text-zinc-500 group-hover:text-spire" />
              <span className="text-[13px] text-zinc-400 group-hover:text-bone">Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
