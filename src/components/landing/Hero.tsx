import { Link } from 'react-router-dom';
import { ArrowRight, Activity, TrendingUp, Layers, Radio } from 'lucide-react';
import { HeroBackground } from './HeroBackground';
import { DashboardPanel } from './DashboardPanel';
import { Spire } from './Spire';
import { FloatCard } from './FloatCard';
import { CountUp } from './CountUp';

const CHIPS = [
  { icon: Activity,   label: 'Whale Activity' },
  { icon: TrendingUp, label: 'Market Flow' },
  { icon: Layers,     label: 'Staking Monitor' },
  { icon: Radio,      label: 'Live Feed' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-40">
      <HeroBackground />

      <div className="container relative">
        {/* Headline */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-[2.5rem] font-bold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block text-bone">The chain is loud.</span>
            <span className="block text-spire">The signal isn&rsquo;t.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg">
            Murkspire reads Solana in real time: whale movements, market flow,
            validator health, and a live event feed. One dashboard, no keys, no account.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/app" className="pill-primary group w-full px-7 py-3.5 text-sm font-semibold sm:w-auto">
              Launch Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#how-it-works" className="pill-ghost w-full px-7 py-3.5 text-sm font-semibold sm:w-auto">
              See how it works
            </a>
          </div>
        </div>

        {/* Stage: spire + floating cards + product panel */}
        <div className="relative mx-auto mt-12 max-w-5xl sm:mt-20">
          {/* Darkens the sweep directly behind the product so it reads as a solid object */}
          <div
            className="pointer-events-none absolute -inset-x-24 -inset-y-16 -z-10"
            style={{
              background:
                'radial-gradient(ellipse 55% 60% at 50% 55%, rgba(12,13,15,.92) 0%, rgba(12,13,15,.65) 50%, transparent 80%)',
            }}
          />
          {/* Spire rises behind the panel */}
          <div className="pointer-events-none absolute inset-x-0 -top-16 flex justify-center">
            <Spire className="scale-[0.62] opacity-90 sm:scale-75" />
          </div>

          {/* Floating stat cards */}
          <FloatCard
            label="Whale TX / 24h"
            live
            delay={0}
            className="absolute -left-2 top-4 z-20 hidden w-44 sm:block lg:-left-16"
          >
            <CountUp end={128} />
          </FloatCard>

          <FloatCard
            label="Current Epoch"
            delay={1200}
            className="absolute -right-2 top-24 z-20 hidden w-44 sm:block lg:-right-14"
          >
            <CountUp end={743} />
          </FloatCard>

          <FloatCard
            label="Validators Tracked"
            delay={2400}
            className="absolute -left-6 bottom-16 z-20 hidden w-48 lg:block"
          >
            <CountUp end={50} />
          </FloatCard>

          {/* The product */}
          <div className="relative z-10">
            <DashboardPanel />
          </div>

          {/* Glow pooling under the panel */}
          <div
            className="pointer-events-none absolute inset-x-12 -bottom-10 h-32 blur-3xl"
            style={{ background: 'radial-gradient(ellipse at center, rgba(255,90,54,.22), transparent 70%)' }}
          />
        </div>

      {/* Feature chips — infinite marquee drifting left */}
      <div className="relative mt-20">
        <p className="mono-label text-center">Monitor in real time</p>
        <div className="mask-fade-x mt-5 overflow-hidden">
          <div className="marquee-track gap-3">
            {/* two identical halves so the -50% translate loops seamlessly */}
            {[0, 1].map((half) => (
              <div key={half} className="flex shrink-0 gap-3 pr-3" aria-hidden={half === 1}>
                {Array.from({ length: 4 }).flatMap((_, rep) =>
                  CHIPS.map(({ icon: Icon, label }, i) => (
                    <span
                      key={`${half}-${rep}-${i}`}
                      className="glass-sm inline-flex shrink-0 items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-zinc-300"
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 text-spire" />
                      {label}
                    </span>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
