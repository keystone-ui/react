"use client";

import { useCallback, useEffect, useState } from "react";

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

/**
 * Recharts props that animate a chart once, on mount, and never again.
 *
 * Recharts replays its entrance on every data change, so a legend toggle or a
 * range switch redrew the whole chart for 1.5s. Charts are data the viewer is
 * reading; the entrance is worth one short pass, after which changes snap.
 * The flag flips on the first `onAnimationEnd` — every series in a card
 * starts together and runs the same duration, so the first end is all of
 * them.
 *
 * Spread the result onto each `<Bar>` / `<Area>` in the card.
 */
export function useMountOnlyAnimation(reducedMotion: boolean) {
  const [played, setPlayed] = useState(false);
  const onAnimationEnd = useCallback(() => setPlayed(true), []);

  return {
    animationDuration: 400,
    animationEasing: "ease-out",
    isAnimationActive: !(reducedMotion || played),
    onAnimationEnd,
  } as const;
}
