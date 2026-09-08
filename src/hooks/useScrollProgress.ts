import { useEffect, useRef, useState } from 'react';

/**
 * Progress of an element through the viewport, 0 → 1.
 *
 * 0 = the element's top has just reached the top of the viewport
 * 1 = the element's bottom has just reached the bottom of the viewport
 *
 * Reads on rAF rather than on every scroll event, so it stays smooth on
 * trackpads and momentum scrolling.
 */
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  const raf = useRef<number | null>(null);
  const last = useRef(-1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tick = () => {
      const rect = el.getBoundingClientRect();
      // Total distance the element travels while any part of it is pinned.
      const travel = rect.height - window.innerHeight;
      const p = travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel));

      // Only re-render when it actually moves.
      if (Math.abs(p - last.current) > 0.0015) {
        last.current = p;
        setProgress(p);
      }
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  return { ref, progress };
}

/** Maps `value` from [inMin, inMax] into [outMin, outMax], clamped. */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin = 0,
  outMax = 1
) {
  if (inMax === inMin) return outMin;
  const t = Math.min(1, Math.max(0, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}
