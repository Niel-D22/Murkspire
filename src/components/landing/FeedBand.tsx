import { useEffect, useRef, useState } from 'react';
import { FeatureBand } from './FeatureBand';

const ROW_COUNT = 12;

type Template = { type: string; render: () => string };

const WALLETS = [
  'DYw8jC…CNSKK', '86xCnP…o2MMY', 'Fg6PaF…9dLkq', '7xKXtg…2C4rt',
  '9wZk4T…mQ7bd', 'Ct5mQd…3vHaz', 'Jx4wVb…9QmTc',
];
const VALIDATORS = ['F7a3kQ…m9ZtL', 'B3nKjT…qP8Lm', '9cL2pD…xR4vB', '5gVtYz…c2FhQ'];
const DEXES = ['Jupiter', 'Raydium', 'Orca'];

const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const amt = (min: number, max: number) =>
  Math.round(Math.random() * (max - min) + min).toLocaleString('en-US');

const TEMPLATES: Template[] = [
  { type: 'whale_transfer',   render: () => `${amt(400, 9500)} SOL moved from ${pick(WALLETS)}` },
  { type: 'whale_transfer',   render: () => `${amt(400, 9500)} SOL moved to ${pick(WALLETS)}` },
  { type: 'swap_executed',    render: () => `${amt(200, 2400)} SOL → ${amt(30000, 380000)} USDC on ${pick(DEXES)}` },
  { type: 'validator_update', render: () => `${pick(VALIDATORS)} commission ${Math.floor(Math.random() * 4) + 6}% → ${Math.floor(Math.random() * 5)}%` },
  { type: 'stake_delegated',  render: () => `${amt(120, 2800)} SOL delegated to ${pick(VALIDATORS)}` },
  { type: 'epoch_progress',   render: () => `Epoch 743 reached ${Math.floor(Math.random() * 12) + 62}%` },
  { type: 'pool_rebalance',   render: () => `${pick(DEXES)} SOL/USDC pool rebalanced` },
];

interface Event {
  id: number;
  type: string;
  detail: string;
  at: number;
  fresh: boolean;
}

let seq = 0;
const makeEvent = (ageMs: number): Event => {
  const t = pick(TEMPLATES);
  return { id: seq++, type: t.type, detail: t.render(), at: Date.now() - ageMs, fresh: false };
};

const ago = (at: number, now: number) => {
  const s = Math.max(0, Math.floor((now - at) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h`;
};

export function FeedBand() {
  const [events, setEvents] = useState<Event[]>(() =>
    Array.from({ length: ROW_COUNT }, (_, i) => makeEvent((i + 1) * 11_000))
  );
  const [now, setNow] = useState(() => Date.now());
  const [total, setTotal] = useState(342);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced.current) return;

    const clock = setInterval(() => setNow(Date.now()), 1000);
    const feed = setInterval(() => {
      setEvents((prev) => [
        { ...makeEvent(0), fresh: true },
        ...prev.slice(0, ROW_COUNT - 1).map((e) => ({ ...e, fresh: false })),
      ]);
      setTotal((t) => t + 1);
    }, 2400);

    return () => {
      clearInterval(clock);
      clearInterval(feed);
    };
  }, []);

  return (
    <FeatureBand
      reverse
      label="Live Feed"
      headline={
        <>
          Every source,
          <br />
          one stream.
        </>
      }
      body={[
        'Whales, swaps, validators and epochs merged into one log.',
        'Nothing to refresh. It just keeps arriving.',
      ]}
      linkText="Open live feed"
      linkTo="/app/feed"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.07] p-4">
        <span className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spire opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-spire" />
          </span>
          <span className="mono-label !text-spire">Live</span>
        </span>

        <div className="flex gap-2">
          {['All', 'Whale', 'Staking'].map((f, i) => (
            <button
              key={f}
              className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
                i === 0
                  ? 'border-spire/60 bg-spire/10 text-spire'
                  : 'border-white/[0.09] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <span className="ml-auto font-mono text-xs text-zinc-500">
          {total.toLocaleString('en-US')} events today
        </span>
      </div>

      {/* Stream */}
      <div>
        {events.map((e, i) => (
          <div
            key={e.id}
            className={`relative grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/[0.04] px-4 py-2.5 sm:grid-cols-[auto_9.5rem_1fr_auto] sm:px-5 sm:py-2 ${
              e.fresh ? 'animate-row-in' : ''
            }`}
            style={{ opacity: 1 - i * 0.055 }}
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-spire" />

            {/* Stacked on phones; `contents` lets both cells rejoin the grid from sm up */}
            <div className="min-w-0 sm:contents">
              <span className="block truncate font-mono text-[12px] text-spire-300">{e.type}</span>
              <span className="block truncate font-mono text-[12px] text-zinc-400">{e.detail}</span>
            </div>

            <span className="shrink-0 font-mono text-[11px] text-zinc-600">{ago(e.at, now)}</span>
          </div>
        ))}
      </div>

      <div className="px-5 py-3">
        <span className="font-mono text-xs text-zinc-600">Streaming from Solana mainnet</span>
      </div>
    </FeatureBand>
  );
}
