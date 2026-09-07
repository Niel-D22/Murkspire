/** X (formerly Twitter) glyph. lucide dropped its Twitter icon, so this is inlined. */
export function XIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.627l-5.1-6.694-5.867 6.694h-3.306l7.73-8.835L2.25 2.25h6.814l4.885 6.469 5.595-6.469zM17.15 18.75h1.828L6.122 3.97H4.231l12.919 14.78z" />
    </svg>
  );
}

/** Single source of truth for the project's only social account. */
export const X_URL = 'https://x.com/murkspire';
