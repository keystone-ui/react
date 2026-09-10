"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether the viewer has asked for reduced motion.
 *
 * `base.css` already zeroes CSS animation under `prefers-reduced-motion`, but
 * recharts animates SVG *attributes* from JavaScript, which no stylesheet can
 * reach. So the library's central reduced-motion rule silently does not cover
 * charts, and this is the only place that can close the gap — pass the result
 * to `isAnimationActive`.
 *
 * Starts `false` deliberately: guessing `true` on the server and correcting on
 * the client would be a hydration mismatch, so one frame of motion is the
 * better trade.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    setReduced(media.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
