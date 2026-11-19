"use client";

import { buttonVariants } from "@keystoneui/react/button";
import { FilterChip, FilterChips } from "@keystoneui/react/filter-chips";
import { Reel } from "@keystoneui/react/reel";
import { cn } from "@keystoneui/react/utils";
import { useEffect } from "react";

import { FrozenReel } from "./frozen-reel";

const topics = [
  { value: "all", label: "All", count: 42 },
  { value: "typography", label: "Typography", count: 9 },
  { value: "color", label: "Color", count: 7 },
  { value: "motion", label: "Motion", count: 6 },
  { value: "layout", label: "Layout", count: 8 },
  { value: "forms", label: "Forms", count: 5 },
  { value: "icons", label: "Icons", count: 4 },
  { value: "charts", label: "Charts", count: 3 },
];

const sections = [
  "Overview",
  "Activity",
  "Members",
  "Projects",
  "Billing",
  "Invoices",
  "Integrations",
  "Audit log",
  "Settings",
];

function Row({ stacked = false }: { stacked?: boolean }) {
  return (
    <ul className="flex w-max gap-1 rounded-lg bg-muted p-1">
      {sections.map((section) => (
        <li key={section}>
          <a
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              stacked && "relative z-[1]"
            )}
            href={`#${section}`}
          >
            {section}
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Identical overflowing rows: plain arrows behind each gate, the default
 * arrows, and the shared utility on its own.
 */
export function ReelPlainFixture() {
  // A tap before hydration is not replayed; the test waits for this.
  useEffect(() => {
    document.documentElement.dataset.fixtureHydrated = "reel-plain";
  }, []);
  return (
    <main className="flex min-h-screen flex-col gap-6 bg-background p-4 text-foreground">
      {(["pointer", "none", "always"] as const).map((arrows) => (
        <div
          className="w-full max-w-sm"
          data-testid={`plain-${arrows}`}
          key={arrows}
        >
          <Reel arrowVariant="plain" arrows={arrows}>
            <Row />
          </Reel>
        </div>
      ))}
      <div className="w-full max-w-sm" data-testid="default-always">
        <Reel arrows="always">
          <Row />
        </Reel>
      </div>
      {/* Items that stack themselves, as tab triggers do (relative z-[1]). */}
      <div className="w-full max-w-sm" data-testid="default-stacked">
        <Reel arrows="always">
          <Row stacked />
        </Reel>
      </div>
      {/* A uniform row in high contrast with the page, for reading the
          strip and the fade's alpha straight from pixels, with a deep fade. */}
      {(["ltr", "rtl"] as const).map((dir) => (
        <div
          data-testid={`deep-${dir}`}
          dir={dir}
          key={dir}
          style={{ width: 480 }}
        >
          <Reel
            arrowVariant="plain"
            arrows="always"
            className="[--ks-reel-fade-size:6rem]"
          >
            <div className="h-10 w-[1600px] bg-foreground" />
          </Reel>
        </div>
      ))}
      {/* The filter-chips demo's Reel twice: the component as it is now, and
          a frozen copy of it as first shipped. Their pixels must match. */}
      {(["now", "frozen"] as const).map((which) => {
        const Component = which === "now" ? Reel : FrozenReel;
        return (
          <div
            className="w-full max-w-md"
            data-testid={`chips-${which}`}
            key={which}
          >
            <Component>
              <FilterChips
                aria-label="Topic"
                className="mx-auto w-max flex-nowrap"
                defaultValue="all"
              >
                {topics.map((t) => (
                  <FilterChip count={t.count} key={t.value} value={t.value}>
                    {t.label}
                  </FilterChip>
                ))}
              </FilterChips>
            </Component>
          </div>
        );
      })}
      {/* A uniform row at the stock depth, for reading the strip's ramp. */}
      <div data-testid="stock-ltr" style={{ width: 480 }}>
        <Reel arrowVariant="plain" arrows="always">
          <div className="h-10 w-[1600px] bg-foreground" />
        </Reel>
      </div>
      {/* A plain Reel inside the row of another, both overflowing: the
          inner one at its start, the outer one scrolled to its middle. */}
      {(["ltr", "rtl"] as const).map((dir) => (
        <div
          data-testid={`nested-${dir}`}
          dir={dir}
          key={`nested-${dir}`}
          style={{ width: 480 }}
        >
          <Reel arrowVariant="plain" arrows="always">
            <div className="flex w-[1600px] items-center justify-center bg-muted py-2">
              <div data-testid={`inner-${dir}`} style={{ width: 160 }}>
                <Reel arrowVariant="plain" arrows="always">
                  <div className="h-8 w-[600px] bg-foreground" />
                </Reel>
              </div>
            </div>
          </Reel>
        </div>
      ))}
      <div className="w-full max-w-sm" data-testid="utility">
        <div className="ks-scroll-fade-x overflow-x-auto [scrollbar-width:none]">
          <Row />
        </div>
      </div>
    </main>
  );
}
