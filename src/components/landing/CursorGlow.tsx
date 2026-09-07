import { Suspense, lazy, useEffect, useState } from 'react';

/* ogl is only needed for this flourish, so keep it out of the initial bundle. */
const GlowCursor = lazy(() => import('../backgrounds/GlowCursor'));

/**
 * A fixed, non-interactive overlay that trails the pointer.
 *
 * Deliberately NOT a wrapper around the page: the component's own container
 * carries `overflow: hidden`, which would turn it into the scroll container
 * for every `position: sticky` ancestor below it and break both the hero
 * title sequence and the roadmap.
 */
export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Pointless on touch devices, and unwelcome when motion is reduced.
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(fine && !reduced);
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
      <Suspense fallback={null}>
        <GlowCursor
          color="#FF5A36"
          secondaryColor="#FF9B84"
          trailLength={26}
          trailWidth={8}
          trailTaper={0.8}
          followSpeed={0.3}
          glowIntensity={1.6}
          glowSpread={1.2}
          hotspot={0.65}
          brightness={1.15}
          opacity={0.75}
          pulseSpeed={1.1}
          noiseStrength={0.035}
          idleFade
          idleTimeout={700}
          fadeDuration={2500}
          blendMode="screen"
        />
      </Suspense>
    </div>
  );
}
