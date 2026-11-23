import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  defaultStrings,
  type StringsOverrides,
  StringsProvider,
  useStrings,
} from "./strings";

// =============================================================================
// The merge rule, through a test-only dictionary
// =============================================================================
//
// No released namespace holds a function or a nullable function yet, so the
// generic merge is exercised with a namespace the library does not know. The
// provider passes an unknown namespace through, which is also what lets a
// test dictionary reach the merge without exporting it.

type Announce = ((name: string) => string) | null;

interface TestNamespace {
  announce: Announce;
  format: (count: number) => string;
  label: string;
}

const TEST = "testOnly" as const;

/** Reads the test namespace and prints what each entry resolves to. */
function TestReader() {
  const s = useStrings(TEST as never) as unknown as TestNamespace;
  return (
    <dl>
      <dt>label</dt>
      <dd data-testid="label">{s.label}</dd>
      <dt>format</dt>
      <dd data-testid="format">{s.format(3)}</dd>
      <dt>announce</dt>
      <dd data-testid="announce">
        {s.announce === null ? "muted" : s.announce("a.txt")}
      </dd>
    </dl>
  );
}

/** Overrides for the test namespace, typed loosely on purpose. */
function testStrings(namespace: Partial<Record<keyof TestNamespace, unknown>>) {
  return { [TEST]: namespace } as unknown as StringsOverrides;
}

const OUTER = testStrings({
  announce: (name: string) => `${name} added.`,
  format: (count: number) => `${count} items`,
  label: "Outer label",
});

describe("strings merge", () => {
  it("passes an unknown namespace through untouched", () => {
    render(
      <StringsProvider strings={OUTER}>
        <TestReader />
      </StringsProvider>
    );

    expect(screen.getByTestId("label")).toHaveTextContent("Outer label");
    expect(screen.getByTestId("format")).toHaveTextContent("3 items");
    expect(screen.getByTestId("announce")).toHaveTextContent("a.txt added.");
  });

  it("inherits a parent's mute through an undefined override", () => {
    render(
      <StringsProvider strings={testStrings({ announce: null })}>
        <StringsProvider strings={OUTER}>
          <StringsProvider strings={testStrings({ announce: null })}>
            <StringsProvider
              strings={testStrings({ announce: undefined, label: "Inner" })}
            >
              <TestReader />
            </StringsProvider>
          </StringsProvider>
        </StringsProvider>
      </StringsProvider>
    );

    expect(screen.getByTestId("announce")).toHaveTextContent("muted");
    expect(screen.getByTestId("label")).toHaveTextContent("Inner");
    expect(screen.getByTestId("format")).toHaveTextContent("3 items");
  });

  it("lets a local callback re-enable an inherited mute", () => {
    render(
      <StringsProvider strings={OUTER}>
        <StringsProvider strings={testStrings({ announce: null })}>
          <StringsProvider
            strings={testStrings({
              announce: (name: string) => `SENTINEL ${name}`,
            })}
          >
            <TestReader />
          </StringsProvider>
        </StringsProvider>
      </StringsProvider>
    );

    expect(screen.getByTestId("announce")).toHaveTextContent("SENTINEL a.txt");
  });

  it("skips a null on a key that is not nullable, so the parent's string survives", () => {
    let seen: unknown;
    function Reader() {
      seen = useStrings("modal");
      return null;
    }
    // Untyped JSON, as a translation file would arrive: the types cannot stop it.
    const inner = JSON.parse(
      '{"modal":{"close":null,"footerClose":null}}'
    ) as StringsOverrides;
    render(
      <StringsProvider
        strings={{
          modal: { close: "Fermer", footerClose: "Fermer la fenêtre" },
        }}
      >
        <StringsProvider strings={inner}>
          <Reader />
        </StringsProvider>
      </StringsProvider>
    );

    expect(seen).toEqual({ close: "Fermer", footerClose: "Fermer la fenêtre" });
  });

  it("passes an unknown key in a known namespace through", () => {
    function Reader() {
      const s = useStrings("modal") as unknown as Record<string, string>;
      return <span data-testid="extra">{s.extra}</span>;
    }
    render(
      <StringsProvider
        strings={{ modal: { extra: "Extra" } } as unknown as StringsOverrides}
      >
        <Reader />
      </StringsProvider>
    );

    expect(screen.getByTestId("extra")).toHaveTextContent("Extra");
  });
});

// =============================================================================
// useStrings
// =============================================================================
describe("useStrings", () => {
  it("returns the English with no provider", () => {
    let seen: unknown;
    function Reader() {
      seen = useStrings("modal");
      return null;
    }
    render(<Reader />);

    expect(seen).toBe(defaultStrings.modal);
    expect(seen).toEqual({ close: "Close", footerClose: "Close" });
  });

  it("throws a named error when the namespace is missing", () => {
    function Reader() {
      useStrings("notANamespace" as never);
      return null;
    }
    // React logs the thrown render error; keep the output clean.
    const original = console.error;
    console.error = () => undefined;
    try {
      expect(() => render(<Reader />)).toThrow(
        "`strings.tsx` is older than this component: re-add `strings`"
      );
      expect(() => render(<Reader />)).toThrow('"notANamespace"');
    } finally {
      console.error = original;
    }
  });
});

// =============================================================================
// defaultStrings
// =============================================================================
describe("defaultStrings", () => {
  it("is frozen at both levels", () => {
    expect(Object.isFrozen(defaultStrings)).toBe(true);
    for (const namespace of Object.values(defaultStrings)) {
      expect(Object.isFrozen(namespace)).toBe(true);
    }
  });
});
