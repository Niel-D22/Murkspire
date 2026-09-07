/**
 * The brand mark.
 *
 * This is the supplied artwork with its black background converted to alpha:
 * luminance drives the alpha channel, so the glow falls off into transparency
 * rather than sitting inside a black box. Kept as a raster on purpose, so the
 * rendered highlights and bevels survive exactly as drawn.
 */
export function LogoMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <img
      src="/logo-mark.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`select-none object-contain ${className}`}
    />
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-sans font-medium tracking-[0.32em] text-bone ${className}`}>
      MURKSPIRE
    </span>
  );
}

/** Horizontal lockup, used in the navigation bars. */
export function LogoHorizontal({
  className = '',
  showTagline = false,
}: { className?: string; showTagline?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="flex flex-col leading-none">
        <Wordmark className="text-[15px]" />
        {showTagline && (
          <span className="mt-1 text-[9px] tracking-[0.22em] text-spire">
            A SPIRE ABOVE THE MURK.
          </span>
        )}
      </span>
    </span>
  );
}

/** Vertical lockup, used in the footer. */
export function LogoVertical({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <LogoMark className="h-14 w-14" />
      <span className="flex flex-col items-center leading-none">
        <Wordmark className="text-lg" />
        <span className="mt-2 text-[10px] tracking-[0.22em] text-spire">
          A SPIRE ABOVE THE MURK.
        </span>
      </span>
    </span>
  );
}
