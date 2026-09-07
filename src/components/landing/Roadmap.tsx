import { useEffect, useRef, useState } from 'react';
import { useScrollProgress, mapRange } from './useScrollProgress';

/* Track and path share one coordinate space so nodes always sit exactly on
   the curve. TRACK_W is both the SVG viewBox width and the pixel width of the
   scrolling track. */
const TRACK_W = 2560;
const TRACK_H = 580;

/* A card is ~200px tall and sits 40px clear of its node, so a node's Y must
   stay within [CARD_REACH, TRACK_H - CARD_REACH] or the card gets clipped.
   That constraint is what sets the Y values below. */
const CARD_REACH = 240;

const NODES = [
  { x: 210, y: 312 },
  { x: 780, y: 244 },
  { x: 1340, y: 322 },
  { x: 1900, y: 240 },
  { x: 2400, y: 296 },
];

const PATH = [
  `M ${NODES[0].x} ${NODES[0].y}`,
  `C 430 312 560 244 ${NODES[1].x} ${NODES[1].y}`,
  `C 1000 244 1120 322 ${NODES[2].x} ${NODES[2].y}`,
  `C 1560 322 1680 240 ${NODES[3].x} ${NODES[3].y}`,
  `C 2120 240 2200 296 ${NODES[4].x} ${NODES[4].y}`,
].join(' ');

type Status = 'shipped' | 'building' | 'planned';

const MILESTONES: Array<{
  tag: string;
  title: string;
  body: string;
  status: Status;
  items: string[];
}> = [
  {
    tag: 'Now',
    title: 'Four live modules',
    body: 'Whales, market flow, validators and a merged feed, straight from mainnet.',
    status: 'shipped',
    items: ['Helius RPC', '30s refresh', 'No account'],
  },
  {
    tag: 'Next',
    title: 'Real market data',
    body: 'Market flow still runs on generated figures. Live Jupiter quotes replace them.',
    status: 'building',
    items: ['Jupiter quotes', 'Live SOL price'],
  },
  {
    tag: 'Then',
    title: 'Your own watchlist',
    body: 'Three wallets are hardcoded today. Paste any address and follow it instead.',
    status: 'planned',
    items: ['Any address', 'Saved locally'],
  },
  {
    tag: 'Then',
    title: 'Alerts',
    body: 'A whale moves at three in the morning. Push it to X or Telegram.',
    status: 'planned',
    items: ['Threshold rules', 'Telegram'],
  },
  {
    tag: 'Later',
    title: 'History',
    body: 'Everything is live only. Snapshots turn a dashboard into a record.',
    status: 'planned',
    items: ['Epoch history', 'Export'],
  },
];

const STATUS_STYLE: Record<Status, string> = {
  shipped: 'border-spire/45 bg-spire/12 text-spire',
  building: 'border-spire/25 bg-spire/[0.06] text-spire-300',
  planned: 'border-white/10 bg-white/[0.03] text-zinc-500',
};

const STATUS_LABEL: Record<Status, string> = {
  shipped: 'Shipped',
  building: 'In progress',
  planned: 'Planned',
};

