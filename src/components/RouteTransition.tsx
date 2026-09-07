import { ReactNode } from 'react';

/** Fades and lifts the incoming route. Remounts whenever `transitionKey` changes. */
export function PageTransition({
  transitionKey,
  children,
  className = '',
}: {
  transitionKey: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div key={transitionKey} className={`animate-page-in ${className}`}>
      {children}
    </div>
  );
}
