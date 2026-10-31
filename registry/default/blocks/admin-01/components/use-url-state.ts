"use client";

import { useEffect, useState } from "react";

/**
 * Keeps the page's query string in step with its state, both ways.
 *
 * On load it hands the query string to `restore` once, so a pasted link opens
 * on the same view, filters, sort and page. After that every change rewrites
 * the query string with `params` — with `replaceState`, not `pushState`: one
 * history entry per keystroke in search would make Back unusable.
 *
 * Plain `history` rather than a router, so the block works in any React app.
 * In a Next.js app this is also what the router expects: it observes native
 * `replaceState`, and `useSearchParams` follows. The existing `history.state`
 * is passed through, because the router keeps its own bookkeeping there.
 *
 * Read in an effect rather than during render: the server has no URL, so
 * reading it during the first render would hydrate into a mismatch. The
 * tables open on their loading state anyway, so the restored query lands
 * before anything is shown.
 */
export function useUrlState(
  restore: (params: URLSearchParams) => void,
  params: Record<string, string>
) {
  const [ready, setReady] = useState(false);
  const search = new URLSearchParams(
    Object.entries(params).filter(([, value]) => value !== "")
  ).toString();

  // Once, on mount. `restore` is deliberately not a dependency: re-reading the
  // URL after every render would undo the user's own changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount only
  useEffect(() => {
    restore(new URLSearchParams(window.location.search));
    setReady(true);
  }, []);

  useEffect(() => {
    // Not until the restored state has rendered — writing the defaults first
    // would wipe the link being opened.
    if (!ready) {
      return;
    }
    const url = new URL(window.location.href);
    if (url.search === (search ? `?${search}` : "")) {
      return;
    }
    url.search = search;
    window.history.replaceState(window.history.state, "", url);
  }, [ready, search]);
}
