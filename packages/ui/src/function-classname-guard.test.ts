// @vitest-environment node

/**
 * Base UI lets a part's `className` be a function of its state. `cn()` cannot
 * take one: clsx's `ClassValue` includes `Record<string, any>`, so a function
 * type-checks, and then clsx drops it. 92 exported parts dropped a consumer's
 * function this way until they moved to `mergeClassName(base, className)`.
 *
 * `function-classname.test.tsx` renders the parts that exist today. This test
 * guards the next one: it type-checks `packages/ui/src` and fails on
 *
 *   A. any `cn(…)` argument whose type can be a function: the function would
 *      be dropped (a wrapper whose own `className` prop accepts one, written
 *      the usual way, `cn("…", className)`);
 *   B. `className={cn(…className…)}` handed to an element whose `className`
 *      accepts a function: a Base UI primitive, or a part that wraps one. Use
 *      `mergeClassName` there even when the outer prop is a string today, so
 *      widening it later does not reintroduce the drop.
 *
 * Known exceptions are listed in ALLOWED with the reason.
 */

import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const SRC_DIR = import.meta.dirname;
const SOURCE_FILE = /\.tsx?$/;
const WHITESPACE = /\s+/g;

/** `file:owner:rule` → why it is allowed. Every entry must still match. */
const NOT_EXPORTED =
  "not exported; SelectContent renders it with no className, so no consumer can pass a function";
const ALLOWED: Record<string, string> = {
  "select.tsx:SelectScrollUpButton:A": NOT_EXPORTED,
  "select.tsx:SelectScrollUpButton:B": NOT_EXPORTED,
  "select.tsx:SelectScrollDownButton:A": NOT_EXPORTED,
  "select.tsx:SelectScrollDownButton:B": NOT_EXPORTED,
  "toast.tsx:Toaster:B":
    "Toaster's own className is typed string (its props are a plain interface); it reaches the viewport primitive as a string",
  "calendar.tsx:CalendarDayButton:B":
    "react-day-picker's DayButton props type className as string; it reaches Button as a string",
  "command.tsx:CommandDialog:B":
    "CommandDialogProps declares className?: string; it reaches ModalContent as a string",
  "pagination.tsx:PaginationLink:B":
    "className comes from ComponentProps<'a'>, a string; it reaches Button as a string",
};

interface Hit {
  key: string;
  text: string;
  where: string;
}

const isCallable = (type: ts.Type): boolean =>
  type.isUnion()
    ? type.types.some(isCallable)
    : type.getCallSignatures().length > 0;

function ownerName(node: ts.Node, sf: ts.SourceFile): string {
  let n: ts.Node = node;
  while (n.parent && n.parent !== sf) {
    n = n.parent;
  }
  if (ts.isFunctionDeclaration(n) && n.name) {
    return n.name.text;
  }
  if (ts.isVariableStatement(n)) {
    return n.declarationList.declarations
      .map((d) => d.name.getText(sf))
      .join(",");
  }
  return ts.SyntaxKind[n.kind];
}

const mentionsClassName = (node: ts.Node): boolean =>
  (ts.isIdentifier(node) && node.text === "className") ||
  (ts.forEachChild(node, (c) => mentionsClassName(c) || undefined) ?? false);

function scan(): Hit[] {
  const configPath = join(dirname(SRC_DIR), "tsconfig.json");
  const parsed = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined }
  );
  if (!parsed) {
    throw new Error(`could not read ${configPath}`);
  }
  const files = readdirSync(SRC_DIR)
    .filter((f) => SOURCE_FILE.test(f) && !f.includes(".test."))
    .map((f) => join(SRC_DIR, f));
  const program = ts.createProgram(files, {
    ...parsed.options,
    noEmit: true,
    skipLibCheck: true,
  });
  const checker = program.getTypeChecker();
  const hits: Hit[] = [];

  for (const path of files) {
    const sf = program.getSourceFile(path);
    if (!sf) {
      throw new Error(`not loaded: ${path}`);
    }
    const file = path.slice(SRC_DIR.length + 1);
    const record = (node: ts.Node, rule: "A" | "B") => {
      const line = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line;
      hits.push({
        key: `${file}:${ownerName(node, sf)}:${rule}`,
        where: `${file}:${line + 1}`,
        text: node.getText(sf).replace(WHITESPACE, " ").slice(0, 120),
      });
    };
    const visit = (node: ts.Node) => {
      // A: a cn() argument that can be a function is dropped by clsx.
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "cn"
      ) {
        for (const arg of node.arguments) {
          if (isCallable(checker.getTypeAtLocation(arg))) {
            record(arg, "A");
          }
        }
      }
      // B: cn(…className…) handed to a className that accepts a function.
      if (
        ts.isJsxAttribute(node) &&
        node.name.getText(sf) === "className" &&
        node.initializer &&
        ts.isJsxExpression(node.initializer) &&
        node.initializer.expression &&
        ts.isCallExpression(node.initializer.expression) &&
        node.initializer.expression.expression.getText(sf) === "cn" &&
        mentionsClassName(node.initializer.expression)
      ) {
        const target = checker.getContextualType(node.initializer.expression);
        if (target && isCallable(target)) {
          record(node, "B");
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return hits;
}

describe("function className guard", () => {
  const hits = scan();

  it("finds no cn() that would drop a function className", () => {
    const offending = hits
      .filter((h) => !(h.key in ALLOWED))
      .map((h) => `${h.where} [${h.key}] ${h.text}`);
    expect(
      offending,
      "use mergeClassName(base, className) instead of cn(…, className)"
    ).toEqual([]);
  });

  it("has no stale allow-list entries", () => {
    const seen = new Set(hits.map((h) => h.key));
    expect(Object.keys(ALLOWED).filter((k) => !seen.has(k))).toEqual([]);
  });

  it("still sees the sites it guards", () => {
    // If the scan stopped resolving types, it would find nothing and pass.
    expect(hits.length).toBeGreaterThanOrEqual(Object.keys(ALLOWED).length);
  });
});
