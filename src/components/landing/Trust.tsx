import AnimatedContent from '../backgrounds/AnimatedContent';

/* Every claim here is verifiable in the source — nothing aspirational. */
const PILLARS = [
  {
    title: 'Non-custodial',
    body: 'Murkspire never holds funds. There is no deposit address, no vault, and no withdrawal flow anywhere in the product.',
    label: '0 funds held',
  },
  {
    title: 'Read-only',
    body: 'Every call is a read. The app queries the chain but has no method that can sign, send, or approve a transaction.',
    label: 'GET only',
  },
  {
    title: 'No account',
    body: 'No signup, no email, no password. Open the dashboard and the data is already there.',
    label: '0 credentials stored',
  },
  {
    title: 'Inspectable',
    body: 'Nothing is hidden behind a private backend. Every request the app makes is visible in your own browser network tab.',
    label: 'Client side only',
  },
];

const CHIPS = ['Non-custodial', 'Read-only RPC', 'No tracking', 'MIT license'];

export function Trust() {
  return (
    /* Deliberately the flattest section on the page — a loud security
       section reads as less trustworthy, not more. */
    <section className="relative py-16 sm:py-24 lg:py-32">
      <div className="container">
        {/* Asymmetric header */}
        <AnimatedContent distance={40} duration={0.7} threshold={0.15}>
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <span className="eyebrow">Trust</span>
              <h2 className="mt-6 text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl">
                <span className="block text-bone">We never ask for your keys.</span>
                <span className="block text-spire">Here is why we don&rsquo;t need them.</span>
              </h2>
            </div>

            <div className="space-y-1 lg:col-span-5 lg:pb-2">
              <p className="text-[15px] leading-relaxed text-zinc-400">
                Murkspire only reads public chain data.
              </p>
              <p className="text-[15px] leading-relaxed text-zinc-400">
                Connecting a wallet is optional and grants nothing.
              </p>
            </div>
          </div>
        </AnimatedContent>

        {/* Four columns, separated by hairlines only — no cards */}
        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {PILLARS.map((p, i) => (
            <AnimatedContent
              key={p.title}
              distance={40}
              duration={0.7}
              delay={i * 0.1}
              threshold={0.15}
            >
              <div className={i > 0 ? 'lg:border-l lg:border-white/[0.07] lg:pl-8' : 'lg:pr-8'}>
                {/* Abstract marker, not an icon — no padlocks, no shields */}
                <span className="block h-[3px] w-6 rounded-full bg-spire" />

                <h3 className="mt-5 text-lg font-semibold tracking-tight text-bone">{p.title}</h3>

                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{p.body}</p>

                <p className="mt-5 font-mono text-[11px] text-zinc-600">{p.label}</p>
              </div>
            </AnimatedContent>
          ))}
        </div>

        {/* Unlit chips */}
        <AnimatedContent distance={24} duration={0.6} delay={0.25} threshold={0.2}>
          <div className="mt-14 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <span
                key={c}
                className="rounded-md border border-white/[0.09] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500"
              >
                {c}
              </span>
            ))}
          </div>
        </AnimatedContent>
      </div>
    </section>
  );
}
