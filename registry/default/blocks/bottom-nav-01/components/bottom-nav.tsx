"use client";

import { Bookmark, Home, Inbox, Search, User } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  /** A positive count shows a Badge over the icon; 0 or none shows nothing. */
  count?: number;
  /** What a screen reader hears after the label, e.g. "3 unread". */
  countLabel?: string;
  href: string;
  /**
   * An element, e.g. `<Home />`, not the component itself: an element can be
   * passed from a Server Component page, a component function cannot.
   */
  icon: ReactNode;
  label: string;
}

const defaultItems: BottomNavItem[] = [
  { href: "/home", icon: <Home />, label: "Home" },
  { href: "/search", icon: <Search />, label: "Search" },
  {
    count: 3,
    countLabel: "3 unread",
    href: "/inbox",
    icon: <Inbox />,
    label: "Inbox",
  },
  { href: "/saved", icon: <Bookmark />, label: "Saved" },
  { href: "/profile", icon: <User />, label: "Profile" },
];

/**
 * Focus clearance at the bottom of the document's scrollport, below `md` on
 * screen: a focused control is scrolled clear of the bar (and 1rem past it),
 * not to the very bottom of the screen under it. Only the end side: the
 * start side belongs to the page (a sticky header's offset), and the bar
 * never touches it. `html` belongs to the app, not to this block, so the bar
 * brings the rule with it as a React 19 hoisted `<style>`: it lands in
 * `<head>` once, however many bars render, and only matches while the
 * document holds a bar. An app that keeps a left route mounted but hidden
 * (Next's `cacheComponents`) still holds the bar, so the end padding can stay
 * in force on its other phone-width pages; it only adds room at the bottom
 * when the browser scrolls something into view, never changes the layout.
 */
const SCROLL_PADDING_CSS = `@media screen and (width < 48rem) {
  html:where(:has([data-slot="bottom-nav"])) {
    scroll-padding-block-end: calc(var(--bottom-nav-height, 4rem) + env(safe-area-inset-bottom) + 1rem);
  }
}`;

/**
 * A phone's main navigation: four or five links in a bar fixed to the bottom
 * of the screen, hidden from `md` up, where a sidebar takes its place.
 *
 * The bar is exactly `--bottom-nav-height` (4rem unless `:root` sets it; its
 * top border included) plus the device's bottom safe area. The page keeps
 * ordinary document scrolling and reserves that same sum below `md`, so the
 * last row ends above the bar:
 *
 *   <main className="pb-[calc(var(--bottom-nav-height,4rem)+env(safe-area-inset-bottom))] md:pb-0 print:pb-0">…</main>
 *
 * A keyboard-focused control is kept clear of the bar by the scroll-padding
 * rule above, which the bar adds itself. Set a custom `--bottom-nav-height`
 * on `:root`, where both the bar and that rule read it. The safe area is only
 * non-zero when the viewport meta has `viewport-fit=cover`.
 *
 * Swap the `<a>` for your router's link component if it renders an `<a>`.
 */
export function BottomNav({
  currentHref,
  items = defaultItems,
  label = "Main",
}: {
  currentHref: string;
  items?: BottomNavItem[];
  label?: string;
}) {
  return (
    <>
      {/* biome-ignore lint/suspicious/noUnknownAttribute: React 19's `precedence` hoists this style into <head>, once */}
      <style href="keystone-bottom-nav-scroll-padding" precedence="default">
        {SCROLL_PADDING_CSS}
      </style>
      <nav
        aria-label={label}
        className="fixed inset-x-0 bottom-0 z-(--z-sticky) h-[calc(var(--bottom-nav-height,4rem)+env(safe-area-inset-bottom))] border-border border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden print:static"
        data-slot="bottom-nav"
      >
        {/* Five equal cells: each link fills its own cell, so a link can never
          reach into its neighbour's, whatever the text size. */}
        <ul className="mx-auto flex h-full max-w-md items-stretch px-1">
          {items.map((item) => {
            const isCurrent = item.href === currentHref;
            const hasCount = Boolean(item.count && item.count > 0);
            return (
              <li className="flex min-w-0 flex-1" key={item.href}>
                <a
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "group flex min-h-[44px] w-full min-w-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-md px-1 font-medium text-muted-foreground text-xs transition-[color,outline-color] duration-(--duration-fast) ease-(--ease-ks-out) [-webkit-tap-highlight-color:transparent] hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:-outline-offset-2",
                    isCurrent && "text-foreground"
                  )}
                  href={item.href}
                >
                  <span className="relative flex h-7 w-12 max-w-full items-center justify-center rounded-full transition-[background-color] duration-(--duration-fast) ease-(--ease-ks-out) group-aria-[current=page]:bg-secondary">
                    <span
                      aria-hidden="true"
                      className="flex [&_svg]:size-5 [&_svg]:shrink-0"
                    >
                      {item.icon}
                    </span>
                    {hasCount ? (
                      <Badge
                        aria-hidden="true"
                        className="absolute end-0 -top-1 min-w-4 tabular-nums"
                        size="sm"
                      >
                        {(item.count ?? 0) > 99 ? "99+" : item.count}
                      </Badge>
                    ) : null}
                  </span>
                  <span className="max-w-full truncate">
                    {item.label}
                    {hasCount ? (
                      <span className="sr-only">
                        ({item.countLabel ?? item.count})
                      </span>
                    ) : null}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
