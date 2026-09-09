import React from 'react';

/** Cheap one-off probe: can this browser hand out another WebGL context? */
let cached: boolean | null = null;

export function canUseWebGL(): boolean {
  if (cached !== null) return cached;
  if (typeof window === 'undefined') return (cached = false);

  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    if (gl) {
      // Release the probe context immediately so we don't consume a slot.
      const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
      lose?.loseContext();
      cached = true;
    } else {
      cached = false;
    }
  } catch {
    cached = false;
  }
  return cached;
}

interface Props {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * A decorative WebGL layer must never take the page down. Browsers cap the
 * number of live WebGL contexts (commonly 8-16 per process), so on a machine
 * with many GPU-backed tabs open, creating the renderer can simply fail.
 * When that happens we quietly fall back to a CSS approximation.
 */
export class WebGLGuard extends React.Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Expected on context-starved machines — log, don't crash.
    console.warn('[Murkspire] WebGL layer disabled, using CSS fallback:', error);
  }

  render() {
    if (this.state.failed || !canUseWebGL()) return <>{this.props.fallback}</>;
    return <>{this.props.children}</>;
  }
}
