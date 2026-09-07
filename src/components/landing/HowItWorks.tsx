import { Fragment, ReactNode } from 'react';
import AnimatedContent from '../backgrounds/AnimatedContent';
import SpotlightCard from '../backgrounds/SpotlightCard';
import { CountUp } from './CountUp';

/* The RPC methods below are the ones actually called in src/lib/helius.ts —
   this diagram describes the real pipeline, not a generic one. */
const STAGES = [
  {
    kind: 'Source',
    title: 'Solana Mainnet',
    items: ['getSignaturesForAddress', 'getTransaction', 'getVoteAccounts', 'getEpochInfo'],
    note: 'Helius RPC · mainnet-beta',
  },
  {
    kind: 'Process',
    title: 'Murkspire',
    items: ['parse balance deltas', 'resolve token mints', 'rank validators by APY', 'merge into one event stream'],
    note: 'No keys. No custody.',
  },
  {
    kind: 'Output',
    title: 'Your screen',
    items: ['whale activity', 'market flow', 'staking monitor', 'live feed'],
    note: 'Refreshed every 30s',
  },
];

const CONNECTORS = ['JSON-RPC', '30s interval'];

const STATS: Array<{ label: string; value: ReactNode }> = [
  { label: 'Refresh',    value: <><CountUp end={30} />s</> },
  { label: 'Validators', value: <CountUp end={50} /> },
  { label: 'Wallets',    value: <CountUp end={3} /> },
  { label: 'Custody',    value: 'none' },
];

function Connector({ label }: { label: string }) {
  return (
    <div className="relative hidden w-24 shrink-0 items-center lg:flex" aria-hidden="true">
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-zinc-500">
        {label}
      </span>
      <span className="h-px w-full bg-spire/70" />
      <span className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-spire bg-murk" />
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-16 sm:py-24 lg:py-32">
      {/* faint warm pool behind the middle stage */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-64 max-w-3xl blur-3xl"
        style={{ background: 'radial-gradient(ellipse at center, rgba(255,90,54,.10), transparent 70%)' }}
      />

      <div className="container relative">
        {/* Header */}
        <AnimatedContent distance={40} duration={0.7} threshold={0.15}>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="mt-6 text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              <span className="block text-bone">Four hundred million transactions.</span>
              <span className="block text-spire">One screen.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[15px] text-zinc-400">
              From Solana&rsquo;s raw RPC responses to a readable dashboard, in three stages.
            </p>
          </div>
        </AnimatedContent>

        {/* Pipeline */}
        <div className="mt-16 flex flex-col items-stretch gap-6 lg:flex-row lg:gap-0">
          {STAGES.map((stage, i) => (
            <Fragment key={stage.title}>
              {i > 0 && <Connector label={CONNECTORS[i - 1]} />}

              <AnimatedContent
                distance={50}
                duration={0.7}
                delay={i * 0.12}
                threshold={0.15}
                className="flex-1"
              >
                <SpotlightCard
                  className="h-full rounded-[14px] border border-white/[0.09] bg-[#141518] p-6"
                  spotlightColor="rgba(255, 90, 54, 0.16)"
                >
                  <span className="mono-label">{stage.kind}</span>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-bone">
                    {stage.title}
                  </h3>

                  <ul className="mt-5 space-y-2.5">
                    {stage.items.map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-spire" />
                        <span className="font-mono text-[13px] text-zinc-300">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 font-mono text-[11px] text-zinc-600">{stage.note}</p>
                </SpotlightCard>
              </AnimatedContent>
            </Fragment>
          ))}
        </div>

        {/* Stat strip */}
        <AnimatedContent distance={30} duration={0.7} delay={0.2} threshold={0.2}>
          <div className="mt-16 grid grid-cols-2 gap-y-8 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`text-center ${
                  i > 0 ? 'sm:border-l sm:border-white/[0.07]' : ''
                }`}
              >
                <span className="mono-label">{s.label}</span>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-bone">{s.value}</p>
              </div>
            ))}
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
