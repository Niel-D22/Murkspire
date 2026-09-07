/**
 * The Murkspire mark rendered as live DOM — perfectly symmetrical bars
 * that an image generator can never get right.
 * Bars fade in opacity only; the geometry stays exact.
 */
const ROWS = 9;

export function Spire({
  className = '',
  animate = true,
}: { className?: string; animate?: boolean }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden="true">
      {/* Beam */}
      <div className="relative mx-auto h-28 w-px">
        <div
          className={`absolute inset-0 w-px bg-gradient-to-t from-spire via-spire/50 to-transparent ${
            animate ? 'animate-beam-pulse' : ''
          }`}
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,90,54,.9))' }}
        />
        {/* Hotspot at the base of the beam */}
        <div
          className="absolute -bottom-1 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full bg-spire/70 blur-md"
        />
      </div>

      {/* Dual dots */}
      <div className="relative mx-auto -mt-1 flex h-2 w-24 items-center justify-center gap-10">
        <span className="h-1.5 w-1.5 rounded-full bg-spire shadow-spire-sm" />
        <span className="h-1.5 w-1.5 rounded-full bg-spire shadow-spire-sm" />
      </div>

      {/* Bars */}
      <div className="mt-3 flex flex-col items-center gap-[7px]">
        {Array.from({ length: ROWS }).map((_, i) => {
          const width = 26 + i * 24;          // px, per half
          const opacity = 1 - i * 0.055;      // opacity only — geometry stays exact
          return (
            <div
              key={i}
              className="flex items-center justify-center gap-[10px]"
              style={
                animate
                  ? { animation: `bar-in .7s cubic-bezier(.22,1,.36,1) ${i * 60}ms both` }
                  : undefined
              }
            >
              <span
                className="block h-[5px] rounded-full bg-spire"
                style={{ width, opacity, boxShadow: '0 0 12px -2px rgba(255,90,54,.6)' }}
              />
              <span
                className="block h-[5px] rounded-full bg-spire"
                style={{ width, opacity, boxShadow: '0 0 12px -2px rgba(255,90,54,.6)' }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
