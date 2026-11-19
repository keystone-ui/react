"use client";

import { cva } from "class-variance-authority";
import * as React from "react";
import { RollingNumber } from "./rolling-number";
import { cn } from "./utils";

// Module-scoped, so the package needs no Node types; bundlers replace the
// literal `process.env.NODE_ENV`, as they do for Base UI's own checks.
declare const process: { env: { NODE_ENV?: string } };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CountdownUnit = "days" | "hours" | "minutes" | "seconds";

interface UseCountdownOptions {
  /** Clock source, in the same epoch and unit as `target`. Read from a ref: a new function takes effect at the next wake. */
  now?: () => number;
  /** Called once per completed run. A timeout or resume event calls the latest callback directly. A completion found during layout is delivered from a passive effect after layout. */
  onComplete?: () => void;
  /** An absolute instant; a number is epoch milliseconds. `null`, `undefined`, an invalid `Date`, a non-finite number or one beyond the range of a `Date` is pending. */
  target: Date | number | null | undefined;
  /** The units shown, largest first whatever the order. Default `["hours", "minutes", "seconds"]`. */
  units?: readonly CountdownUnit[];
}

type CountdownSnapshot =
  | {
      readonly isPending: true;
      readonly isComplete: false;
      readonly days: null;
      readonly hours: null;
      readonly minutes: null;
      readonly seconds: null;
      readonly totalSeconds: null;
    }
  | {
      readonly isPending: false;
      readonly isComplete: boolean;
      readonly days: number;
      readonly hours: number;
      readonly minutes: number;
      readonly seconds: number;
      readonly totalSeconds: number;
    };

type CountdownVariant = "compact" | "labelled";
type CountdownSize = "sm" | "default" | "lg";

interface CountdownProps
  extends Omit<
      React.ComponentProps<"span">,
      "children" | "dangerouslySetInnerHTML"
    >,
    UseCountdownOptions {
  /** Each value is a `RollingNumber` whose changed digits roll down. */
  animated?: boolean;
  /** The visible labels of the `labelled` form. Never used for the visually hidden time text. */
  labels?: Partial<Record<CountdownUnit, string>>;
  /** Digits and the visually hidden time text. Defaults to `en-US`. For consistent server and client markup, pass the same locale and use compatible Intl locale data. */
  locale?: Intl.LocalesArgument;
  size?: CountdownSize;
  variant?: CountdownVariant;
}

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

const UNITS: readonly CountdownUnit[] = ["days", "hours", "minutes", "seconds"];
const UNIT_MS: Record<CountdownUnit, number> = {
  days: 86_400_000,
  hours: 3_600_000,
  minutes: 60_000,
  seconds: 1000,
};
const INTL_UNIT: Record<CountdownUnit, string> = {
  days: "day",
  hours: "hour",
  minutes: "minute",
  seconds: "second",
};
/** Each unit's place in the mask: days 8, hours 4, minutes 2, seconds 1. */
const WEIGHT: Record<CountdownUnit, number> = {
  days: 8,
  hours: 4,
  minutes: 2,
  seconds: 1,
};
/** Hours, minutes and seconds. */
const DEFAULT_MASK = 7;

/**
 * `units` as a number the component computes on every render, one binary
 * place per known unit. Order and duplicates drop out, and nothing keys on
 * the array.
 */
function unitsMask(units: readonly CountdownUnit[] | undefined): number {
  const known = new Set((units ?? []).filter((unit) => UNITS.includes(unit)));
  let mask = 0;
  for (const unit of known) {
    mask += WEIGHT[unit];
  }
  return mask || DEFAULT_MASK;
}

const unitsOf = (mask: number) =>
  UNITS.filter((unit) => Math.floor(mask / WEIGHT[unit]) % 2 === 1);
const smallestMs = (mask: number) => UNIT_MS[unitsOf(mask).at(-1) ?? "seconds"];

// ---------------------------------------------------------------------------
// Time
// ---------------------------------------------------------------------------

const PENDING: CountdownSnapshot = Object.freeze({
  isPending: true,
  isComplete: false,
  days: null,
  hours: null,
  minutes: null,
  seconds: null,
  totalSeconds: null,
});

const getServerSnapshot = () => PENDING;

/** The largest distance from the epoch a `Date` can represent, in ms. */
const MAX_EPOCH_MS = 8.64e15;

/**
 * Epoch ms of a valid target, or null for an unknown one. A `Date` from
 * another realm counts; either signed zero is zero.
 */
