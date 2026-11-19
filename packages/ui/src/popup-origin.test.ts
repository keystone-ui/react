// @vitest-environment node

/**
 * Positioned popups scale in from their trigger, read straight from source.
 *
 * Base UI writes `--transform-origin` on every Positioner from the rendered
 * placement: on the trigger's edge, at the trigger's alignment point, and
 * mirrored when the popup flips or runs right-to-left. The variable does
 * nothing unless the Popup inside reads it, so every Base UI Popup rendered
 * inside its Positioner carries `origin-(--transform-origin)`. Without it the
 * 0.95 scale in `base.css` runs from the popup's own centre. The browser half
 * of this check is `apps/storybook/stories/popup-origin.stories.tsx`.
 *
 * The scan walks each component's TSX with the TypeScript parser. A Modal,
 * AlertDialog or Drawer popup has no Positioner and no trigger-relative
 * origin, and opens from the centre of the screen or a screen edge by design,
 * so a Popup that is not inside a Positioner of the same primitive is skipped.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const SRC_DIR = import.meta.dirname;
const TSX = /\.tsx$/;
const WHITESPACE = /\s+/;
const TOKEN = "origin-(--transform-origin)";
const BASE_UI = "@base-ui/react";
/** Calls whose string arguments end up in the class list. */
const CLASS_HELPERS = new Set(["cn", "mergeClassName"]);
/** How far a className value is followed through local constants. */
const MAX_DEPTH = 8;

/** The positioned popups the library ships, by `data-slot`. */
const KNOWN_SLOTS = [
  "combobox-content",
  "dropdown-menu-content",
  "dropdown-menu-sub-content",
  "popover-content",
  "select-content",
  "tooltip-content",
];

/**
 * A Base UI primitive or one of its parts (`member`). `module` names the
 * primitive by its import specifier and imported name, so a Menu and a
 * Popover imported from the package root stay apart. A namespace import
 * (`import * as X`) is `namespace: true` with `module` the bare specifier;
 * `X.Menu` then names the primitive.
 */
interface Part {
  member: string | null;
  module: string;
  namespace?: true;
}

interface PositionedPopup {
  file: string;
  hasOrigin: boolean;
  part: string;
  slot: string;
}

type Opening = ts.JsxOpeningElement | ts.JsxSelfClosingElement;

/** Whether a binding name (plain or destructured) declares `text`. */
function binds(name: ts.BindingName, text: string): boolean {
  if (ts.isIdentifier(name)) {
    return name.text === text;
  }
  return name.elements.some(
    (e) => !ts.isOmittedExpression(e) && binds(e.name, text)
  );
}

