/**
 * `keystoneui audit --theme`: measure a project's own theme tokens the way
 * keystone measures its defaults (apps/docs/tests/palette.test.ts).
 *
 * Keystone pins contrast for its own palettes in CI; a consumer who edits
 * `--primary` gets no such check. This reads the `:root` and `.dark` blocks of
 * the project's CSS and reports every text-on-surface pair against WCAG AA.
 *
 * Dependency-free: OKLCH converts straight to linear sRGB, which is what WCAG
 * relative luminance is defined on. Values it cannot resolve without a browser
 * (`var()`, `color-mix()`, alpha) are reported as skipped, never guessed.
 */

export type Mode = "dark" | "light";
export type Tokens = Record<Mode, Record<string, string>>;

/** [text token, surface token]. Every pair is body text, so AA is 4.5:1. */
export const TEXT_PAIRS: readonly (readonly [string, string])[] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["muted-foreground", "background"],
  ["accent-foreground", "accent"],
  ["destructive-foreground", "destructive"],
  ["success-foreground", "success"],
  ["warning-foreground", "warning"],
  ["info-foreground", "info"],
];

export const AA_TEXT = 4.5;

const DECLARATION_RE = /--([\w-]+)\s*:\s*([^;]+);/g;
const OKLCH_RE = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*\)$/i;
const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const COMMENT_RE = /\/\*[\s\S]*?\*\//g;

function declarations(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(DECLARATION_RE)) {
    out[name] = value.trim();
  }
  return out;
}

/** Index of the `}` that closes the `{` at `open`. */
function closingBrace(css: string, open: number): number {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") {
      depth++;
    } else if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return css.length;
}

/**
 * Bodies of the `:root` and `.dark` rules that set the theme, in source order.
 *
 * Only rules at the top level or inside `@layer` count. `@media print {
 * :root { --foreground: #000 } }` is keystone's own ink set for paper, and
 * merging it would measure black-on-white instead of the screen theme.
 * Nested blocks *inside* a theme rule (`.dark { @media screen { … } }`) are
 * part of it.
 */
function themeBlocks(css: string): { body: string; selector: string }[] {
  const blocks: { body: string; selector: string }[] = [];
  const preludes: string[] = [];
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") {
      const prelude = css.slice(start, i).trim();
      const ancestorsOk = preludes.every((p) => p.startsWith("@layer"));
      if (ancestorsOk && (prelude === ":root" || prelude === ".dark")) {
        const j = closingBrace(css, i);
        blocks.push({ body: css.slice(i + 1, j), selector: prelude });
        i = j;
        start = j + 1;
        continue;
      }
      preludes.push(prelude);
      start = i + 1;
    } else if (ch === "}") {
      preludes.pop();
      start = i + 1;
    } else if (ch === ";") {
      start = i + 1;
    }
  }
  return blocks;
}

/** `:root` and `.dark` custom properties. Later declarations win, as in CSS. */
export function readThemeTokens(css: string): Tokens {
  const stripped = css.replace(COMMENT_RE, "");
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};
  for (const { body, selector } of themeBlocks(stripped)) {
    Object.assign(selector === ":root" ? light : dark, declarations(body));
  }
  // Dark mode inherits anything it does not override.
  return { dark: { ...light, ...dark }, light };
}

/** Linear-light sRGB channels, or null for anything that needs a browser. */
export function linearRgb(value: string): [number, number, number] | null {
  const oklch = OKLCH_RE.exec(value.trim());
  if (oklch) {
    const l = Number(oklch[1]) / (oklch[2] === "%" ? 100 : 1);
    const c = Number(oklch[3]);
    const h = (Number(oklch[4]) * Math.PI) / 180;
    const a = c * Math.cos(h);
    const b = c * Math.sin(h);
    const l3 = (l + 0.396_337_777_4 * a + 0.215_803_757_3 * b) ** 3;
    const m3 = (l - 0.105_561_345_8 * a - 0.063_854_172_8 * b) ** 3;
    const s3 = (l - 0.089_484_177_5 * a - 1.291_485_548 * b) ** 3;
    const clamp = (x: number) => Math.min(Math.max(x, 0), 1);
    return [
      clamp(4.076_741_662_1 * l3 - 3.307_711_591_3 * m3 + 0.230_969_929_2 * s3),
      clamp(
        -1.268_438_004_6 * l3 + 2.609_757_401_1 * m3 - 0.341_319_396_5 * s3
      ),
      clamp(-0.004_196_086_3 * l3 - 0.703_418_614_7 * m3 + 1.707_614_701 * s3),
    ];
  }
  const hex = HEX_RE.exec(value.trim());
  if (hex) {
    const digits =
      hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join("") : hex[1];
    const channel = (i: number) => {
      const v = Number.parseInt(digits.slice(i, i + 2), 16) / 255;
      return v <= 0.040_45 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return [channel(0), channel(2), channel(4)];
  }
  return null;
}

export function contrastRatio(fg: string, bg: string): number | null {
  const a = linearRgb(fg);
  const b = linearRgb(bg);
  if (!(a && b)) {
    return null;
  }
  const y = ([r, g, bl]: [number, number, number]) =>
    0.2126 * r + 0.7152 * g + 0.0722 * bl;
  const [hi, lo] = [y(a), y(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
}

export interface PairResult {
  mode: Mode;
  pair: string;
  ratio: number | null;
  status: "fail" | "pass" | "skip";
}

function statusOf(ratio: number | null): PairResult["status"] {
  if (ratio === null) {
    return "skip";
  }
  return ratio >= AA_TEXT ? "pass" : "fail";
}

export function auditTheme(tokens: Tokens): PairResult[] {
  const results: PairResult[] = [];
  for (const mode of ["light", "dark"] as const) {
    for (const [fg, bg] of TEXT_PAIRS) {
      const fgValue = tokens[mode][fg];
      const bgValue = tokens[mode][bg];
      if (!(fgValue && bgValue)) {
        continue;
      }
      const ratio = contrastRatio(fgValue, bgValue);
      results.push({
        mode,
        pair: `${fg} on ${bg}`,
        ratio,
        status: statusOf(ratio),
      });
    }
  }
  return results;
}

export function formatAudit(file: string, results: PairResult[]): string {
  if (results.length === 0) {
    return `No keystone token pairs found in ${file}. Pass the CSS file that holds :root and .dark.`;
  }
  const lines = results.map((r) => {
    const mark = { fail: "✖", pass: "✔", skip: "–" }[r.status];
    const ratio =
      r.ratio === null ? "needs a browser" : `${r.ratio.toFixed(2)}:1`;
    return `${mark} ${r.mode.padEnd(5)} ${r.pair.padEnd(42)} ${ratio}`;
  });
  const failed = results.filter((r) => r.status === "fail").length;
  return [
    `Theme contrast — ${file} (WCAG AA for text: ${AA_TEXT}:1)`,
    "",
    ...lines,
    "",
    failed === 0
      ? "All measurable pairs pass."
      : `${failed} pair(s) under ${AA_TEXT}:1.`,
  ].join("\n");
}
