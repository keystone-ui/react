"use client";

import * as React from "react";
import { cn } from "./utils";

type RollingNumberTrend = "auto" | "up" | "down";
type Direction = "up" | "down";

interface RollingNumberProps
  extends Omit<
    React.ComponentProps<"span">,
    "children" | "dangerouslySetInnerHTML"
  > {
  /** Whether a changed digit rolls. `false` prints the formatted text directly. */
  animated?: boolean;
  /**
   * RollingNumber passes `locale` and `format` untouched to `new Intl.NumberFormat(locale, format)` each time React calls it, so the text and any error are Intl's. It compares the options Intl resolved (`resolvedOptions()`) with those of the render before. When they are the same, changed digits roll, even if you pass a new object every render. When they differ, the number snaps to the new text.
   *
   * `format` and `locale` must be plain data. When the number or its resolved formatting changes, React calls the component again and Intl reads the inputs again. StrictMode adds another call during development. A digit that rolls adds one more call two frames later. An options object or locale whose getters return a different value, or throw, on a later read is not supported. An object edited in place is read again the next time the component renders.
   */
  format?: Intl.NumberFormatOptions;
  /** The default locale is `en-US`. For consistent server and client text, use the same value and formatting options, a locale supported by both runtimes, and compatible Intl locale data. */
  locale?: Intl.LocalesArgument;
  /** `up`: the new glyph enters from below; `down`: from above; `auto` follows the value. */
  trend?: RollingNumberTrend;
  value: number;
}

const EMPTY_FORMAT: Intl.NumberFormatOptions = {};

/**
 * What is kept between renders: Intl's resolved options, and the digit
 * lookup for their numbering system. Nothing about `locale` or `format` is
 * kept. Its identity is the "same formatting" token: a roll needs it
 * unchanged, a new one snaps.
 */
interface Formatting {
  /** Code point -> digit value, for the resolved numbering system. */
  digits: Map<string, number>;
  resolved: Intl.ResolvedNumberFormatOptions;
  /** The digits are right to left (Adlam, N'Ko): the core runs that way. */
  rtlDigits: boolean;
}

const RTL_DIGITS = /[\p{Script=Adlam}\p{Script=Nko}]/u;

/** Two resolved option sets are the same formatting when every entry is. */
function sameResolved(
  a: Intl.ResolvedNumberFormatOptions,
  b: Intl.ResolvedNumberFormatOptions
): boolean {
  const left = a as unknown as Record<string, unknown>;
  const right = b as unknown as Record<string, unknown>;
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if (!Object.is(left[key], right[key])) {
      return false;
    }
  }
  return true;
}

/**
 * The formatting for newly resolved options. The digit lookup is rebuilt
 * only for a different numbering system.
 */
function formattingFor(
  previous: Formatting | null,
  resolved: Intl.ResolvedNumberFormatOptions
): Formatting {
  if (
    previous &&
    previous.resolved.numberingSystem === resolved.numberingSystem
  ) {
    return { ...previous, resolved };
  }
  const lookup = new Intl.NumberFormat(resolved.locale, {
    numberingSystem: resolved.numberingSystem,
    useGrouping: false,
  });
  const digits = new Map<string, number>();
  for (let d = 0; d <= 9; d++) {
    digits.set(lookup.format(d), d);
  }
  return {
    digits,
    resolved,
    rtlDigits: RTL_DIGITS.test(lookup.format(0)),
  };
}

type Item =
  | { kind: "column"; key: string; glyph: string; place: number; type: string }
  | { kind: "symbol"; key: string; text: string; type: string };

interface Layout {
  /** Index range of the numeric core in `items`, or null when there is none. */
  core: [number, number] | null;
  items: Item[];
  /** A digit glyph outside the lookup: this render snaps. */
  snap: boolean;
}

const isNumberPart = (p: Intl.NumberFormatPart) =>
  p.type === "integer" || p.type === "fraction";

/** The numeric core: from the first integer part to the last integer or fraction part. */
function coreRangeOf(parts: Intl.NumberFormatPart[]): [number, number] {
  const first = parts.findIndex((p) => p.type === "integer");
  let last = -1;
  for (const [i, p] of parts.entries()) {
    if (isNumberPart(p)) {
      last = i;
    }
  }
  return [first, last];
}