function epochOf(target: UseCountdownOptions["target"]): number | null {
  if (target === null || target === undefined) {
    return null;
  }
  let ms: number;
  if (typeof target === "number") {
    ms = target;
  } else {
    try {
      ms = Date.prototype.getTime.call(target);
    } catch {
      // Neither a number nor a Date (a string from JSON, say): unknown.
      ms = Number.NaN;
    }
  }
  if (!Number.isFinite(ms) || Math.abs(ms) > MAX_EPOCH_MS) {
    return null;
  }
  return ms === 0 ? 0 : ms;
}

/** `remaining` rounded up to the smallest listed unit, split largest first. */
function partsOf(
  remaining: number,
  mask: number,
  complete: boolean
): CountdownSnapshot {
  const unit = smallestMs(mask);
  const count = Math.ceil(remaining / unit);
  const parts = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  let rest = count * unit;
  for (const u of unitsOf(mask)) {
    parts[u] = Math.floor(rest / UNIT_MS[u]);
    rest -= parts[u] * UNIT_MS[u];
  }
  return Object.freeze({
    isPending: false,
    isComplete: complete,
    ...parts,
    totalSeconds: (count * unit) / 1000,
  });
}

/** One sample of the clock for a run that has not completed. */
function sample(
  targetMs: number,
  mask: number,
  nowMs: number
): CountdownSnapshot {
  if (!Number.isFinite(nowMs)) {
    return PENDING;
  }
  const remaining = Math.max(0, targetMs - nowMs);
  return partsOf(remaining, mask, remaining === 0);
}

function sameSnapshot(a: CountdownSnapshot, b: CountdownSnapshot) {
  return (
    a.isPending === b.isPending &&
    a.isComplete === b.isComplete &&
    a.days === b.days &&
    a.hours === b.hours &&
    a.minutes === b.minutes &&
    a.seconds === b.seconds &&
    a.totalSeconds === b.totalSeconds
  );
}

/**
 * One per mounted instance. Everything but `listeners` belongs to the
 * committed run and is written only by its effects, timer and listeners.
 */
interface Store {
  /** The last snapshot the committed run published: equal values reuse it. */
  committed: CountdownSnapshot | null;
  latched: boolean;
  listeners: Set<() => void>;
  /** A completion found during a commit, whose callback is still to run. */
  owed: boolean;
  runTarget: number | null;
}

/** The cached sample for one target epoch and one set of units. */
interface Entry {
  snapshot: CountdownSnapshot | null;
}

const createStore = (): Store => ({
  committed: null,
  latched: false,
  listeners: new Set(),
  owed: false,
  runTarget: null,
});

/** `next`, or the committed snapshot when every field is equal. */
const reuse = (store: Store, next: CountdownSnapshot) =>
  store.committed && sameSnapshot(store.committed, next)
    ? store.committed
    : next;

/**
 * Stores `next` unless an equal snapshot is there, and tells React. Only
 * the committed run publishes, so this is where the committed pointer moves,
 * an equal publish included.
 */
function publish(store: Store, entry: Entry, next: CountdownSnapshot) {
  if (entry.snapshot && sameSnapshot(entry.snapshot, next)) {
    store.committed = entry.snapshot;
    return;
  }
  entry.snapshot = reuse(store, next);
  store.committed = entry.snapshot;
  for (const listener of store.listeners) {
    listener();
  }
}

const readClock = (now: (() => number) | undefined) =>
  now ? now() : Date.now();

