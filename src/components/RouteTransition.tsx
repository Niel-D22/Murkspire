import { ReactNode, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Top level route group: "/", "/docs", "/app".
 * Transitions fire between groups, but not between tabs inside /app, so
 * switching dashboard pages does not remount and refetch everything.
 */
export function routeGroup(pathname: string) {
  return '/' + (pathname.split('/')[1] ?? '');
}

/**
 * Puts the viewport where the reader expects it after a navigation.
 *
 * Without this, moving from a scrolled landing page to /docs lands you
 * halfway down the document. Anchors like /#how-it-works also need handling,
 * because the target only exists after the destination route has rendered.
 */
export function useScrollManager() {
  const { pathname, hash, key } = useLocation();
  const lastGroup = useRef<string | null>(null);

  useEffect(() => {
    if (hash) {
      // Wait one frame so the destination route has painted.
      const id = requestAnimationFrame(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return () => cancelAnimationFrame(id);
    }

    const group = routeGroup(pathname);
    const changedGroup = lastGroup.current !== null && lastGroup.current !== group;
    lastGroup.current = group;

    // Only jump to the top when the reader actually changed context. Moving
    // between dashboard tabs should hold position.
    if (changedGroup || lastGroup.current === group) {
      // `scroll-behavior: smooth` is set globally; override it here so a route
      // change snaps instead of animating the whole page length.
      const html = document.documentElement;
      const previous = html.style.scrollBehavior;
      html.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      html.style.scrollBehavior = previous;
    }
    // `key` changes even when navigating to the same path, so repeated clicks
    // on the current link still scroll back up.
  }, [pathname, hash, key]);
}

/** Fades and lifts the incoming route. Keyed by caller. */
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