interface Cursor {
  fractionPlace: number;
  place: number;
  snap: boolean;
  typeCounts: Map<string, number>;
}

/** The items one `formatToParts` part becomes, advancing the cursor. */
function itemsOfPart(
  p: Intl.NumberFormatPart,
  digits: Map<string, number> | null,
  cursor: Cursor
): Item[] {
  if (digits && isNumberPart(p)) {
    return Array.from(p.value, (glyph) => {
      cursor.snap ||= !digits.has(glyph);
      const at = p.type === "integer" ? cursor.place-- : cursor.fractionPlace--;
      return { kind: "column", key: `d${at}`, glyph, place: at, type: p.type };
    });
  }
  let key: string;
  if (p.type === "group") {
    // Keyed by the place it precedes.
    key = `group${cursor.place}`;
  } else {
    const n = cursor.typeCounts.get(p.type) ?? 0;
    cursor.typeCounts.set(p.type, n + 1);
    key = `${p.type}${n}`;
  }
  if (p.type === "integer") {
    cursor.place -= Array.from(p.value).length;
  }
  return [{ kind: "symbol", key, text: p.value, type: p.type }];
}

/** `digits` is null outside standard notation: no part becomes a column. */
function layoutOf(
  parts: Intl.NumberFormatPart[],
  digits: Map<string, number> | null
): Layout {
  let integerDigits = 0;
  for (const p of parts) {
    if (p.type === "integer") {
      integerDigits += Array.from(p.value).length;
    }
  }
  const [firstPart, lastPart] = coreRangeOf(parts);
  const cursor: Cursor = {
    fractionPlace: -1,
    place: integerDigits - 1,
    snap: false,
    typeCounts: new Map(),
  };
  const items: Item[] = [];
  let coreStart = -1;
  let coreEnd = -1;
  for (const [i, p] of parts.entries()) {
    if (i === firstPart) {
      coreStart = items.length;
    }
    items.push(...itemsOfPart(p, digits, cursor));
    if (i === lastPart) {
      coreEnd = items.length;
    }
  }
  return {
    core: coreStart >= 0 && coreEnd > coreStart ? [coreStart, coreEnd] : null,
    items,
    snap: cursor.snap,
  };
}

interface Face {
  direction: Direction;
  /** Carries the start position until its own first two frames have passed. */
  entering: boolean;
  glyph: string;
  /** Unique per face, so a deadline settles only the face it was set for. */
  id: number;
  prev: string;
}

let lastFaceId = 0;

/** What the last accepted render showed, and which columns are rolling. */
interface Committed {
  animated: boolean;
  /** Columns changed by the latest value change: they carry `data-direction`. */
  changed: ReadonlySet<string>;
  /** Faces still rolling (or at rest after a roll) until their glyph changes. */
  faces: ReadonlyMap<string, Face>;
  /** The kept formatting this state was computed with. */
  formatting: Formatting;
  glyphs: ReadonlyMap<string, string>;
  text: string;
  value: number;
}

const NO_CHANGES: ReadonlySet<string> = new Set();
const NO_FACES: ReadonlyMap<string, Face> = new Map();

function glyphsOf(layout: Layout): Map<string, string> {
  const glyphs = new Map<string, string>();
  for (const item of layout.items) {
    if (item.kind === "column") {
      glyphs.set(item.key, item.glyph);
    }
  }
  return glyphs;
}

function nextCommitted(
  prev: Committed | null,
  current: Omit<Committed, "changed" | "faces" | "glyphs">,
  layout: Layout,
  standard: boolean,
  trend: RollingNumberTrend
): Committed {
  const glyphs = glyphsOf(layout);
  const snaps =
    prev === null ||
    !current.animated ||
    prev.animated !== current.animated ||
    prev.formatting !== current.formatting ||
    !standard ||
    layout.snap ||
    !Number.isFinite(current.value) ||
    !Number.isFinite(prev.value);
  if (snaps) {
    return { ...current, changed: NO_CHANGES, faces: NO_FACES, glyphs };
  }
  if (prev.text === current.text) {
    // An unchanged formatted string never moves; this update changed no
    // column, so none carries `data-direction`. Faces and `data-prev` stay.
    return { ...prev, changed: NO_CHANGES, value: current.value };
  }
  let direction: Direction;
  if (trend === "auto") {
    direction = current.value < prev.value ? "down" : "up";
  } else {
    direction = trend;
  }
  const changed = new Set<string>();
  const faces = new Map<string, Face>();
  for (const [key, glyph] of glyphs) {
    const before = prev.glyphs.get(key);
    if (before !== undefined && before !== glyph) {
      changed.add(key);
      lastFaceId++;
      faces.set(key, {
        direction,
        entering: true,
        glyph,
        id: lastFaceId,
        prev: before,
      });
    } else {
      const face = prev.faces.get(key);
      if (face?.glyph === glyph) {
        faces.set(key, face);
      }
    }
  }
  return { ...current, changed, faces, glyphs };
}

