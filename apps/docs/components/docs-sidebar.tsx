"use client";

import { usePathname } from "fumadocs-core/framework";
import type * as PageTree from "fumadocs-core/page-tree";
import { SidebarItem } from "fumadocs-ui/components/sidebar/base";
import { useTreeContext } from "fumadocs-ui/contexts/tree";
import {
  Sidebar,
  type SidebarProps,
} from "fumadocs-ui/layouts/notebook/slots/sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { isCurrent, type Row, sectionFor, sidebarViews } from "@/lib/sidebar";

/*
 * The docs sidebar shows one level at a time: the tab's top-level rows,
 * where a section is a row with a chevron, or one section's pages under a
 * row that goes back. Opening a section slides the list 12px to the start
 * and fades it out while the section comes in from the end; going back
 * reverses it. A page loads with its own section open.
 *
 * Fumadocs keeps the sidebar's header, tab switcher, drawer and footer.
 * Only the page tree inside it changes: Fumadocs renders the tab's
 * top-level nodes one by one with no element around them, so the first
 * node draws both views of the whole tab and every other node draws
 * nothing. The tree context itself is left alone, because the tab switcher
 * and the page's breadcrumb read it.
 */

export function DocsSidebar(props: SidebarProps) {
  return (
    <Sidebar
      {...props}
      components={{ Folder: FirstNode, Item: FirstNode, Separator: FirstNode }}
    />
  );
}

function FirstNode({ item }: { item: PageTree.Node; children?: ReactNode }) {
  const { root } = useTreeContext();
  if (item !== root.children[0]) {
    return null;
  }
  // A new tab starts from its own top-level list.
  return <Views key={root.$id} root={root} />;
}

// A view at rest sits in the flow, so the sidebar scrolls to its height; a
// view out of sight lies over it, 12px to the side, faded out, and can't be
// clicked or tabbed into. The tokens come from @keystoneui/react/base.css,
// whose reduced-motion rule zeroes them.
const layer =
  "flex flex-col gap-0.5 transition-[opacity,translate] duration-(--duration-base) ease-(--ease-ks-out)";
const shown = "relative translate-x-0 opacity-100";
const hidden = "pointer-events-none absolute inset-x-0 top-0 opacity-0";

// The notebook layout's own item look, so rows read the way they did.
const row =
  "relative flex w-full flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary [&_svg]:size-4 [&_svg]:shrink-0";

function Views({ root }: { root: { children: PageTree.Node[] } }) {
  const views = useMemo(() => sidebarViews(root), [root]);
  const pathname = usePathname();

  // Set while rendering, not in an effect, so a page inside a section is
  // served with that section open.
  const [view, setView] = useState(() => sectionFor(views, pathname));
  // The last section opened stays drawn while it fades out on the way back.
  const [opened, setOpened] = useState(view);
  const [seen, setSeen] = useState(pathname);
  if (seen !== pathname) {
    // Moving to another page shows the view it is in. Only then, so going
    // back by hand isn't undone.
    const next = sectionFor(views, pathname);
    setSeen(pathname);
    setView(next);
    if (next) {
      setOpened(next);
    }
  }

  const container = useRef<HTMLDivElement>(null);
  const focusTarget = useRef<string | null>(null);
  const go = useCallback((next: string | undefined, from?: string) => {
    setView(next);
    if (next) {
      setOpened(next);
    }
    focusTarget.current = next ? "back" : (from ?? null);
    container.current
      ?.closest("[data-radix-scroll-area-viewport]")
      ?.scrollTo({ top: 0 });
  }, []);
  const open = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      go(event.currentTarget.dataset.focus),
    [go]
  );
  const back = useCallback(() => go(undefined, opened), [go, opened]);
  // After a click, focus follows into the view that came in: the back row,
  // or the section row just left.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the view changes; the target is read from a ref
  useEffect(() => {
    const target = focusTarget.current;
    focusTarget.current = null;
    if (target) {
      container.current
        ?.querySelector<HTMLElement>(`[data-focus="${target}"]`)
        ?.focus({ preventScroll: true });
    }
  }, [view]);

  const section = views.sections.find((s) => s.id === opened);

  return (
    <div className="relative" data-docs-sidebar="" ref={container}>
      <div
        className={`${layer} ${view ? `${hidden} -translate-x-3 rtl:translate-x-3` : shown}`}
        data-view="main"
        inert={view !== undefined}
      >
        {views.main.map((node, i) =>
          node.type === "section" ? (
            <button
              className={`${row} cursor-pointer`}
              data-focus={node.id}
              key={node.id}
              onClick={open}
              type="button"
            >
              {node.name}
              <ChevronRight aria-hidden className="ms-auto rtl:rotate-180" />
            </button>
          ) : (
            // biome-ignore lint/suspicious/noArrayIndexKey: rows have no id and the list is static per tab
            <RowItem key={i} pathname={pathname} row={node} />
          )
        )}
      </div>

      <div
        className={`${layer} ${view ? shown : `${hidden} translate-x-3 rtl:-translate-x-3`}`}
        data-view="section"
        inert={view === undefined}
      >
        {section && (
          <>
            {/* The whole row goes back: chevron at the start, name centred. */}
            <button
              className="mb-1 grid cursor-pointer grid-cols-[1rem_1fr_1rem] items-center gap-2 rounded-lg p-2 font-medium text-fd-foreground transition-colors hover:bg-fd-accent/50 hover:transition-none"
              data-focus="back"
              onClick={back}
              type="button"
            >
              <ChevronLeft aria-hidden className="size-4 rtl:rotate-180" />
              <span className="truncate text-center">
                <span className="sr-only">Back from </span>
                {section.name}
              </span>
            </button>
            {section.rows.map((r, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: rows have no id and the list is static per section
              <RowItem key={i} pathname={pathname} row={r} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function RowItem({ row: r, pathname }: { row: Row; pathname: string }) {
  if (r.type === "label") {
    return (
      <p className="mt-4 mb-1 px-2 font-medium text-fd-foreground text-xs first:mt-0">
        {r.name}
      </p>
    );
  }
  // Fumadocs' item marks the current page and scrolls it into view.
  return (
    <SidebarItem
      active={isCurrent(r.url, pathname)}
      className={row}
      external={r.external}
      href={r.url}
    >
      {r.name}
    </SidebarItem>
  );
}
