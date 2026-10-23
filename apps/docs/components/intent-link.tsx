"use client";

import NextLink from "next/link";
import { type ComponentProps, useState } from "react";

type NextLinkProps = ComponentProps<typeof NextLink>;

/**
 * Accepts what fumadocs hands its framework `Link` (anchor props plus a
 * boolean `prefetch`) as well as `next/link`'s own `href` and `prefetch`.
 */
type IntentLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href?: NextLinkProps["href"];
  prefetch?: NextLinkProps["prefetch"];
};

/**
 * `next/link` that upgrades its prefetch on user intent.
 *
 * With Partial Prefetching on, a plain link prefetches the destination
 * route's shared App Shell as it scrolls into view: one request per route,
 * however many links point at it. `prefetch={true}` additionally fetches the
 * content for that specific URL. Doing that for every visible link would
 * reintroduce the fan-out this model removes (a docs sidebar shows ~60
 * links), so the upgrade waits for hover, focus or touch, which is the
 * pattern Vercel used for v0's grids.
 *
 * An explicit `prefetch={false}` is honoured and never upgraded. Passed to
 * fumadocs through `RootProvider components.Link`, so the sidebar, navbar,
 * breadcrumbs and MDX links all get it; app pages import it directly.
 */
export function IntentLink({
  href = "#",
  prefetch,
  onMouseEnter,
  onFocus,
  onTouchStart,
  ...props
}: IntentLinkProps) {
  const [intent, setIntent] = useState(false);

  let resolved: NextLinkProps["prefetch"] = "auto";
  if (prefetch === false) {
    resolved = false;
  } else if (intent || prefetch === true) {
    resolved = true;
  }

  return (
    <NextLink
      {...props}
      href={href}
      onFocus={(event) => {
        onFocus?.(event);
        setIntent(true);
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        setIntent(true);
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        setIntent(true);
      }}
      prefetch={resolved}
    />
  );
}
