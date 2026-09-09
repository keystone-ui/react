"use client";

import { useMemo, useState } from "react";

import { DashboardToolbar } from "./dashboard-toolbar";
import { KpiRow } from "./kpi-row";
import {
  metrics,
  type PageRow,
  type Range,
  REVENUE_SERIES,
  revenueByWeek,
  sessionsByWeek,
  topPages,
  weeksFor,
} from "./mock-analytics";
import { RevenueTrendCard } from "./revenue-trend-card";
import { SessionsCard } from "./sessions-card";
import {
  type PageSortKey,
  type SortDirection,
  TopPagesPanel,
} from "./top-pages-panel";
import { useReducedMotion } from "./use-reduced-motion";

const PAGE_SIZE = 5;

/**
 * Every piece of state lives here; the panels below are presentational and
 * take callbacks. Same architecture as `tickets-01`, and the reason a block is
 * readable at all — state scattered across panels is what makes a dashboard
 * impossible to follow.
 */
export function DashboardPage() {
  const reducedMotion = useReducedMotion();

  const [range, setRange] = useState<Range>("12w");
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [sort, setSort] = useState<{
    direction: SortDirection;
    key: PageSortKey;
  } | null>({ direction: "desc", key: "views" });
  const [pageIndex, setPageIndex] = useState(0);

  const weeks = weeksFor(range);
  const revenue = useMemo(() => revenueByWeek.slice(-weeks), [weeks]);
  const sessions = useMemo(() => sessionsByWeek.slice(-weeks), [weeks]);

  const sortedPages = useMemo(() => {
    if (!sort) {
      return topPages;
    }
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...topPages].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      if (typeof left === "string" && typeof right === "string") {
        return left.localeCompare(right) * factor;
      }
      return ((left as number) - (right as number)) * factor;
    });
  }, [sort]);

  const pageCount = Math.max(1, Math.ceil(sortedPages.length / PAGE_SIZE));
  const pageRows: readonly PageRow[] = sortedPages.slice(
    pageIndex * PAGE_SIZE,
    pageIndex * PAGE_SIZE + PAGE_SIZE
  );

  const toggleSeries = (key: string) => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Unsorted -> desc -> asc -> unsorted. A new column starts descending, which
  // is what you want for a metric.
  const cycleSort = (key: PageSortKey) => {
    setPageIndex(0);
    setSort((current) => {
      if (current?.key !== key) {
        return { direction: "desc", key };
      }
      if (current.direction === "desc") {
        return { direction: "asc", key };
      }
      return null;
    });
  };

  return (
    <div className="flex min-h-svh w-full flex-col bg-background">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardToolbar
          onRangeChange={(next) => {
            setRange(next);
            setPageIndex(0);
          }}
          range={range}
        />

        <KpiRow metrics={metrics} />

        <section className="grid gap-4 lg:grid-cols-3 [&>*]:min-w-0">
          <RevenueTrendCard
            data={revenue}
            hidden={hidden}
            onToggle={toggleSeries}
            reducedMotion={reducedMotion}
            series={REVENUE_SERIES}
          />
          <SessionsCard data={sessions} reducedMotion={reducedMotion} />
        </section>

        <TopPagesPanel
          onPageIndexChange={setPageIndex}
          onSort={cycleSort}
          pageCount={pageCount}
          pageIndex={pageIndex}
          rows={pageRows}
          sort={sort}
        />
      </div>
    </div>
  );
}