/** `current` with the faces whose deadline passed at rest; others untouched. */
function settled(
  current: Committed | null,
  due: ReadonlySet<number>
): Committed | null {
  if (!current) {
    return current;
  }
  let faces: Map<string, Face> | null = null;
  for (const [key, face] of current.faces) {
    if (face.entering && due.has(face.id)) {
      faces ??= new Map(current.faces);
      faces.set(key, { ...face, entering: false });
    }
  }
  return faces ? { ...current, faces } : current;
}

// `motion-reduce:transition-none` also stops a roll already in flight when
// the reduced-motion preference turns on.
const FACE_CLASS =
  "relative inline-block transition-[translate] duration-(--duration-slow,250ms) ease-(--ease-ks-out,cubic-bezier(0.23,1,0.32,1)) motion-reduce:transition-none";
const PREV_CLASS =
  "before:absolute before:left-0 before:content-[attr(data-prev)]";
// Where the outgoing glyph sits: the side the new face moves toward.
const PREV_SIDE_CLASS: Record<Direction, string> = {
  up: "before:bottom-full",
  down: "before:top-full",
};
// The start position is motion-safe only: under prefers-reduced-motion the
// new face is never painted away from rest, not even for one frame. It is
// dropped once the roll has begun, because Chromium applies @starting-style
// again when an element is shown after `display: none`.
const START_CLASS: Record<Direction, string> = {
  up: "motion-safe:starting:translate-y-full",
  down: "motion-safe:starting:-translate-y-full",
};

interface SymbolProps {
  text: string;
  type: string;
}

const NumberSymbol = React.memo(function RollingNumberSymbol({
  text,
  type,
}: SymbolProps) {
  return (
    <span data-slot="rolling-number-symbol" data-type={type}>
      {text}
    </span>
  );
});

interface ColumnProps {
  direction: Direction | undefined;
  face: Face | undefined;
  glyph: string;
  place: number;
  type: string;
}

const Column = React.memo(function RollingNumberColumn({
  direction,
  face,
  glyph,
  place,
  type,
}: ColumnProps) {
  return (
    <span
      className="relative inline-block h-[1lh] overflow-clip"
      data-direction={direction}
      data-place={place}
      data-slot="rolling-number-digit"
      data-type={type}
    >
      <span
        className={
          face
            ? cn(
                FACE_CLASS,
                PREV_CLASS,
                PREV_SIDE_CLASS[face.direction],
                face.entering && START_CLASS[face.direction]
              )
            : FACE_CLASS
        }
        data-prev={face?.prev}
        // A new glyph is a new face, so `@starting-style` applies to it.
        key={glyph}
      >
        {glyph}
      </span>
    </span>
  );
});

