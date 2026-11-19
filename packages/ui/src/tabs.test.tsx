import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createContext, createRef, type ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  Tabs,
  TabsContent,
  TabsList,
  type TabsProps,
  TabsTrigger,
  TabsTriggerLabel,
} from "./tabs";

const CURRENT_ITEM_SOURCE = /const CURRENT_ITEM =\s*'([^']+)';/;

// =============================================================================
// Tabs
// =============================================================================
describe("Tabs", () => {
  it("renders with tabs and content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByRole("tab", { name: "Tab 1" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tab 2" })).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("has data-slot attributes", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );

    expect(screen.getByRole("tab", { name: "Tab 1" })).toHaveAttribute(
      "data-slot",
      "tabs-trigger"
    );
  });

  it("switches content when clicking a tab", async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Content 1")).toBeVisible();

    await user.click(screen.getByRole("tab", { name: "Tab 2" }));

    expect(screen.getByText("Content 2")).toBeVisible();
  });

  it("activates correct tab by default", () => {
    render(
      <Tabs defaultValue="tab2">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Content 2")).toBeVisible();
  });

  it("applies custom className to root", () => {
    render(
      <Tabs className="custom-class" defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    const root = screen
      .getByRole("tab", { name: "Tab 1" })
      .closest("[data-slot='tabs']");
    expect(root).toHaveClass("custom-class");
  });

  it("supports keyboard navigation between tabs", async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    );

    // Focus the first tab
    await user.click(screen.getByRole("tab", { name: "Tab 1" }));

    // Arrow right to next tab
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveFocus();
  });

  it("renders disabled tabs", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger disabled value="tab2">
            Tab 2
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByRole("tab", { name: "Tab 2" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
  });
});

// =============================================================================
// TabsList
// =============================================================================
describe("TabsList", () => {
  it("has data-slot attribute", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    expect(screen.getByRole("tablist")).toHaveAttribute(
      "data-slot",
      "tabs-list"
    );
  });

  it("applies custom className", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList className="custom-list-class">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    expect(screen.getByRole("tablist")).toHaveClass("custom-list-class");
  });
});

// =============================================================================
// TabsContent
// =============================================================================
describe("TabsContent", () => {
  it("has data-slot attribute", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content</TabsContent>
      </Tabs>
    );

    expect(screen.getByRole("tabpanel")).toHaveAttribute(
      "data-slot",
      "tabs-content"
    );
  });

  it("applies custom className", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent className="custom-panel" value="tab1">
          Content
        </TabsContent>
      </Tabs>
    );

    expect(screen.getByRole("tabpanel")).toHaveClass("custom-panel");
  });
});

// =============================================================================
// The active tab: Base UI's selection, the morphing pill and Reel's marker
// =============================================================================

/** Reel's own current-item selector, read from its source. */
const CURRENT_ITEM = (() => {
  const source = readFileSync(join(import.meta.dirname, "reel.tsx"), "utf-8");
  const match = source.match(CURRENT_ITEM_SOURCE);
  if (!match) {
    throw new Error("reel.tsx no longer declares CURRENT_ITEM as one string");
  }
  return match[1];
})();

/**
 * The triggers marked active by Base UI (`aria-selected`, `data-active`) and
 * the ones holding the morphing pill, by text. They must be the same one, or
 * none, and Reel's first match must be that very tab, or nothing. These
 * fixtures supply no additional markers. Read after mount effects: with no
 * `defaultValue`, Base UI's layout effect notifies the implicit default
 * before paint.
 */
function expectAgreement(expected: string[]) {
  const tabs = screen.getAllByRole("tab");
  const names = (pick: (tab: HTMLElement) => boolean) =>
    tabs.filter(pick).map((tab) => tab.textContent);
  expect({
    aria: names((tab) => tab.getAttribute("aria-selected") === "true"),
    active: names((tab) => tab.hasAttribute("data-active")),
    pill: names((tab) =>
      Boolean(tab.querySelector('[data-slot="tabs-morphing-pill"]'))
    ),
  }).toEqual({ aria: expected, active: expected, pill: expected });
  // These fixtures supply no additional markers.
  expect(document.querySelectorAll("[data-selected]")).toHaveLength(0);
  const selected = tabs.find(
    (tab) => tab.getAttribute("aria-selected") === "true"
  );
  expect(revealed()).toBe(selected ?? null);
}

