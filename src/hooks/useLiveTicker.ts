import { useEffect, useRef, useState } from 'react';

/* A pool of plausible Solana base58 addresses (truncated for display). */
const WALLETS = [
  '86xCnP…o2MMY', 'DYw8jC…CNSKK', '3emsAV…KFVaa', 'Fg6PaF…9dLkq',
  '7xKXtg…2C4rt', '9wZk4T…mQ7bd', 'Bv2rNs…8LpXe', 'Ct5mQd…3vHaz',
  'Hn8kLp…6YtRw', 'Jx4wVb…9QmTc', 'Qp3nHf…5WsGe', 'Ry7tKm…4ZbNu',
  'Lw9xEc…7JhVd', 'Ms2gTa…1PkFr', 'Zv6dRj…8XnBq',
];

const STATUSES = ['confirmed', 'confirmed', 'confirmed', 'pending', 'failed'] as const;

export interface LiveRow {
  id: number;
  wallet: string;
  amount: number;
  at: number;          // epoch ms, so the relative time keeps counting
  status: (typeof STATUSES)[number];
  fresh: boolean;
}

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const amount = () => Math.round((Math.random() * 9000 + 180) * 100) / 100;

export function relativeTime(at: number, now: number) {
  const s = Math.max(0, Math.floor((now - at) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

let seq = 0;
const makeRow = (ageMs: number): LiveRow => ({
  id: seq++,
  wallet: pick(WALLETS),
  amount: amount(),
  at: Date.now() - ageMs,
  status: pick(STATUSES),
  fresh: false,
});

/**
 * Drives the hero panel: a new transaction lands every few seconds,
 * the oldest drops off, relative times keep counting, and the chart
 * gains a point. Disabled entirely under prefers-reduced-motion.
 */
export function useLiveTicker(rowCount = 6, chartPoints = 16) {
  const [rows, setRows] = useState<LiveRow[]>(() =>
    Array.from({ length: rowCount }, (_, i) => makeRow((i + 1) * 145_000))
  );
  const [chart, setChart] = useState<number[]>(() =>
    Array.from({ length: chartPoints }, (_, i) => 20 + i * 3.6 + Math.random() * 14)
  );
  const [now, setNow] = useState(() => Date.now());
  const [txCount, setTxCount] = useState(12_482);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced.current) return;

    // Relative timestamps tick every second.
    const clock = setInterval(() => setNow(Date.now()), 1000);

    // A new transaction lands.
    const feed = setInterval(() => {
      setRows((prev) => [
        { ...makeRow(0), fresh: true },
        ...prev.slice(0, rowCount - 1).map((r) => ({ ...r, fresh: false })),
      ]);
      setTxCount((c) => c + Math.floor(Math.random() * 4) + 1);
      setChart((prev) => {
        const last = prev[prev.length - 1];
        const next = Math.max(12, Math.min(100, last + (Math.random() - 0.42) * 16));
        return [...prev.slice(1), next];
      });
    }, 2600);

    return () => {
      clearInterval(clock);
      clearInterval(feed);
    };
  }, [rowCount]);

  return { rows, chart, now, txCount };
}
