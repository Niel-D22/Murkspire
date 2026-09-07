import { Search, ChevronDown } from 'lucide-react';
import { FeatureBand } from './FeatureBand';

/* Real Solana base58 addresses — the three monitored wallets from
   src/lib/helius.ts plus representative entries. No 0x anywhere. */
const ROWS = [
  { wallet: '86xCnP…o2MMY', amount: '1,240.55', time: '2m ago',  status: 'confirmed' },
  { wallet: 'DYw8jC…CNSKK', amount: '8,902.10', time: '6m ago',  status: 'confirmed' },
  { wallet: '3emsAV…KFVaa', amount: '415.80',   time: '12m ago', status: 'pending'   },
  { wallet: 'Fg6PaF…9dLkq', amount: '2,317.44', time: '18m ago', status: 'confirmed', hot: true },
  { wallet: '7xKXtg…2C4rt', amount: '988.02',   time: '24m ago', status: 'confirmed' },
  { wallet: '9wZk4T…mQ7bd', amount: '4,105.90', time: '31m ago', status: 'confirmed' },
  { wallet: 'Bv2rNs…8LpXe', amount: '672.30',   time: '38m ago', status: 'failed'    },
  { wallet: 'Ct5mQd…3vHaz', amount: '1,884.15', time: '45m ago', status: 'confirmed' },
  { wallet: 'Hn8kLp…6YtRw', amount: '231.67',   time: '52m ago', status: 'pending'   },
  { wallet: 'Jx4wVb…9QmTc', amount: '3,540.22', time: '1h ago',  status: 'confirmed' },
];

/* Columns are dropped progressively: wallet + amount always, time from sm,
   status from lg. Keeps the table dense without ever overflowing. */
const COLS =
  'grid items-center gap-3 px-4 grid-cols-[1.4fr_1fr] ' +
  'sm:grid-cols-[1.5fr_1.2fr_.9fr] sm:gap-4 sm:px-5 ' +
  'lg:grid-cols-[1.5fr_1.2fr_.9fr_.9fr]';

function Filter({ children }: { children: string }) {
  return (
    <button className="flex items-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.02] px-3 py-2 text-xs text-zinc-300 transition-colors hover:border-white/20">
      {children}
      <ChevronDown className="h-3 w-3 text-zinc-500" />
    </button>
  );
}

export function WhaleBand() {
  return (
    <FeatureBand
      label="Whale Activity"
      headline={<>Large transfers,<br />surfaced as they land.</>}
      body={[
        'Track the biggest Solana wallets in real time.',
        'See large transfers the moment they hit the chain.',
      ]}
      linkText="Open whale tracker"
      linkTo="/app/whale"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.07] p-4">
        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-lg border border-white/[0.09] bg-black/40 px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          <span className="font-mono text-xs text-zinc-500">Search wallet or signature…</span>
        </div>
        <Filter>All types</Filter>
        <Filter>Last 24h</Filter>
        <span className="font-mono text-xs text-zinc-500">128 results</span>
      </div>

      {/* Header */}
      <div className={`${COLS} border-b border-white/[0.07] py-2.5`}>
        {['Wallet', 'Amount', 'Time', 'Status'].map((h, i) => (
          <span
            key={h}
            className={`mono-label ${i === 1 ? 'text-right' : ''} ${
              h === 'Time' ? 'hidden sm:block' : ''
            } ${h === 'Status' ? 'hidden lg:block' : ''}`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows — tight, like a working table */}
      <div>
        {ROWS.map((r) => (
          <div
            key={r.wallet}
            className={`${COLS} relative border-b border-white/[0.04] py-2.5 transition-colors hover:bg-white/[0.02] ${
              r.hot ? 'bg-spire/[0.05]' : ''
            }`}
          >
            {r.hot && <span className="absolute inset-y-0 left-0 w-[2px] bg-spire" />}
            <span className="truncate font-mono text-[13px] text-zinc-200">{r.wallet}</span>
            <span className="text-right font-mono text-[13px] font-medium text-spire">
              {r.amount}
              <span className="ml-1.5 text-[11px] font-normal text-zinc-500">SOL</span>
            </span>
            <span className="hidden font-mono text-xs text-zinc-500 sm:block">{r.time}</span>
            <span className="hidden font-mono text-xs text-zinc-400 lg:block">{r.status}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="border-b border-spire pb-0.5 text-spire">1</span>
          {['2', '3', '…', '13'].map((p) => (
            <span key={p} className="cursor-pointer text-zinc-500 transition-colors hover:text-zinc-200">{p}</span>
          ))}
        </div>
        <span className="font-mono text-xs text-zinc-500">Showing 10 of 128</span>
      </div>
    </FeatureBand>
  );
}