function RollingNumber({
  animated = true,
  className,
  format = EMPTY_FORMAT,
  locale = "en-US",
  trend = "auto",
  value,
  ...props
}: RollingNumberProps) {
  // RollingNumber passes `locale` and `format` untouched to `new
  // Intl.NumberFormat(locale, format)` each time React calls it, so the text
  // and any error are Intl's. It compares the options Intl resolved
  // (`resolvedOptions()`) with those of the render before. When they are the
  // same, changed digits roll, even if you pass a new object every render.
  // When they differ, the number snaps to the new text.
  //
  // `format` and `locale` must be plain data. When the number or its resolved
  // formatting changes, React calls the component again and Intl reads the
  // inputs again. StrictMode adds another call during development. A digit
  // that rolls adds one more call two frames later. An options object or
  // locale whose getters return a different value, or throw, on a later read
  // is not supported. An object edited in place is read again the next time
  // the component renders.
  const main = new Intl.NumberFormat(locale, format);
  const resolved = main.resolvedOptions();
  const [kept, setKept] = React.useState<Formatting | null>(null);
  let formatting = kept;
  if (formatting === null || !sameResolved(formatting.resolved, resolved)) {
    formatting = formattingFor(kept, resolved);
    setKept(formatting);
  }
  const standard = resolved.notation === "standard";
  const text = main.format(value);
  const layout = layoutOf(
    main.formatToParts(value),
    standard ? formatting.digits : null
  );

  // Derived during render (React's "storing information from previous
  // renders"), so a re-render with the same value keeps the roll, and
  // StrictMode's second render computes the same thing.
  const [committed, setCommitted] = React.useState<Committed | null>(null);
  let state = committed;
  if (
    state === null ||
    state.formatting !== formatting ||
    state.animated !== animated ||
    state.text !== text ||
    !Object.is(state.value, value)
  ) {
    state = nextCommitted(
      committed,
      { animated, formatting, text, value },
      layout,
      standard,
      trend
    );
    setCommitted(state);
  }

  // Each entering face stops carrying the start position after its own two
  // delivered frames, so showing the number again does not replay its roll.
  // One frame loop serves every pending face; a later commit neither
  // postpones a deadline nor lets it settle a newer face.
  const pending = React.useRef(new Map<number, number>());
  const frame = React.useRef<number | null>(null);
  React.useEffect(() => {
    for (const face of committed?.faces.values() ?? []) {
      if (face.entering && !pending.current.has(face.id)) {
        pending.current.set(face.id, 0);
      }
    }
    if (pending.current.size === 0 || frame.current !== null) {
      return;
    }
    const tick = () => {
      frame.current = null;
      const due = new Set<number>();
      for (const [id, frames] of pending.current) {
        if (frames + 1 >= 2) {
          due.add(id);
          pending.current.delete(id);
        } else {
          pending.current.set(id, frames + 1);
        }
      }
      if (due.size > 0) {
        setCommitted((current) => settled(current, due));
      }
      if (pending.current.size > 0) {
        frame.current = requestAnimationFrame(tick);
      }
    };
    frame.current = requestAnimationFrame(tick);
  }, [committed]);
  React.useEffect(
    () => () => {
      if (frame.current !== null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
    },
    []
  );

  /**
   * `geometricPrecision` keeps each digit at the font's true advance: where
   * text is hinted (common on Linux) glyphs are rounded to whole pixels, so
   * tabular digits would differ by a pixel or two and the number would change
   * width as its digits change. A consumer `[text-rendering:auto]` restores the
   * browser's default.
   */
  const rootClassName = cn(
    "inline-block whitespace-nowrap tabular-nums [text-rendering:geometricPrecision]",
    className
  );

  if (!animated) {
    return (
      <span className={rootClassName} data-slot="rolling-number" {...props}>
        {text}
      </span>
    );
  }

  const renderItem = (item: Item) => {
    if (item.kind === "symbol") {
      return <NumberSymbol key={item.key} text={item.text} type={item.type} />;
    }
    const face = state.faces.get(item.key);
    return (
      <Column
        direction={state.changed.has(item.key) ? face?.direction : undefined}
        face={face}
        glyph={item.glyph}
        key={item.key}
        place={item.place}
        type={item.type}
      />
    );
  };

  const { core, items } = layout;
  return (
    <span className={rootClassName} data-slot="rolling-number" {...props}>
      <span className="sr-only select-none">{text}</span>
      <span aria-hidden="true" className="inline">
        {core ? (
          <>
            {items.slice(0, core[0]).map(renderItem)}
            {/* Overridden, not just isolated: the digit columns are atomic
                inlines, which the bidi algorithm reorders around Arabic
                separators. The override runs the way the digits are written:
                right to left for Adlam and N'Ko, left to right otherwise. */}
            <span
              className="inline [unicode-bidi:isolate-override]"
              dir={formatting.rtlDigits ? "rtl" : "ltr"}
            >
              {items.slice(core[0], core[1]).map(renderItem)}
            </span>
            {items.slice(core[1]).map(renderItem)}
          </>
        ) : (
          items.map(renderItem)
        )}
      </span>
    </span>
  );
}

export type { RollingNumberProps };
export { RollingNumber };
