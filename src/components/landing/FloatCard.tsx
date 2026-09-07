import { ReactNode } from 'react';

export function FloatCard({
  label,
  children,
  live = false,
  delay = 0,
  className = '',
}: {
  label: string;
  children: ReactNode;
  live?: boolean;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-float-y rounded-xl border border-white/[0.12] bg-[#101216]/95 px-5 py-4 shadow-[0_24px_60px_-16px_rgba(0,0,0,.9)] backdrop-blur-xl ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2">
        <span className="mono-label">{label}</span>
        {live && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spire opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-spire" />
          </span>
        )}
      </div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-bone">
        {children}
      </div>
    </div>
  );
}