export function Roadmap() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const areaRef = useRef<HTMLDivElement>(null);
  const [{ travel, scale }, setFit] = useState({ travel: 0, scale: 1 });

  // Eased slide. A CSS transition on a value that changes every frame fights
  // itself, so the smoothing is done here instead.
  const target = useRef(0);
  const [slide, setSlide] = useState(0);
  const raf = useRef<number | null>(null);

  /* The track is a fixed 2560x580 canvas. On a short window that height does
     not fit between the header and the bottom of the viewport, and the old
     code simply let overflow-hidden slice the cards off. Scale it down to the
     space actually available instead, and derive the slide distance from the
     scaled width. */
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      const s = Math.min(1, height / TRACK_H);
      // translate happens inside the scaled wrapper, so it is in unscaled units
      setFit({ scale: s, travel: Math.max(0, TRACK_W - width / s + 48) });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    // Hold briefly at each end so the first and last cards can be read.
    target.current = mapRange(progress, 0.1, 0.9);
  }, [progress]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSlide(target.current);
      return;
    }
    let value = 0;
    const loop = () => {
      value += (target.current - value) * 0.11;
      setSlide((prev) => (Math.abs(prev - value) > 0.0004 ? value : prev));
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  const drawn = mapRange(slide, 0, 0.95);

  return (
    <section ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        {/* Header. pt clears the fixed navigation bar. */}
        <div className="container relative z-10 shrink-0 pb-5 pt-20 sm:pb-7">
          <span className="eyebrow">Roadmap</span>
          <h2 className="mt-4 max-w-2xl text-2xl font-bold leading-[1.12] tracking-tight sm:mt-5 sm:text-4xl">
            <span className="block text-bone">Live today.</span>
            <span className="block text-spire">Honest about the rest.</span>
          </h2>
        </div>

        {/* Track. Scales down on short viewports so nothing is ever clipped. */}
        <div ref={areaRef} className="relative min-h-0 flex-1 overflow-hidden pb-6">
          <div className="absolute inset-0 flex items-center">
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}>
              <div
                className="relative will-change-transform"
                style={{
                  width: TRACK_W,
                  height: TRACK_H,
                  transform: `translate3d(${-slide * travel}px,0,0)`,
                }}
              >
              <svg
                viewBox={`0 0 ${TRACK_W} ${TRACK_H}`}
                width={TRACK_W}
                height={TRACK_H}
                className="absolute inset-0"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="rm-line" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FF5A36" />
                    <stop offset="60%" stopColor="#FF5A36" />
                    <stop offset="100%" stopColor="#FF5A36" stopOpacity=".35" />
                  </linearGradient>
                </defs>

                {/* Unlit rail */}
                <path
                  d={PATH}
                  fill="none"
                  stroke="rgba(255,255,255,.09)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Lit portion, drawn as the section scrolls */}
                <path
                  d={PATH}
                  fill="none"
                  stroke="url(#rm-line)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - drawn}
                  style={{ filter: 'drop-shadow(0 0 6px rgba(255,90,54,.55))' }}
                />
              </svg>

              {MILESTONES.map((m, i) => {
                const node = NODES[i];
                const above = i % 2 === 1;
                const lit = drawn >= (i + 0.3) / MILESTONES.length;

                return (
                  <div key={m.title}>
                    <span
                      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500"
                      style={{
                        left: node.x,
                        top: node.y,
                        width: lit ? 14 : 10,
                        height: lit ? 14 : 10,
                        background: lit ? '#FF5A36' : '#2A2D33',
                        boxShadow: lit ? '0 0 22px 4px rgba(255,90,54,.45)' : 'none',
                        border: lit ? 'none' : '2px solid rgba(255,255,255,.14)',
                      }}
                    />

                    <article
                      className="absolute w-[290px] rounded-[14px] border bg-[#101114] p-5 transition-all duration-500"
                      style={{
                        left: node.x - 145,
                        top: above ? node.y - CARD_REACH : node.y + 40,
                        borderColor: lit ? 'rgba(255,90,54,.28)' : 'rgba(255,255,255,.09)',
                        opacity: lit ? 1 : 0.4,
                        transform: `translateY(${lit ? 0 : 10}px)`,
                        boxShadow: lit ? '0 24px 60px -24px rgba(255,90,54,.35)' : 'none',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="mono-label">{m.tag}</span>
                        <span
                          className={`rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] ${STATUS_STYLE[m.status]}`}
                        >
                          {STATUS_LABEL[m.status]}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-semibold tracking-tight text-bone">
                        {m.title}
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{m.body}</p>

                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {m.items.map((it) => (
                          <li
                            key={it}
                            className="rounded border border-white/[0.08] px-2 py-1 font-mono text-[10px] text-zinc-500"
                          >
                            {it}
                          </li>
                        ))}
                      </ul>
                    </article>
                  </div>
                );
              })}
              </div>
            </div>
          </div>

          {/* Edge fades so cards dissolve rather than getting sliced */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-murk to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-murk to-transparent sm:w-24" />
        </div>
      </div>
    </section>
  );
}
