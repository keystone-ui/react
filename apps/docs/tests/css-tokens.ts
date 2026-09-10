/**
 * Read design tokens out of a CSS file.
 *
 * Brace-aware rather than regex-delimited, which matters now that the `.dark`
 * token block wraps its declarations in `@media screen`:
 *
 *     .dark {
 *       @media screen {
 *         --background: …;
 *       }
 *     }
 *
 * A `/\.dark\s*\{([^}]*)\}/` pattern still *appears* to work on that, because
 * the declarations sit inside the nested block and the capture happens to
 * include them before terminating on the inner brace. It would break the
 * moment a second nested block or a declaration after the `@media` appeared,
 * and a test that passes for the wrong reason is worse than one that fails.
 */

import { readFileSync } from "node:fs";

const TOKEN_DECL_RE = /--([a-z0-9-]+)\s*:\s*([^;]+);/g;
const BACKGROUND_DECL_RE = /--background\s*:/;
const WHITESPACE_RE = /\s/;

/**
 * Bodies of every **top-level** rule with this selector, brace-matched so
 * nested at-rules inside the body are included rather than truncating it.
 *
 * Top-level is the load-bearing word. `@media print { :root { … } }` also
 * declares `--background`, so a scan that ignored nesting would merge the
 * print ink values into the screen token set and the two would silently
 * disagree. Only a `:root` at brace depth zero is the theme's.
 */
/** Index of the `}` closing the block opened at `open`. */
function matchBrace(css: string, open: number): number {
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") {
      depth += 1;
    } else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }
  return css.length;
}

/**
 * Index of the `{` opening a rule for `selector` at `index`, or -1 when this
 * occurrence is not a rule opening.
 *
 * `.dark {` is an opening; the `.dark *` inside
 * `@custom-variant dark { … &:is(.dark *) … }` is not.
 */
function ruleOpensAt(css: string, selector: string, index: number): number {
  let cursor = index + selector.length;
  while (cursor < css.length && WHITESPACE_RE.test(css[cursor])) {
    cursor += 1;
  }
  return css[cursor] === "{" ? cursor : -1;
}

export function ruleBodies(css: string, selector: string): string[] {
  const bodies: string[] = [];
  let depth = 0;
  let index = 0;

  while (index < css.length) {
    const char = css[index];

    if (char === "{" || char === "}") {
      depth += char === "{" ? 1 : -1;
      index += 1;
      continue;
    }

    const open =
      depth === 0 && css.startsWith(selector, index)
        ? ruleOpensAt(css, selector, index)
        : -1;

    if (open === -1) {
      index += 1;
      continue;
    }

    const end = matchBrace(css, open);
    bodies.push(css.slice(open + 1, end));
    index = end + 1;
  }

  return bodies;
}

export function declarations(body: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  TOKEN_DECL_RE.lastIndex = 0;
  let decl = TOKEN_DECL_RE.exec(body);
  while (decl !== null) {
    tokens[decl[1]] = decl[2].trim();
    decl = TOKEN_DECL_RE.exec(body);
  }
  return tokens;
}

/**
 * The theme token block for one mode.
 *
 * The docs site declares Fumadocs variables in their own `:root`, so the theme
 * block is identified by content (it declares `--background`) rather than by
 * being first in the file.
 */
export function tokenBlock(
  path: string,
  selector: string
): Record<string, string> {
  const css = readFileSync(path, "utf-8");
  const merged: Record<string, string> = {};
  let found = false;

  for (const body of ruleBodies(css, selector)) {
    if (!BACKGROUND_DECL_RE.test(body)) {
      continue;
    }
    found = true;
    Object.assign(merged, declarations(body));
  }

  if (!found) {
    throw new Error(`No ${selector} token block found in ${path}`);
  }
  return merged;
}

export const MODES = ["light", "dark"] as const;
export type Mode = (typeof MODES)[number];

/** Light and dark token maps for one CSS file. */
export function tokenSource(
  path: string
): Record<Mode, Record<string, string>> {
  return {
    dark: tokenBlock(path, ".dark"),
    light: tokenBlock(path, ":root"),
  };
}
