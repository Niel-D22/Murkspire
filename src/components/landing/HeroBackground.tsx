import { Suspense, lazy } from 'react';
import { WebGLGuard } from '../external/WebGLGuard';

/* Both pull heavy deps (three.js / gsap) — keep them out of the initial bundle. */
const ColorBends = lazy(() => import('../external/ColorBends'));
const DotGrid = lazy(() => import('../external/DotGrid'));

/* Static stand-in for the shader: two warm sweeps that read close enough
   to the animated version when WebGL is unavailable. */
function BendsFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 55% 90% at 8% 55%, rgba(255,90,54,.42), transparent 60%),' +
          'radial-gradient(ellipse 55% 90% at 92% 45%, rgba(249,115,22,.34), transparent 60%),' +
          'radial-gradient(ellipse 70% 40% at 50% 100%, rgba(255,90,54,.16), transparent 70%)',
      }}
    />
  );
}

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Layer 1 — interactive dot grid. Listens on window, canvas is
         pointer-events:none, so it never blocks the CTAs. */}
      <div className="mask-fade-bottom absolute inset-0">
        <Suspense fallback={null}>
          <DotGrid
            dotSize={3}
            gap={20}
            baseColor="#5A2418"
            activeColor="#FF5A36"
            proximity={170}
            shockRadius={260}
            shockStrength={5}
            resistance={620}
            returnDuration={1.4}
          />
        </Suspense>
      </div>

      {/* Layer 2 — animated colour bends.
         NOTE: alpha = 1 - exp(-bandWidth / exp(bandWidth * m)) in this build,
         so bandWidth must sit around 4-7 to be visible. The 0.14 on
         reactbits.dev belongs to their newer, differently-normalised shader. */}
      <div className="mask-fade-bottom absolute inset-0 opacity-[0.5]">
        <WebGLGuard fallback={<BendsFallback />}>
        <Suspense fallback={<BendsFallback />}>
          <ColorBends
            color="#F97316"
            speed={0.2}
            frequency={1.0}
            noise={0.15}
            bandWidth={6}
            rotation={90}
            fadeTop={0.35}
            iterations={1}
            intensity={1.0}
            warpStrength={1}
            parallax={0.4}
            mouseInfluence={0.5}
            transparent
          />
        </Suspense>
        </WebGLGuard>
      </div>

      {/* Light scrim only behind the headline block */}
      <div
        className="absolute inset-x-0 top-0 h-[46%]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(12,13,15,.75) 0%, rgba(12,13,15,.3) 60%, transparent 100%)',
        }}
      />

      {/* Falloff into the page background */}
      <div
        className="absolute inset-x-0 bottom-0 h-[420px]"
        style={{
          background:
            'linear-gradient(to top, #0C0D0F 0%, rgba(12,13,15,.92) 22%, rgba(12,13,15,.6) 48%, rgba(12,13,15,.22) 74%, transparent 100%)',
        }}
      />

      {/* Fine grain */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05]" aria-hidden="true">
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>
    </div>
  );
}
