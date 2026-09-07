import LogoLoop from '../backgrounds/LogoLoop';

/* Only technologies this project actually depends on — verifiable in
   package.json and src/lib. Jupiter is deliberately absent: the market-flow
   page does not call their API yet, so claiming it would be false. */
const STACK = [
  'Solana',
  'Helius',
  'Supabase',
  'Vercel',
  'React',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'Recharts',
];

const LOGOS = STACK.map((name) => ({
  node: (
    <span className="whitespace-nowrap font-sans text-lg font-medium tracking-[0.14em] text-zinc-500 transition-colors duration-300 hover:text-bone">
      {name.toUpperCase()}
    </span>
  ),
  title: name,
  ariaLabel: name,
}));

export function BuiltOn() {
  return (
    <section className="relative py-14 sm:py-20 lg:py-24">
      <div className="container">
        <p className="mono-label text-center">Built on</p>
      </div>

      <div className="mt-8">
        <LogoLoop
          logos={LOGOS}
          speed={40}
          direction="left"
          gap={72}
          logoHeight={28}
          pauseOnHover
          fadeOut
          fadeOutColor="#0C0D0F"
          ariaLabel="Technologies Murkspire is built on"
        />
      </div>
    </section>
  );
}
