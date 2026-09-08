import { ChevronDown } from 'lucide-react';
import { FeatureBand } from './FeatureBand';

const Y_MAX = 4.5;
const Y_TICKS = [4.5, 3, 1.5, 0];
const X_TICKS = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

/* Shape of the day: flat morning, dip near 06:00, climb to a 15:00
   peak, pull back, then recover into the close. */
const CONTROL: Array<[number, number]> = [
  [0, 2.20], [2, 2.42], [4, 2.08], [6, 1.44], [8, 1.92], [10, 2.48],
  [12, 2.92], [14, 3.52], [15, 3.91], [16, 3.58], [18, 2.88],
  [19, 2.74], [21, 3.02], [23, 3.55], [24, 3.62],
];

/** Deterministic jitter so the line reads as live-sampled, not idealised. */
function buildSeries(n = 130) {
  let seed = 20260907;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);

  return Array.from({ length: n }, (_, i) => {
    const hour = (i / (n - 1)) * 24;
    let k = 0;
    while (k < CONTROL.length - 2 && CONTROL[k + 1][0] < hour) k++;
    const [h0, v0] = CONTROL[k];
    const [h1, v1] = CONTROL[k + 1];
    const base = v0 + ((v1 - v0) * (hour - h0)) / (h1 - h0);
    return Math.max(0.6, base + (rand() - 0.5) * 0.22);
  });
}

const SERIES = buildSeries();
const PEAK_X = (15 / 24) * 100;
const PEAK_Y = (1 - 3.91 / Y_MAX) * 100;

const LINE = SERIES.map(
  (v, i) => `${(i / (SERIES.length - 1)) * 100},${60 - (v / Y_MAX) * 60}`
).join(' ');
const AREA = `0,60 ${LINE} 100,60`;

const DEXES = [
  { name: 'Jupiter', volume: '$2.41M', share: 56.3 },
  { name: 'Raydium', volume: '$1.18M', share: 27.6 },
  { name: 'Orca', volume: '$0.69M', share: 16.1 },
];

function Timeframe({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
        active
          ? 'border-spire/60 bg-spire/10 text-spire'
          : 'border-white/[0.09] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
      }`}
    >
      {label}
    </span>
  );
}

export function MarketBand() {
  return (
    <FeatureBand
      reverse
      label="Market Flow"
      headline={
        <>
          Follow the capital,
          <br />
          not the chatter.
        </>
      }
      body={[
        'Real-time flow, from smart money to major pools.',
        'See where capital moves before the crowd.',
      ]}
      linkText="Open market flow"
      linkTo="/app/market"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
        <span aria-hidden="true" className="flex items-center gap-2 rounded-lg border border-white/[0.09] bg-black/40 px-3 py-2 font-mono text-xs text-zinc-200 transition-colors hover:border-white/20 sm:gap-3 sm:text-sm">
          SOL / USDC
          <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
        </span>

        <div className="flex gap-1.5 sm:gap-2">
          <Timeframe label="1H" />
          <Timeframe label="24H" active />
          <Timeframe label="7D" />
          <Timeframe label="30D" />
        </div>

        <div className="ml-auto flex items-baseline gap-3">
          <div className="text-right">
            <span className="mono-label block">24h Volume</span>
            <span className="font-mono text-lg text-bone">$4.28M</span>
          </div>
          <span className="font-mono text-sm text-spire">+12.4%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative px-4 pb-2">
        <div className="relative pl-12">
          {/* Y axis */}
          <div className="absolute inset-y-0 left-0 flex w-11 flex-col justify-between pb-6 text-right">
            {Y_TICKS.map((t) => (
              <span key={t} className="font-mono text-[10px] leading-none text-zinc-600">
                ${t === 0 ? '0' : `${t}M`}
              </span>
            ))}
          </div>

          <svg
            viewBox="0 0 100 60"
            preserveAspectRatio="none"
            className="h-[240px] w-full sm:h-[280px]"
          >
            <defs>
              <linearGradient id="mf-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5A36" stopOpacity=".38" />
                <stop offset="70%" stopColor="#FF5A36" stopOpacity=".06" />
                <stop offset="100%" stopColor="#FF5A36" stopOpacity="0" />
              </linearGradient>
            </defs>

            {Y_TICKS.map((t) => (
              <line
                key={t}
                x1="0"
                x2="100"
                y1={60 - (t / Y_MAX) * 60}
                y2={60 - (t / Y_MAX) * 60}
                stroke="rgba(255,255,255,.06)"
                strokeWidth=".3"
                strokeDasharray="1.5 1.5"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            <polygon points={AREA} fill="url(#mf-fill)" />
            <polyline
              points={LINE}
              fill="none"
              stroke="#FF5A36"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* Latest point + tooltip */}
          <span
            className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-spire ring-2 ring-[#101114]"
            style={{ left: `calc(3rem + ${PEAK_X}% - 3rem * ${PEAK_X / 100})`, top: `${PEAK_Y}%` }}
          />
          <span
            className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded-md border border-white/[0.12] bg-[#16181C] px-2.5 py-1 font-mono text-[11px] text-zinc-200 shadow-lg"
            style={{
              left: `calc(3rem + ${PEAK_X}% - 3rem * ${PEAK_X / 100})`,
              top: `calc(${PEAK_Y}% - 2.5rem)`,
            }}
          >
            14:20 &middot; $3.91M
          </span>

          {/* X axis */}
          {/* Every other label is dropped on phones so they never collide */}
          <div className="mt-2 flex justify-between">
            {X_TICKS.map((t, i) => (
              <span
                key={t}
                className={`font-mono text-[10px] text-zinc-600 ${
                  i % 2 === 1 ? 'hidden sm:inline' : ''
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* DEX breakdown */}
      <div className="border-t border-white/[0.07] p-4">
        <span className="mono-label">DEX Breakdown</span>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {DEXES.map((d, i) => (
            <div key={d.name} className={i > 0 ? 'sm:border-l sm:border-white/[0.07] sm:pl-4' : ''}>
              <p className="font-mono text-sm text-zinc-200">{d.name}</p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="font-mono text-base text-spire">{d.volume}</span>
                <span className="font-mono text-xs text-zinc-500">{d.share}%</span>
              </div>
              <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full rounded-full bg-spire" style={{ width: `${d.share}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </FeatureBand>
  );
}