/** What Reel would reveal in the list: the first current item. */
const revealed = () =>
  (document.querySelector('[role="tablist"]') as HTMLElement).querySelector(
    CURRENT_ITEM
  );

type Change = Parameters<NonNullable<TabsProps["onValueChange"]>>;

describe("TabsTrigger: Base UI's selection drives the pill (T-AGREE)", () => {
  it("(i) stays on the old tab when the handler cancels a click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        defaultValue="a"
        onValueChange={(...[, details]: Change) => details.cancel()}
      >
        <TabsList morphing>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    await user.click(screen.getByRole("tab", { name: "B" }));
    expectAgreement(["A"]);
  });

  it("(ii) marks nothing under a controlled null, even after a click", async () => {
    const user = userEvent.setup();
    render(
      <Tabs value={null}>
        <TabsList morphing>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expectAgreement([]);
    await user.click(screen.getByRole("tab", { name: "B" }));
    expectAgreement([]);
  });

  it("(iii) follows a controlled B → null → B", async () => {
    const user = userEvent.setup();
    const tree = (value: string | null) => (
      <Tabs value={value}>
        <TabsList morphing>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const { rerender } = render(tree("b"));
    expectAgreement(["B"]);
    // A click the parent ignores: the value stays B.
    await user.click(screen.getByRole("tab", { name: "C" }));
    expectAgreement(["B"]);
    rerender(tree(null));
    expectAgreement([]);
    rerender(tree("b"));
    expectAgreement(["B"]);
  });

  it("(iv) with no defaultValue, marks the tab valued 0 even when it is not first", () => {
    render(
      <Tabs>
        <TabsList morphing>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value={0}>Zero</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expectAgreement(["Zero"]);
  });

  it("(v) with no defaultValue and no tab 0, marks the first enabled tab", () => {
    render(
      <Tabs>
        <TabsList morphing>
          <TabsTrigger disabled value="a">
            A
          </TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
          <TabsTrigger value="c">C</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expectAgreement(["B"]);
  });

  it("(vi) with no defaultValue and a handler that cancels everything, still marks the first tab", () => {
    render(
      <Tabs onValueChange={(...[, details]: Change) => details.cancel()}>
        <TabsList morphing>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expectAgreement(["A"]);
  });

  it("never calls a function-valued tab value, and the pill follows it", async () => {
    const user = userEvent.setup();
    let calls = 0;
    function tabValue() {
      calls++;
      return "a";
    }
    render(
      <Tabs defaultValue="a">
        <TabsList morphing>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value={tabValue}>B</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    await user.click(screen.getByRole("tab", { name: "B" }));
    expectAgreement(["B"]);
    expect(calls).toBe(0);
  });

  it("never calls a function passed as defaultValue", () => {
    let calls = 0;
    function tabValue() {
      calls++;
      return "a";
    }
    render(
      <Tabs defaultValue={tabValue}>
        <TabsList morphing>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value={tabValue}>B</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expectAgreement(["B"]);
    expect(calls).toBe(0);
  });
});

/**
 * The same tab through Base UI's own primitive, for comparing what a
 * `render` prop produces: Keystone hands `render` to Base UI untouched.
 */
function PrimitiveTabs({ children }: { children: ReactNode }) {
  return (
    <BaseTabs.Root defaultValue="a">
      <BaseTabs.List>{children}</BaseTabs.List>
    </BaseTabs.Root>
  );
}

describe("TabsTrigger hands render to Base UI", () => {
  it("leaves Reel's first match on exactly the selected host, for every kind of trigger", () => {
    const Ctx = createContext("outside");
    const ref = createRef<HTMLButtonElement>();
    function fn() {
      return "f";
    }
    const tree = (value: BaseTabs.Tab.Value) => (
      <Tabs value={value}>
        <TabsList morphing scrollable>
          <TabsTrigger value="a">Plain</TabsTrigger>
          <TabsTrigger
            nativeButton={false}
            render={<a href="#b">Anchor</a>}
            value="b"
          />
          <TabsTrigger
            render={(props) => (
              <Ctx.Provider value="inside">
                <button {...props} />
              </Ctx.Provider>
            )}
            value="c"
          >
            Provider
          </TabsTrigger>
          <TabsTrigger
            render={(props) => (
              <button {...props}>
                <TabsTriggerLabel>Label</TabsTriggerLabel>
              </button>
            )}
            value="d"
          />
          <TabsTrigger ref={ref} value="e">
            Ref
          </TabsTrigger>
          <TabsTrigger value={fn}>Function</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const { rerender } = render(tree("a"));
    const cases: [BaseTabs.Tab.Value, string][] = [
      ["a", "Plain"],
      ["b", "Anchor"],
      ["c", "Provider"],
      ["d", "Label"],
      ["e", "Ref"],
      [fn, "Function"],
    ];
    for (const [value, name] of cases) {
      rerender(tree(value));
      const host = screen.getByRole("tab", { name });
      expect(host.getAttribute("aria-selected"), name).toBe("true");
      expect(revealed(), name).toBe(host);
    }
    expect(ref.current).toBe(screen.getByRole("tab", { name: "Ref" }));
    // Cleared: nothing is current.
    rerender(tree(null));
    expect(revealed()).toBeNull();
  });

  it("delivers a click to the element's and the trigger's handlers, as Base UI does", async () => {
    const user = userEvent.setup();
    const run = async (which: "ours" | "base") => {
      const events: string[] = [];
      const element = (
        <a
          href="#b"
          onClick={(event) => {
            event.preventDefault();
            events.push("element");
          }}
        >
          Billing
        </a>
      );
      const onClick = () => {
        events.push("trigger");
      };
      const { unmount } = render(
        which === "ours" ? (
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger value="a">A</TabsTrigger>
              <TabsTrigger
                nativeButton={false}
                onClick={onClick}
                render={element}
                value="b"
              />
            </TabsList>
          </Tabs>
        ) : (
          <PrimitiveTabs>
            <BaseTabs.Tab value="a">A</BaseTabs.Tab>
            <BaseTabs.Tab
              nativeButton={false}
              onClick={onClick}
              render={element}
              value="b"
            />
          </PrimitiveTabs>
        )
      );
      const b = screen.getByRole("tab", { name: "Billing" });
      await user.click(b);
      const result = {
        events: [...events].sort(),
        tag: b.tagName,
        selected: b.getAttribute("aria-selected"),
        revealed: revealed() === b,
      };
      unmount();
      return result;
    };
    const ours = await run("ours");
    expect(ours).toEqual({
      events: ["element", "trigger"],
      tag: "A",
      selected: "true",
      revealed: true,
    });
    expect(ours).toEqual(await run("base"));
  });

  it("keeps a render element's own children, as Base UI does", () => {
    const { unmount } = render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger
            nativeButton={false}
            render={<a href="#a">Account</a>}
            value="a"
          />
          <TabsTrigger
            nativeButton={false}
            render={<a href="#b">Billing</a>}
            value="b"
          >
            Fallback
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const ours = screen.getAllByRole("tab").map((tab) => tab.textContent);
    expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(ours).toEqual(["Account", "Billing"]);
    unmount();
    render(
      <PrimitiveTabs>
        <BaseTabs.Tab
          nativeButton={false}
          render={<a href="#a">Account</a>}
          value="a"
        />
        <BaseTabs.Tab
          nativeButton={false}
          render={<a href="#b">Billing</a>}
          value="b"
        >
          Fallback
        </BaseTabs.Tab>
      </PrimitiveTabs>
    );
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(
      ours
    );
  });

  it("leaves a provider a render callback wraps the host in unmarked", async () => {
    const user = userEvent.setup();
    const Ctx = createContext("outside");
    render(
      <Tabs defaultValue="a">
        <TabsList morphing scrollable>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger
            render={(props) => (
              <Ctx.Provider value="inside">
                <button {...props} />
              </Ctx.Provider>
            )}
            value="b"
          >
            B
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    await user.click(screen.getByRole("tab", { name: "B" }));
    const b = screen.getByRole("tab", { name: "B" });
    expect(b.tagName).toBe("BUTTON");
    expectAgreement(["B"]);
    expect(revealed()).toBe(b);
  });

  it("expands a label a render callback adds, on the active tab only", () => {
    render(
      <Tabs defaultValue="b">
        <TabsList morphing>
          {(["a", "b"] as const).map((v) => (
            <TabsTrigger
              key={v}
              render={(props) => (
                <button {...props}>
                  <TabsTriggerLabel>{`Label ${v}`}</TabsTriggerLabel>
                </button>
              )}
              value={v}
            />
          ))}
        </TabsList>
      </Tabs>
    );
    const label = (v: string) =>
      (
        screen
          .getByText(`Label ${v}`)
          .closest('[data-slot="tabs-trigger-label"]') as HTMLElement
      ).style;
    expect([label("b").width, label("b").opacity]).toEqual(["auto", "1"]);
    expect([label("a").width, label("a").opacity]).toEqual(["0px", "0"]);
  });

  it("attaches a cleanup ref once and runs its cleanup once, as Base UI does", () => {
    const run = (Trigger: "ours" | "base") => {
      const events: string[] = [];
      const objectRef = createRef<HTMLButtonElement>();
      const callbackRef = (node: HTMLElement | null) => {
        events.push(node ? "attach" : "called-with-null");
        return () => {
          events.push("cleanup");
        };
      };
      const tree = (count: number) =>
        Trigger === "ours" ? (
          <Tabs defaultValue="a">
            <TabsList>
              <TabsTrigger
                data-count={count}
                nativeButton={false}
                ref={objectRef}
                render={<a href="#a" ref={callbackRef} />}
                value="a"
              >
                A
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : (
          <PrimitiveTabs>
            <BaseTabs.Tab
              data-count={count}
              nativeButton={false}
              ref={objectRef}
              render={<a href="#a" ref={callbackRef} />}
              value="a"
            >
              A
            </BaseTabs.Tab>
          </PrimitiveTabs>
        );
      const { rerender, unmount } = render(tree(1));
      const node = screen.getByRole("tab", { name: "A" });
      const sameNode = objectRef.current === node;
      rerender(tree(2));
      const afterRerender = [...events];
      unmount();
      return {
        afterRerender,
        afterUnmount: events,
        sameNode,
        cleared: objectRef.current,
      };
    };
    const ours = run("ours");
    expect(ours).toEqual({
      afterRerender: ["attach"],
      afterUnmount: ["attach", "cleanup"],
      sameNode: true,
      cleared: null,
    });
    expect(ours).toEqual(run("base"));
  });

  it("renders an element that arrives from a Server Component", () => {
    // The Flight client hands a lazy wrapper in place of an element created
    // in a Server Component; it has no props until it is resolved.
    const element = <a href="#account" />;
    const lazy = {
      $$typeof: Symbol.for("react.lazy"),
      _payload: element,
      _init: (payload: typeof element) => payload,
    } as unknown as typeof element;
    render(
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger nativeButton={false} render={lazy} value="account">
            Account
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const tab = screen.getByRole("tab", { name: "Account" });
    expect(tab.tagName).toBe("A");
    expect(tab).toHaveAttribute("href", "#account");
    expect(tab).toHaveAttribute("aria-selected", "true");
    expect(revealed()).toBe(tab);
  });
});
