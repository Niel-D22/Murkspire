/**
 * Shared loading treatment for the dashboard pages.
 *
 * Whale activity takes roughly a second against live RPC, staking longer.
 * A bare shimmer gives no indication that anything is happening or what is
 * being waited on, so this states the source and animates the brand mark.
 */

const BAR_WIDTHS = [26, 50, 74, 98, 122, 146];

/** The Murkspire mark, drawn row by row while data is in flight. */
function SpireLoader() {
  return (
    <div className="flex flex-col items-center gap-[6px]" aria-hidden="true">
      {BAR_WIDTHS.map((width, i) => (
        <div key={width} className="flex items-center justify-center gap-[9px]">
          {[0, 1].map((side) => (
            <span
              key={side}
              className="block h-[4px] rounded-full bg-spire"
              style={{
                width,
                animation: `spire-pulse 1.4s ease-in-out ${i * 0.11}s infinite`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function LoadingState({
  title = 'Reading the chain',
  detail = 'Fetching live data from Solana mainnet',
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6"
      role="status"
      aria-live="polite"
    >
      <SpireLoader />
      <div className="text-center">
        <p className="text-sm font-medium text-bone">{title}</p>
        <p className="mt-1.5 font-mono text-[11px] text-zinc-500">{detail}</p>
      </div>
    </div>
  );
}

/** Inline variant for refreshes, where the page already has content. */
export function RefreshingBadge({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-spire/25 bg-spire/[0.06] px-2.5 py-1">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spire opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-spire" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-spire">
        Refreshing
      </span>
    </span>
  );
}

/** Shown when a fetch fails, instead of an empty table with no explanation. */
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="h-[3px] w-8 rounded-full bg-spire" />
      <div>
        <p className="text-sm font-medium text-bone">Could not load this data</p>
        <p className="mx-auto mt-2 max-w-sm font-mono text-[11px] leading-relaxed text-zinc-500">
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="pill-ghost mt-1 px-5 py-2 text-xs font-semibold"
        >
          Try again
        </button>
      )}
    </div>
  );
}