function scan(file: string, source: string): PositionedPopup[] {
  const sf = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const bindings = new Map<string, Part>();
  const declarations: ts.VariableDeclaration[] = [];

  const collect = (node: ts.Node) => {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      (node.moduleSpecifier.text === BASE_UI ||
        node.moduleSpecifier.text.startsWith(`${BASE_UI}/`))
    ) {
      const specifier = node.moduleSpecifier.text;
      const named = node.importClause?.namedBindings;
      if (named && ts.isNamespaceImport(named)) {
        bindings.set(named.name.text, {
          module: specifier,
          member: null,
          namespace: true,
        });
      }
      if (named && ts.isNamedImports(named)) {
        for (const element of named.elements) {
          const imported = (element.propertyName ?? element.name).getText(sf);
          bindings.set(element.name.text, {
            module: `${specifier}#${imported}`,
            member: null,
          });
        }
      }
    }
    if (ts.isVariableDeclaration(node)) {
      declarations.push(node);
    }
    ts.forEachChild(node, collect);
  };
  collect(sf);

  const resolve = (expr: ts.Node): Part | null => {
    if (ts.isIdentifier(expr)) {
      return bindings.get(expr.text) ?? null;
    }
    if (ts.isPropertyAccessExpression(expr)) {
      const base = resolve(expr.expression);
      if (base?.namespace) {
        return { module: `${base.module}#${expr.name.text}`, member: null };
      }
      return base && base.member === null
        ? { module: base.module, member: expr.name.text }
        : null;
    }
    if (ts.isParenthesizedExpression(expr) || ts.isAsExpression(expr)) {
      return resolve(expr.expression);
    }
    return null;
  };

  // Local aliases (`const Popup = P.Popup`, `const { Popup } = P`), which can
  // chain, so resolve until nothing new appears.
  let added = true;
  while (added) {
    added = false;
    for (const d of declarations) {
      if (!d.initializer) {
        continue;
      }
      if (ts.isIdentifier(d.name)) {
        const part = resolve(d.initializer);
        if (part && !bindings.has(d.name.text)) {
          bindings.set(d.name.text, part);
          added = true;
        }
      } else if (ts.isObjectBindingPattern(d.name)) {
        const base = resolve(d.initializer);
        if (!base || base.member !== null) {
          continue;
        }
        for (const element of d.name.elements) {
          const key = element.propertyName ?? element.name;
          if (
            ts.isIdentifier(element.name) &&
            ts.isIdentifier(key) &&
            !bindings.has(element.name.text)
          ) {
            bindings.set(
              element.name.text,
              base.namespace
                ? { module: `${base.module}#${key.text}`, member: null }
                : { module: base.module, member: key.text }
            );
            added = true;
          }
        }
      }
    }
  }

  /**
   * Search variable statements in enclosing blocks and the source file.
   * Return the initializer of a matching identifier. A matching parameter or
   * destructured name stops the search. Other binding sites can fall through
   * to an outer declaration.
   */
  const lookup = (id: ts.Identifier): ts.Expression | undefined => {
    for (let scope = id.parent; scope; scope = scope.parent) {
      if (
        ts.isFunctionLike(scope) &&
        scope.parameters.some((p) => binds(p.name, id.text))
      ) {
        return;
      }
      if (ts.isBlock(scope) || ts.isSourceFile(scope)) {
        for (const statement of scope.statements) {
          if (!ts.isVariableStatement(statement)) {
            continue;
          }
          for (const d of statement.declarationList.declarations) {
            if (binds(d.name, id.text)) {
              return ts.isIdentifier(d.name) ? d.initializer : undefined;
            }
          }
        }
      }
    }
  };

  const returned = (body: ts.Node, depth: number): string[] => {
    const out: string[] = [];
    const walk = (node: ts.Node) => {
      if (ts.isReturnStatement(node)) {
        out.push(...classStrings(node.expression, depth + 1));
      } else if (!ts.isFunctionLike(node)) {
        ts.forEachChild(node, walk);
      }
    };
    ts.forEachChild(body, walk);
    return out;
  };

  /** Collect string fragments the scan recognizes in a className expression. */
  const classStrings = (
    expr: ts.Expression | undefined,
    depth = 0
  ): string[] => {
    if (!expr || depth > MAX_DEPTH) {
      return [];
    }
    if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
      return [expr.text];
    }
    if (ts.isTemplateExpression(expr)) {
      return [
        expr.head.text,
        ...expr.templateSpans.flatMap((span) => [
          span.literal.text,
          ...classStrings(span.expression, depth + 1),
        ]),
      ];
    }
    if (
      ts.isParenthesizedExpression(expr) ||
      ts.isAsExpression(expr) ||
      ts.isSatisfiesExpression(expr) ||
      ts.isNonNullExpression(expr)
    ) {
      return classStrings(expr.expression, depth + 1);
    }
    if (ts.isConditionalExpression(expr)) {
      return [
        ...classStrings(expr.whenTrue, depth + 1),
        ...classStrings(expr.whenFalse, depth + 1),
      ];
    }
    if (ts.isBinaryExpression(expr)) {
      return [
        ...classStrings(expr.left, depth + 1),
        ...classStrings(expr.right, depth + 1),
      ];
    }
    if (ts.isArrayLiteralExpression(expr)) {
      return expr.elements.flatMap((e) => classStrings(e, depth + 1));
    }
    if (
      ts.isCallExpression(expr) &&
      ts.isIdentifier(expr.expression) &&
      CLASS_HELPERS.has(expr.expression.text)
    ) {
      return expr.arguments.flatMap((a) => classStrings(a, depth + 1));
    }
    if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) {
      return ts.isBlock(expr.body)
        ? returned(expr.body, depth)
        : classStrings(expr.body, depth + 1);
    }
    if (ts.isIdentifier(expr)) {
      return classStrings(lookup(expr), depth + 1);
    }
    return [];
  };

  const attribute = (opening: Opening, name: string) =>
    opening.attributes.properties.find(
      (p): p is ts.JsxAttribute =>
        ts.isJsxAttribute(p) && p.name.getText(sf) === name
    );

  const hasOrigin = (opening: Opening) => {
    const init = attribute(opening, "className")?.initializer;
    let strings: string[] = [];
    if (init && ts.isStringLiteral(init)) {
      strings = [init.text];
    } else if (init && ts.isJsxExpression(init)) {
      strings = classStrings(init.expression);
    }
    return strings.some((s) => s.split(WHITESPACE).includes(TOKEN));
  };

  const slotOf = (opening: Opening) => {
    const init = attribute(opening, "data-slot")?.initializer;
    return init && ts.isStringLiteral(init) ? init.text : "(no data-slot)";
  };

  const found: PositionedPopup[] = [];
  const visit = (node: ts.Node, positioners: string[]) => {
    let opening: Opening | null = null;
    if (ts.isJsxElement(node)) {
      opening = node.openingElement;
    } else if (ts.isJsxSelfClosingElement(node)) {
      opening = node;
    }
    let inside = positioners;
    const part = opening ? resolve(opening.tagName) : null;
    if (opening && part?.member === "Positioner") {
      inside = [...positioners, part.module];
    } else if (
      opening &&
      part?.member === "Popup" &&
      positioners.includes(part.module)
    ) {
      found.push({
        file,
        hasOrigin: hasOrigin(opening),
        part: opening.tagName.getText(sf),
        slot: slotOf(opening),
      });
    }
    ts.forEachChild(node, (child) => visit(child, inside));
  };
  visit(sf, []);
  return found;
}

