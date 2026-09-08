import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useScrollProgress, mapRange } from '../../hooks/useScrollProgress';

const WORDMARK = 'MURKSPIRE'.split('');
const TAGLINE = 'A SPIRE ABOVE THE MURK.';

/* Scroll timeline. Every value is a fraction of this section's scroll.
   The whole sequence resolves by 0.60 so the curtain below can start rising
   at 0.667 over a fully lit frame. The video never fades: the section that
   slides up is what hides it. */
const T = {
  videoStart: 0.0,
  videoEnd: 0.42,   // light finishes rising before the text settles
  wordStart: 0.16,
  wordEnd: 0.50,
  taglineStart: 0.44,
  taglineEnd: 0.60,
  cueEnd: 0.12,     // scroll hint fades out early
};

/* Two all-intra encodes of the same shot. Phones get the 720p file: it is
   less than half the weight and, at that screen size, indistinguishable. */
const SRC_DESKTOP = '/hero-scrub-1080.mp4';
const SRC_MOBILE = '/hero-scrub-720.mp4';

export function HeroIntro() {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const target = useRef(0);
  const current = useRef(0);
  const raf = useRef<number | null>(null);
  const reduced = useRef(false);
  const [src, setSrc] = useState<string | null>(null);

  /* Resolve the source once on the client so we never download both. */
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px)').matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData ===
      true;
    setSrc(wide && !saveData ? SRC_DESKTOP : SRC_MOBILE);
  }, []);

  /* iOS unlock.
     Safari on iOS refuses to decode and paint frames for a video that has
     never been played, so setting currentTime does nothing and the poster
     stays frozen. Calling play() synchronously inside the first real user
     gesture, then pausing immediately, promotes the element to a decoded
     state and scrubbing starts working. Desktop and Android do not need
     this, but it is harmless there. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let unlocked = false;

    const detach = () => {
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('touchend', unlock);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('click', unlock);
    };

    function unlock() {
      if (unlocked) return;
      unlocked = true;
      const el = videoRef.current;
      if (el) {
        // Must be called synchronously in the gesture to satisfy iOS.
        const played = el.play();
        if (played && typeof played.then === 'function') {
          played.then(() => el.pause()).catch(() => {});
        } else {
          el.pause();
        }
      }
      detach();
    }

    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('touchend', unlock, { passive: true });
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('click', unlock);

    return detach;
  }, [src]);

  /* Drive video.currentTime from scroll, eased so trackpad jitter doesn't
     cause visible stepping. Seeking is expensive, so we only write when the
     frame would actually change. */
  useEffect(() => {
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const video = videoRef.current;
    if (!video || reduced.current) return;

    /* Seeks must not be queued. Writing currentTime while a previous seek is
       still decoding makes the browser abandon and restart it, which is what
       reads as stutter. We issue one seek at a time and always aim at the
       latest target once the previous one lands. */
    let inFlight = false;
    const onSeeked = () => {
      inFlight = false;
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onSeeked);

    const loop = () => {
      const duration = video.duration;
      // readyState >= 2 means we have current frame data to seek from.
      if (duration && Number.isFinite(duration) && video.readyState >= 2) {
        current.current += (target.current - current.current) * 0.09;
        const t = current.current * duration;

        if (!inFlight && Math.abs(video.currentTime - t) > 0.03) {
          inFlight = true;
          video.currentTime = t;
        }
      }
      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onSeeked);
    };
  }, [src]);

  useEffect(() => {
    target.current = mapRange(progress, T.videoStart, T.videoEnd);
  }, [progress]);

  /* Park the video on a lit frame when motion is reduced. */
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !reduced.current) return;
    const onReady = () => {
      video.currentTime = video.duration * 0.85;
    };
    video.addEventListener('loadedmetadata', onReady);
    return () => video.removeEventListener('loadedmetadata', onReady);
  }, [src]);

  const still = reduced.current;
  const wordProgress = still ? 1 : mapRange(progress, T.wordStart, T.wordEnd);
  const taglineOpacity = still ? 1 : mapRange(progress, T.taglineStart, T.taglineEnd);
  const cueOpacity = still ? 0 : 1 - mapRange(progress, 0, T.cueEnd);

  return (
    <section ref={ref} className="relative h-[400vh]">
      {/* bg matches the page, not pure black — otherwise the handoff below
          crosses two different blacks and reads as a band. */}
      <div className="sticky top-0 z-0 h-screen overflow-hidden bg-murk">
        {/* ---------- Video layer ---------- */}
        <div className="absolute inset-0">
          {/* All-intra encode: every frame is a keyframe, so seeking to an
              arbitrary time is instant. A normal encode has sparse keyframes
              and has to decode forward from the previous one, which is what
              read as stutter while scrubbing. */}
          {src && (
            <video
              ref={videoRef}
              src={src}
              poster="/hero-poster.jpg"
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              /* A light overscan only, to hide encoder edge artefacts. The
                 generator watermark is removed from the file itself. */
              className="h-full w-full scale-105 object-cover"
            />
          )}
        </div>

        {/* Falloff into the page background.
            Every stop is written in the murk colour's own rgba — Tailwind's
            `to-transparent` is transparent *black*, so fading to it against
            #0C0D0F drifts through a darker hue and shows as a visible band. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[35vh]"
          style={{
            background:
              'linear-gradient(to bottom,' +
              'rgba(12,13,15,.88) 0%,' +
              'rgba(12,13,15,.62) 28%,' +
              'rgba(12,13,15,.32) 55%,' +
              'rgba(12,13,15,.10) 80%,' +
              'rgba(12,13,15,0) 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[52vh]"
          style={{
            background:
              'linear-gradient(to top,' +
              'rgb(12,13,15) 0%,' +
              'rgba(12,13,15,.97) 14%,' +
              'rgba(12,13,15,.88) 28%,' +
              'rgba(12,13,15,.70) 42%,' +
              'rgba(12,13,15,.46) 57%,' +
              'rgba(12,13,15,.24) 72%,' +
              'rgba(12,13,15,.08) 87%,' +
              'rgba(12,13,15,0) 100%)',
          }}
        />

        {/* ---------- Wordmark ---------- */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6">
          <h1
            className="flex justify-center text-center font-sans font-medium text-bone"
            aria-label="Murkspire"
          >
            {WORDMARK.map((letter, i) => {
              // Each letter gets its own slice of the reveal window.
              const slice = 1 / WORDMARK.length;
              const o = mapRange(wordProgress, i * slice * 0.7, i * slice * 0.7 + slice * 2.2);
              return (
                <span
                  key={`${letter}-${i}`}
                  aria-hidden="true"
                  className="inline-block text-[2rem] tracking-[0.22em] sm:text-5xl sm:tracking-[0.3em] lg:text-6xl"
                  style={{
                    opacity: o,
                    filter: `blur(${(1 - o) * 10}px)`,
                    transform: `translateY(${(1 - o) * 14}px)`,
                  }}
                >
                  {letter}
                </span>
              );
            })}
          </h1>

          <p
            className="mt-4 text-center font-sans text-[10px] tracking-[0.24em] text-spire sm:mt-6 sm:text-xs sm:tracking-[0.3em]"
            style={{
              opacity: taglineOpacity,
              transform: `translateY(${(1 - taglineOpacity) * 10}px)`,
            }}
          >
            {TAGLINE}
          </p>
        </div>

        {/* ---------- Scroll cue ---------- */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center gap-2"
          style={{ opacity: cueOpacity }}
        >
          <span className="mono-label">Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce text-zinc-500" />
        </div>
      </div>
    </section>
  );
}
