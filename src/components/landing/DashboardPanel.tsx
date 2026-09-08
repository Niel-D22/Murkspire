import { Activity, TrendingUp, Layers, Settings, Search } from 'lucide-react';
import { LogoMark } from '../brand/Logo';
import { useLiveTicker, relativeTime } from '../../hooks/useLiveTicker';

const STATUS_STYLE: Record<string, string> = {
  confirmed: 'text-emerald-400/90',
  pending: 'text-spire-300',
  failed: 'text-zinc-500',
};

/** The hero product object — a real app window that keeps ticking. */
export function DashboardPanel({ className = '' }: { className?: string }) {
  const { rows, chart, now, txCount } = useLiveTicker(6, 16);

  const max = Math.max(...chart, 1);
  const pts = chart
    .map((v, i) => `${(i / (chart.length - 1)) * 100},${40 - (v / max) * 34}`)
    .join(' ');

  return (
    <div className={`relative ${className}`} style={{ perspective: '1600px' }} aria-hidden="true">
      <div
        className="tilt-panel overflow-hidden rounded-[14px] border border-white/[0.14] bg-[#0E0F12] backdrop-blur-2xl"
        style={{
          boxShadow:
            '0 50px 130px -20px rgba(0,0,0,.95), 0 0 0 1px rgba(255,90,54,.10), 0 -1px 0 rgba(255,255,255,.06) inset',
        }}
      >
        {/* Title bar */}
        <div className="flex items-center gap-4 border-b border-white/[0.07] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-spire/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-black/50 px-3 py-1.5">
            <Search className="h-3 w-3 text-zinc-500" />
            <span className="font-mono text-[10px] text-zinc-500">
              Search wallet, signature, or validator…
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spire opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-spire" />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">Live</span>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-12 flex-col items-center gap-1 border-r border-white/[0.07] py-4 sm:flex">
            <div className="mb-3 rounded-md bg-spire/15 p-1.5 ring-1 ring-spire/30">
              <LogoMark className="h-4 w-4" />
            </div>
            {[Activity, TrendingUp, Layers, Settings].map((Icon, i) => (
              <div key={i} className="rounded-md p-2">
                <Icon className={`h-3.5 w-3.5 ${i === 0 ? 'text-spire' : 'text-zinc-600'}`} />
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="grid flex-1 grid-cols-1 gap-4 p-3 sm:p-4 lg:grid-cols-5">
            {/* Live table */}
            <div className="min-w-0 lg:col-span-3">
              <div className="grid grid-cols-[1.4fr_1fr_.7fr] gap-2 border-b border-white/[0.07] pb-2 sm:grid-cols-[1.4fr_1fr_.8fr_.8fr]">
                {['Wallet', 'Amount', 'Time', 'Status'].map((h) => (
                  <span
                    key={h}
                    className={`mono-label ${h === 'Status' ? 'hidden sm:block' : ''}`}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {rows.map((r) => (
                <div
                  key={r.id}
                  className={`relative grid grid-cols-[1.4fr_1fr_.7fr] items-center gap-2 border-b border-white/[0.04] py-2 sm:grid-cols-[1.4fr_1fr_.8fr_.8fr] ${
                    r.fresh ? 'animate-row-in' : ''
                  }`}
                >
                  {r.fresh && <span className="absolute inset-y-0 left-0 w-[2px] bg-spire" />}
                  <span className="truncate font-mono text-[11px] text-zinc-300 sm:text-[10px]">
                    {r.wallet}
                  </span>
                  <span className="font-mono text-[11px] font-medium text-spire sm:text-[10px]">
                    {r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500 sm:text-[10px]">
                    {relativeTime(r.at, now)}
                  </span>
                  <span className={`hidden font-mono text-[10px] sm:block ${STATUS_STYLE[r.status]}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Chart + stats — the table alone carries the story on small screens */}
            <div className="hidden flex-col gap-3 lg:col-span-2 lg:flex">
              <div className="rounded-xl border border-white/[0.07] bg-black/45 p-3">
                <span className="mono-label">Transaction Volume</span>
                <svg viewBox="0 0 100 42" className="mt-2 w-full" preserveAspectRatio="none">
                  {[10, 20, 30].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y}
                      stroke="rgba(255,255,255,.05)" strokeWidth=".4" />
                  ))}
                  <polyline
                    points={pts} fill="none" stroke="#FF5A36"
                    strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: 'all .6s cubic-bezier(.22,1,.36,1)' }}
                  />
                </svg>
                <div className="mt-1 flex justify-between">
                  {['00:00', '08:00', '16:00', '24:00'].map((t) => (
                    <span key={t} className="font-mono text-[8px] text-zinc-600">{t}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  ['Total TXs', txCount.toLocaleString('en-US')],
                  ['Validators', '50'],
                  ['Avg Fee', '$0.42'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-white/[0.07] bg-black/45 p-2">
                    <span className="mono-label block truncate">{label}</span>
                    <span className="mt-0.5 block text-sm font-semibold text-bone">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
