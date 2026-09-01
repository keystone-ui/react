import { useMemo, useSyncExternalStore } from "react";

/** There is no viewport to measure while rendering on the server. */
const getServerSnapshot = () => false;

/** Used when `matchMedia` is unavailable, so the hook degrades instead of throwing. */
const subscribeToNothing = () => () => {
  // no store to observe
};

/**
 * Subscribes to a CSS media query.
 *
 * Backed by `useSyncExternalStore`, so the value is already correct on the
 * first client render. The previous `useState(false)` + `useEffect`
 * implementation rendered `false` and corrected itself in an effect *after
 * paint*, which visibly flashed the wrong branch for `min-width` queries —
 * a desktop viewport would paint the mobile layout for a frame.
 *
 * Server renders still report `false`, because the true value cannot be known
 * without a viewport. React reads `getServerSnapshot` during hydration and
 * reconciles afterwards, so this does not warn about a hydration mismatch. If
 * a layout has to be right in the first server-rendered paint, express it in
 * CSS rather than here.
 */
export function useMediaQuery(query: string): boolean {
  const [subscribe, getSnapshot] = useMemo(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return [subscribeToNothing, getServerSnapshot] as const;
    }

    const mediaQueryList = window.matchMedia(query);

    return [
      (onStoreChange: () => void) => {
        mediaQueryList.addEventListener("change", onStoreChange);
        return () =>
          mediaQueryList.removeEventListener("change", onStoreChange);
      },
      () => mediaQueryList.matches,
    ] as const;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
