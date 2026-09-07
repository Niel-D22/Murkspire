import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Top level route group: "/", "/docs", "/app".
 * Page transitions fire between groups but not between tabs inside /app, so
 * switching dashboard pages does not tear down and refetch the whole section.
 */
export function routeGroup(pathname: string) {
  return '/' + (pathname.split('/')[1] ?? '');
}

/**
 * Puts the viewport where the reader expects it after a navigation.
 *
 * Without this, moving from a scrolled landing page to /docs lands you
 * halfway down the document. Hash links such as /#how-it-works also need
 * handling here, because the target only exists once the destination route
 * has rendered.
 */
export function useScrollManager() {
  const { pathname, hash, key } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Leave the initial load alone: deep links and the browser's own scroll
    // restoration should win over anything we do here.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!hash) return;
    }

    if (hash) {
      // One frame of delay so the destination route has painted.
      const id = requestAnimationFrame(() => {
        const el = document.getElementById(hash.slice(1));
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return () => cancelAnimationFrame(id);
    }

    // `scroll-behavior: smooth` is set globally, which would otherwise animate
    // the entire document length on a route change. Snap instead and let the
    // fade carry the transition.
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.style.scrollBehavior = previous;

    // `key` changes even when navigating to the current path, so clicking the
    // active link still returns the reader to the top.
  }, [pathname, hash, key]);
}