const popups = readdirSync(SRC_DIR)
  .filter((file) => TSX.test(file) && !file.includes(".test."))
  .flatMap((file) => scan(file, readFileSync(join(SRC_DIR, file), "utf-8")));

const IMPORTS = `import { Menu as P } from "@base-ui/react/menu";
import { Dialog } from "@base-ui/react/dialog";
`;

describe("popup transform origin", () => {
  it("finds the six positioned popups it guards", () => {
    expect(popups.map(({ slot }) => slot)).toEqual(
      expect.arrayContaining(KNOWN_SLOTS)
    );
  });

  it("scales every positioned Popup from Base UI's --transform-origin", () => {
    const offenders = popups
      .filter(({ hasOrigin }) => !hasOrigin)
      .map(({ file, part, slot }) => `${file}: ${slot} (${part})`);
    expect(offenders).toEqual([]);
  });

  describe("the scan", () => {
    it("follows a local alias of the primitive's Popup", () => {
      const source = `${IMPORTS}const Popup = P.Popup;
export const A = () => (
  <P.Positioner><Popup className="origin-center" data-slot="a" /></P.Positioner>
);`;
      expect(scan("alias.tsx", source)).toEqual([
        { file: "alias.tsx", hasOrigin: false, part: "Popup", slot: "a" },
      ]);
    });

    it("reads the token from className only, not another prop", () => {
      const source = `${IMPORTS}export const B = () => (
  <P.Positioner>
    <P.Popup className="origin-center" data-example="origin-(--transform-origin)" data-slot="b" />
  </P.Positioner>
);`;
      expect(scan("prop.tsx", source)).toEqual([
        { file: "prop.tsx", hasOrigin: false, part: "P.Popup", slot: "b" },
      ]);
    });

    it("accepts the token returned by a className callback", () => {
      const source = `${IMPORTS}export const C = () => (
  <P.Positioner>
    <P.Popup className={() => "origin-(--transform-origin)"} data-slot="c" />
  </P.Positioner>
);`;
      expect(scan("callback.tsx", source)).toEqual([
        { file: "callback.tsx", hasOrigin: true, part: "P.Popup", slot: "c" },
      ]);
    });

    it("reads a primitive imported from the package root", () => {
      const source = `import { Menu, Popover } from "@base-ui/react";
export const F = () => (
  <Menu.Positioner>
    <Menu.Popup className="origin-center" data-slot="f" />
  </Menu.Positioner>
);
export const G = () => (
  <Popover.Positioner>
    <Menu.Popup className="origin-center" data-slot="g" />
  </Popover.Positioner>
);`;
      expect(scan("root.tsx", source)).toEqual([
        { file: "root.tsx", hasOrigin: false, part: "Menu.Popup", slot: "f" },
      ]);
    });

    it.each([["@base-ui/react/menu"], ["@base-ui/react"]])(
      "reads a namespace import from %s",
      (specifier) => {
        const source = `import * as X from "${specifier}";
export const H = () => (
  <X.Menu.Positioner>
    <X.Menu.Popup data-slot="extra" className="origin-center" />
  </X.Menu.Positioner>
);`;
        expect(scan("namespace.tsx", source)).toEqual([
          {
            file: "namespace.tsx",
            hasOrigin: false,
            part: "X.Menu.Popup",
            slot: "extra",
          },
        ]);
      }
    );

    it("reads a className constant in the scope where it is used", () => {
      const source = `${IMPORTS}const c = "origin-center";
export const I = () => (
  <P.Positioner><P.Popup className={c} data-slot="i" /></P.Positioner>
);
export function Example() {
  const c = "origin-(--transform-origin)";
  return <i data-example={c} />;
}`;
      expect(scan("shadow.tsx", source)).toEqual([
        { file: "shadow.tsx", hasOrigin: false, part: "P.Popup", slot: "i" },
      ]);
    });

    it("skips a Popup that is not inside a Positioner", () => {
      const source = `${IMPORTS}export const D = () => (
  <P.Positioner>
    <P.Popup className="origin-(--transform-origin)" data-slot="d" />
  </P.Positioner>
);
export const E = () => <Dialog.Popup className="fixed" data-slot="e" />;`;
      expect(scan("sibling.tsx", source)).toEqual([
        { file: "sibling.tsx", hasOrigin: true, part: "P.Popup", slot: "d" },
      ]);
    });
  });
});