function useCountdown({
  onComplete,
  now,
  target,
  units,
}: UseCountdownOptions): CountdownSnapshot {
  const [store] = React.useState(createStore);
  const targetMs = epochOf(target);
  const mask = unitsMask(units);

  // Declared before the run's effect, so a run started or woken in this
  // commit already sees this render's clock and callback.
  const latest = React.useRef({ now, onComplete });
  React.useLayoutEffect(() => {
    latest.current = { now, onComplete };
  });

  const invalid = targetMs === null && target !== null && target !== undefined;
  React.useEffect(() => {
    if (invalid && process.env.NODE_ENV !== "production") {
      console.warn(
        "Countdown: `target` is not a Date or a number, or is an invalid Date, a non-finite number or beyond the range of a Date; it renders pending."
      );
    }
  }, [invalid]);

  // Keyed by two numbers the component computed. A render React never
  // commits gets its own entry and leaves the committed one alone.
  // biome-ignore lint/correctness/useExhaustiveDependencies: one entry per target and units
  const entry = React.useMemo<Entry>(
    () => ({ snapshot: null }),
    [targetMs, mask]
  );

  const subscribe = React.useCallback(
    (listener: () => void) => {
      store.listeners.add(listener);
      return () => {
        store.listeners.delete(listener);
      };
    },
    [store]
  );

  // The clock is read here only when this entry holds no sample: so a
  // Countdown first mounted on the client shows its value on its first
  // render, and a re-render reads nothing.
  const getSnapshot = () => {
    if (targetMs === null) {
      return PENDING;
    }
    if (entry.snapshot === null) {
      entry.snapshot = reuse(
        store,
        store.runTarget === targetMs && store.latched
          ? partsOf(0, mask, true)
          : sample(targetMs, mask, readClock(now))
      );
    }
    return entry.snapshot;
  };

  // A layout effect, so a change of target ends the old run at commit:
  // React runs this cleanup before any layout effect of the commit, and
  // before anything else can deliver a wake to the old run.
  React.useLayoutEffect(() => {
    if (targetMs === null) {
      store.runTarget = null;
      store.latched = false;
      store.owed = false;
      store.committed = PENDING;
      return;
    }
    if (store.runTarget !== targetMs) {
      store.runTarget = targetMs;
      store.latched = false;
      store.owed = false;
    }
    // A tick called from here runs inside the commit: a completion it finds
    // is owed, and the effect below calls back after the commit.
    let starting = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let listening = false;
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
      }
    };
    const onPageShow = () => tick();
    // Browsers deliver visibilitychange and pageshow between tasks, never
    // inside a commit; an event dispatched by script from another
    // component's layout effect during this commit is not supported.
    const listen = (on: boolean) => {
      if (on === listening) {
        return;
      }
      listening = on;
      if (on) {
        document.addEventListener("visibilitychange", onVisibility);
        window.addEventListener("pageshow", onPageShow);
      } else {
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("pageshow", onPageShow);
      }
    };
    function tick() {
      clearTimeout(timer);
      timer = undefined;
      if (store.latched) {
        listen(false);
        publish(store, entry, partsOf(0, mask, true));
        return;
      }
      const nowMs = readClock(latest.current.now);
      const next = sample(targetMs as number, mask, nowMs);
      publish(store, entry, next);
      if (next.isPending) {
        listen(false);
        timer = setTimeout(tick, 1000);
        return;
      }
      if (next.isComplete) {
        listen(false);
        store.latched = true;
        if (starting) {
          store.owed = typeof latest.current.onComplete === "function";
        } else {
          latest.current.onComplete?.();
        }
        return;
      }
      listen(true);
      const remaining = (targetMs as number) - nowMs;
      const unit = smallestMs(mask);
      const wait = remaining - (Math.ceil(remaining / unit) - 1) * unit;
      timer = setTimeout(tick, Math.max(1, wait));
    }
    tick();
    starting = false;
    return () => {
      clearTimeout(timer);
      timer = undefined;
      listen(false);
    };
  }, [store, entry, targetMs, mask]);

  // A completion found during a commit is called back here, after the commit:
  // refs are attached and the parent's layout effects have run. A debt kept
  // through a Suspense hide is paid when the Countdown is shown again.
  React.useEffect(() => {
    if (store.owed && store.runTarget === targetMs) {
      store.owed = false;
      latest.current.onComplete?.();
    }
  });

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ---------------------------------------------------------------------------
// Countdown
// ---------------------------------------------------------------------------

const countdownVariants = cva("tabular-nums", {
  variants: {
    variant: {
      compact: "inline-block",
      labelled: "inline-flex",
    },
    size: {
      sm: "text-sm",
      default: "text-2xl",
      lg: "text-5xl",
    },
  },
  defaultVariants: {
    variant: "compact",
    size: "default",
  },
});

const LABEL_SIZE: Record<CountdownSize, string> = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
};

const DEFAULT_LABELS: Record<CountdownUnit, string> = {
  days: "Days",
  hours: "Hours",
  minutes: "Minutes",
  seconds: "Seconds",
};

const DEFAULT_NAME = "Time remaining";

const VALUE_FORMAT: Intl.NumberFormatOptions = {
  minimumIntegerDigits: 2,
  useGrouping: false,
};
const DAYS_FORMAT: Intl.NumberFormatOptions = {
  style: "unit",
  unit: "day",
  unitDisplay: "narrow",
  useGrouping: false,
};

