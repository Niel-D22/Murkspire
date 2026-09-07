import ScrollReveal from '../backgrounds/ScrollReveal';

/* Complaints, phrased the way people actually say them — not as feature copy.
   This section is deliberately the dimmest on the page: it is the "before"
   that makes everything below it read as the payoff. */
const COMPLAINTS = [
  'Five explorer tabs open at once.',
  'The whale already left before you noticed.',
  'USD values worked out by hand.',
  'A validator degraded and nobody told you.',
];

export function TheMurk() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-32">
      {/* Unreadable noise: faint grey bars scattered behind the text */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.55]" aria-hidden="true">
        {Array.from({ length: 26 }).map((_, i) => {
          const seed = (i * 2654435761) % 1000;
          return (
            <span
              key={i}
              className="absolute h-px bg-zinc-600"
              style={{
                top: `${(seed % 97) + 1}%`,
                left: `${((seed * 7) % 78)}%`,
                width: `${8 + (seed % 22)}%`,
                opacity: 0.05 + ((seed % 10) / 100),
              }}
            />
          );
        })}
      </div>

      <div className="container relative">
        <p className="mono-label">The murk</p>

        <div className="mt-6 max-w-3xl">
          {COMPLAINTS.map((line) => (
            <ScrollReveal
              key={line}
              baseOpacity={0.05}
              baseRotation={2}
              blurStrength={5}
              enableBlur
              containerClassName="!my-0"
              textClassName="!text-xl sm:!text-2xl !leading-relaxed !font-normal text-zinc-500"
            >
              {line}
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
