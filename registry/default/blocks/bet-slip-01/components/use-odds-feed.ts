import { useEffect } from "react";

import type { Selection } from "@/components/bet-slip-math";

/**
 * A stand-in for a live price feed: every `interval` ms one selection's odds
 * drift by a tick. Replace with your feed's subscription.
 */
export function useOddsFeed(
  setSelections: (update: (prev: Selection[]) => Selection[]) => void,
  { enabled, interval = 6000 }: { enabled: boolean; interval?: number }
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    let tick = 0;
    const id = setInterval(() => {
      tick += 1;
      setSelections((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        const target = tick % prev.length;
        const direction = tick % 3 === 0 ? -1 : 1;
        return prev.map((s, i) =>
          i === target
            ? {
                ...s,
                odds: Math.max(
                  1.01,
                  Number((s.odds + direction * 0.05).toFixed(2))
                ),
              }
            : s
        );
      });
    }, interval);
    return () => clearInterval(id);
  }, [enabled, interval, setSelections]);
}