/** Each non-zero unit in words; seconds only while every larger unit is zero. */
function spokenText(
  snapshot: CountdownSnapshot,
  listed: readonly CountdownUnit[],
  locale: Intl.LocalesArgument
): string {
  if (snapshot.isPending) {
    return "";
  }
  const larger = listed.some((u) => u !== "seconds" && snapshot[u] > 0);
  let read = listed.filter(
    (u) => snapshot[u] > 0 && !(u === "seconds" && larger)
  );
  if (read.length === 0) {
    read = listed.slice(-1);
  }
  const words = read.map((u) =>
    new Intl.NumberFormat(locale, {
      style: "unit",
      unit: INTL_UNIT[u],
      unitDisplay: "long",
    }).format(snapshot[u])
  );
  return new Intl.ListFormat(locale, { type: "unit" }).format(words);
}

function Countdown({
  animated = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className,
  labels,
  locale = "en-US",
  now,
  onComplete,
  size = "default",
  target,
  units,
  variant = "compact",
  ...props
}: CountdownProps) {
  const snapshot = useCountdown({ now, onComplete, target, units });
  const listed = unitsOf(unitsMask(units));
  const labelled = variant === "labelled";
  // Built from this render's inputs; nothing about `locale` is kept.
  const digits = new Intl.NumberFormat(locale, VALUE_FORMAT);
  const compactDays = !labelled && listed[0] === "days";

  const cell = (unit: CountdownUnit) => {
    const value = snapshot[unit];
    if (value === null) {
      // The invisible digits reserve the width of a live two-digit value when
      // it exceeds the 2ch floor. The dashes sit over them out of flow.
      return (
        <span className="relative inline-block">
          <span className="invisible">{digits.format(0)}</span>
          <span className="absolute inset-0 text-center">--</span>
        </span>
      );
    }
    const isCompactDay = compactDays && unit === "days";
    if (animated) {
      return (
        <RollingNumber
          format={isCompactDay ? DAYS_FORMAT : VALUE_FORMAT}
          locale={locale}
          trend="down"
          value={value}
        />
      );
    }
    return isCompactDay
      ? new Intl.NumberFormat(locale, DAYS_FORMAT).format(value)
      : digits.format(value);
  };

  // A span, and only spans inside: phrasing content, so a Countdown can sit
  // in a paragraph or a heading and the server HTML parses as rendered.
  return (
    <span
      aria-label={
        ariaLabel ?? (ariaLabelledby == null ? DEFAULT_NAME : undefined)
      }
      aria-labelledby={ariaLabelledby}
      className={cn(countdownVariants({ variant, size }), className)}
      data-complete={snapshot.isComplete ? "" : undefined}
      data-pending={snapshot.isPending ? "" : undefined}
      data-size={size}
      data-slot="countdown"
      data-variant={variant}
      role="timer"
      {...props}
    >
      <span className="sr-only select-none">
        {spokenText(snapshot, listed, locale)}
      </span>
      {/* Clock order never flips: the run is left to right and isolated,
          while the root and each label keep the page direction. Compact is
          inline, not flex, so copying it gives its text on one line. */}
      <span
        aria-hidden="true"
        className={
          labelled
            ? "inline-flex items-end gap-x-[0.75em] [unicode-bidi:isolate]"
            : "inline whitespace-nowrap [unicode-bidi:isolate]"
        }
        dir="ltr"
      >
        {listed.map((unit, index) => (
          <React.Fragment key={unit}>
            {index > 0 && (
              // Raised by 0.1em: fonts draw the colon at lowercase height,
              // about a tenth of an em below the middle of the figures.
              <span
                className="relative bottom-[0.1em]"
                data-slot="countdown-separator"
              >
                {compactDays && index === 1 ? " " : ":"}
              </span>
            )}
            <span
              className={
                labelled ? "flex flex-col items-center gap-1" : undefined
              }
              data-slot="countdown-group"
              data-unit={unit}
            >
              {labelled && (
                <span
                  className={LABEL_SIZE[size]}
                  data-slot="countdown-label"
                  dir="auto"
                >
                  {labels?.[unit] ?? DEFAULT_LABELS[unit]}
                </span>
              )}
              <span
                className="inline-block min-w-[2ch] text-center tabular-nums"
                data-slot="countdown-value"
              >
                {cell(unit)}
              </span>
            </span>
          </React.Fragment>
        ))}
      </span>
    </span>
  );
}

export type {
  CountdownProps,
  CountdownSnapshot,
  CountdownUnit,
  UseCountdownOptions,
};
export { Countdown, countdownVariants, useCountdown };
