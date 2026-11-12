import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Toolbar } from "@base-ui/react/toolbar";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  type ComponentProps,
  type ComponentType,
  createRef,
  lazy,
  memo,
  type ReactNode,
  Suspense,
  useState,
} from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToReadableStream, renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Tag, TagRemove } from "./tag";
import { TagGroup, TagGroupItem } from "./tag-group";

const noop = () => undefined;

/**
 * A `<button>` opened before an earlier one closed. Tested on the HTML string:
 * the HTML parser repairs nested buttons, so the parsed DOM cannot show it.
 */
const NESTED_BUTTON = /<button\b[^>]*>(?:(?!<\/button>)[\s\S])*?<button\b/;

/** Runs `fn` and returns what React logged through console.error. */
async function consoleErrors(fn: () => unknown): Promise<string[]> {
  const spy = vi.spyOn(console, "error").mockImplementation(noop);
  try {
    await fn();
    return spy.mock.calls.map((call) => call.map(String).join(" "));
  } finally {
    spy.mockRestore();
  }
}

const NESTING_WARNING = /cannot be a descendant of|cannot contain a nested/;

/**
 * Streams `ui` with `renderToReadableStream`, running `whileStreaming` after
 * the render has started (the shell is out, a suspended part is not).
 */
async function streamToString(
  ui: ReactNode,
  whileStreaming: () => void = noop
): Promise<string> {
  const errors: unknown[] = [];
  const stream = await renderToReadableStream(ui, {
    onError: (error) => {
      errors.push(error);
    },
  });
  whileStreaming();
  await stream.allReady;
  const html = await new Response(stream).text();
  expect(errors).toEqual([]);
  return html;
}

/**
 * Puts streamed HTML into the document, runs React's inline scripts (which
 * move late segments into place, as a browser would), then hydrates `ui`.
 * Returns the host and every hydration error and console error.
 */
/**
 * React warns about this only because this test runs its server renderer and
 * its client renderer in one JS realm, sharing one context object. A server
 * and a browser never share a realm.
 */
const ONE_REALM_ARTIFACT = /Detected multiple renderers concurrently rendering/;

const hydrated: { host: HTMLElement; unmount: () => void }[] = [];
afterEach(() => {
  for (const { host, unmount } of hydrated.splice(0)) {
    act(unmount);
    host.remove();
  }
});

async function hydrateStreamed(html: string, ui: ReactNode) {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  for (const script of Array.from(host.querySelectorAll("script"))) {
    // React's own inline reveal scripts, run in global scope as a browser does.
    // biome-ignore lint/security/noGlobalEval: React's own reveal scripts
    const run = globalThis.eval;
    run(script.textContent ?? "");
  }
  await new Promise((resolve) => setTimeout(resolve, 50));
  const errors: unknown[] = [];
  const logged = await consoleErrors(async () => {
    await act(async () => {
      const root = hydrateRoot(host, ui, {
        onRecoverableError: (error) => errors.push(error),
      });
      hydrated.push({ host, unmount: () => root.unmount() });
    });
  });
  return {
    host,
    errors: [...errors.map(String), ...logged].filter(
      (e) => !ONE_REALM_ARTIFACT.test(e)
    ),
  };
}

function deferredModule<T>() {
  let load!: () => void;
  const Lazy = lazy(
    () =>
      new Promise<{ default: ComponentType<T> }>((resolve) => {
        load = () => resolve({ default: TagRemove as ComponentType<T> });
      })
  );
  return { Lazy, load: () => load() };
}

// ---------------------------------------------------------------------------
// The forms that must not change
// ---------------------------------------------------------------------------

describe("Tag without remove (unchanged)", () => {
  it("renders today's single button for no remove, null, undefined and false", () => {
    const plain = renderToString(<Tag value="react">React</Tag>);
    expect(plain).toMatchInlineSnapshot(
      `"<button type="button" tabindex="0" aria-pressed="false" data-slot="tag" class="inline-flex h-6 min-w-0 max-w-full cursor-pointer touch-manipulation select-none items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full bg-secondary px-2.5 font-medium text-secondary-foreground text-xs transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 has-[[data-slot=avatar]]:pl-1 aria-pressed:bg-primary/10 aria-pressed:text-primary dark:aria-pressed:bg-primary/15 [&amp;_svg:not([class*=&#x27;size-&#x27;])]:size-3 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0"><span class="min-w-0 truncate">React</span></button>"`
    );
    for (const remove of [null, undefined, false]) {
      expect(
        renderToString(
          <Tag remove={remove} value="react">
            React
          </Tag>
        )
      ).toBe(plain);
    }
  });

  it("keeps the child form as on the base: TagRemove nested in the toggle", async () => {
    const html = renderToString(
      <Tag value="react">
        React
        <TagRemove />
      </Tag>
    );
    expect(html).toMatchInlineSnapshot(
      `"<button type="button" tabindex="0" aria-pressed="false" data-slot="tag" class="inline-flex h-6 min-w-0 max-w-full cursor-pointer touch-manipulation select-none items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full bg-secondary px-2.5 font-medium text-secondary-foreground text-xs transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 has-[[data-slot=avatar]]:pl-1 aria-pressed:bg-primary/10 aria-pressed:text-primary dark:aria-pressed:bg-primary/15 [&amp;_svg:not([class*=&#x27;size-&#x27;])]:size-3 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0"><span class="min-w-0 truncate">React</span><button aria-label="Remove" class="relative -my-px -ms-0.5 -me-1.5 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-current/60 transition-[color] before:absolute before:-inset-3.5 before:content-[&#x27;&#x27;] hover:text-current focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2" data-slot="tag-remove" type="button"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button></button>"`
    );

    // Behaviour as on the base: a click on the nested X bubbles to the toggle.
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onPressedChange = vi.fn();
    await consoleErrors(() =>
      render(
        <Tag onPressedChange={onPressedChange} value="react">
          React
          <TagRemove onClick={onRemove} />
        </Tag>
      )
    );
    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onPressedChange).toHaveBeenCalledTimes(1);
  });

  it("keeps a TagGroupItem without onRemove a single button", () => {
    const html = renderToString(
      <TagGroup>
        <TagGroupItem value="a">Alpha</TagGroupItem>
      </TagGroup>
    );
    expect(html).toMatchInlineSnapshot(
      `"<div data-orientation="horizontal" role="group" data-slot="tag-group" class="flex flex-wrap gap-1.5"><button type="button" aria-disabled="false" tabindex="-1" aria-pressed="false" data-slot="tag-group-item" class="inline-flex h-6 min-w-0 max-w-full cursor-pointer touch-manipulation select-none items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full bg-secondary px-2.5 font-medium text-secondary-foreground text-xs transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 has-[[data-slot=avatar]]:pl-1 aria-pressed:bg-primary/10 aria-pressed:text-primary dark:aria-pressed:bg-primary/15 [&amp;_svg:not([class*=&#x27;size-&#x27;])]:size-3 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0"><span class="min-w-0 truncate">Alpha</span></button></div>"`
    );
  });
});

// ---------------------------------------------------------------------------
// The remove prop
// ---------------------------------------------------------------------------

describe("Tag with remove", () => {
  it("renders the toggle and the remove control as siblings in the chip", async () => {
    let container!: HTMLElement;
    const errors = await consoleErrors(() => {
      ({ container } = render(
        <Tag remove={<TagRemove />} value="react">
          React
        </Tag>
      ));
    });
    expect(errors.filter((e) => NESTING_WARNING.test(e))).toEqual([]);
    expect(container.querySelectorAll("button button")).toHaveLength(0);
    const chip = container.firstElementChild as HTMLElement;
    expect(chip.tagName).toBe("SPAN");
    expect(chip.getAttribute("data-slot")).toBe("tag");
    const toggle = screen.getByRole("button", { name: "React" });
    const remove = screen.getByRole("button", { name: "Remove" });
    expect(toggle.getAttribute("data-slot")).toBe("tag-toggle");
    expect(toggle.parentElement).toBe(chip);
    expect(toggle.nextElementSibling).toBe(remove);
  });

  it("server-renders sibling markup and hydrates without errors", async () => {
    const ui = (
      <Tag remove={<TagRemove />} value="react">
        React
      </Tag>
    );
    const html = renderToString(ui);
    expect(NESTED_BUTTON.test(html)).toBe(false);
    const { host, errors } = await hydrateStreamed(html, ui);
    expect(errors).toEqual([]);
    expect(host.querySelector('[data-slot="tag-toggle"]')).not.toBeNull();
  });

  it("streams sibling markup while a lazy remove control is still loading, and hydrates", async () => {
    const { Lazy, load } = deferredModule();
    const ui = (
      <Suspense fallback={<i>loading</i>}>
        <Tag remove={<Lazy />} value="react">
          React
        </Tag>
      </Suspense>
    );
    const html = await streamToString(ui, load);
    expect(html).toContain('data-slot="tag-remove"');
    expect(NESTED_BUTTON.test(html)).toBe(false);
    const { host, errors } = await hydrateStreamed(html, ui);
    expect(errors).toEqual([]);
    const toggle = host.querySelector('[data-slot="tag-toggle"]');
    expect(toggle?.nextElementSibling?.getAttribute("data-slot")).toBe(
      "tag-remove"
    );
  });

  it("streams sibling markup for a server-component style client reference", async () => {
    // From a server component, TagRemove arrives as a lazy client reference
    // whose module has already loaded; nothing about it is inspected.
    const ClientRemove = lazy(async () => ({ default: TagRemove }));
    const ui = (
      <Tag remove={<ClientRemove aria-label="Remove React" />} value="react">
        React
      </Tag>
    );
    const html = await streamToString(ui);
    expect(NESTED_BUTTON.test(html)).toBe(false);
    const { host, errors } = await hydrateStreamed(html, ui);
    expect(errors).toEqual([]);
    expect(
      host.querySelector('[aria-label="Remove React"]')?.previousElementSibling
    ).toBe(host.querySelector('[data-slot="tag-toggle"]'));
  });

  it("toggles on click, and a click or key on the X removes without toggling", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    const onRemove = vi.fn();
    render(
      <Tag
        onPressedChange={onPressedChange}
        remove={<TagRemove onClick={onRemove} />}
        value="react"
      >
        React
      </Tag>
    );
    const toggle = screen.getByRole("button", { name: "React" });
    await user.click(toggle);
    expect(onPressedChange).toHaveBeenCalledTimes(1);
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    const remove = screen.getByRole("button", { name: "Remove" });
    await user.click(remove);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onRemove).toHaveBeenCalledTimes(3);
    expect(onPressedChange).toHaveBeenCalledTimes(1);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("tabs from the toggle to its X", async () => {
    const user = userEvent.setup();
    render(
      <Tag remove={<TagRemove />} value="react">
        React
      </Tag>
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "React" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Remove" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "React" })).toHaveFocus();
  });

  it("puts className, style, dir and hidden on the chip; ref, aria, data and handlers on the toggle", () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(
      <Tag
        aria-describedby="hint"
        className="custom-tag"
        data-testid="t"
        dir="rtl"
        id="tag-id"
        onClick={onClick}
        ref={ref}
        remove={<TagRemove className="custom-remove" />}
        style={{ marginInlineEnd: 3 }}
        value="react"
      >
        React
      </Tag>
    );
    const toggle = screen.getByTestId("t");
    const chip = toggle.parentElement as HTMLElement;
    expect(chip).toHaveClass("custom-tag");
    expect(chip.style.marginInlineEnd).toBe("3px");
    expect(chip.getAttribute("dir")).toBe("rtl");
    expect(toggle).not.toHaveClass("custom-tag");
    expect(toggle.getAttribute("style")).toBeNull();
    expect(toggle).toHaveAttribute("aria-describedby", "hint");
    expect(toggle).toHaveAttribute("id", "tag-id");
    expect(ref.current).toBe(toggle);
    fireEvent.click(toggle);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Remove" })).toHaveClass(
      "custom-remove"
    );
  });

  it("hides the whole chip, X included, with the hidden attribute", () => {
    render(
      <Tag data-testid="t" hidden remove={<TagRemove />} value="react">
        React
      </Tag>
    );
    const chip = screen.getByTestId("t").parentElement as HTMLElement;
    expect(chip).toHaveAttribute("hidden");
    expect(chip).toContainElement(
      screen.getByRole("button", { hidden: true, name: "Remove" })
    );
  });

  it("mirrors pressed and disabled state onto the chip and resolves function className and style", async () => {
    const user = userEvent.setup();
    render(
      <Tag
        className={(state) => (state.pressed ? "is-on" : "is-off")}
        data-testid="t"
        remove={<TagRemove />}
        style={(state) => ({ opacity: state.pressed ? 0.9 : 0.8 })}
        value="react"
      >
        React
      </Tag>
    );
    const toggle = screen.getByTestId("t");
    const chip = toggle.parentElement as HTMLElement;
    expect(chip).toHaveClass("is-off");
    expect(chip).not.toHaveAttribute("data-pressed");
    expect(chip.style.opacity).toBe("0.8");
    await user.click(toggle);
    expect(chip).toHaveClass("is-on");
    expect(chip).toHaveAttribute("data-pressed");
    expect(chip.style.opacity).toBe("0.9");
  });

  it("applies a consumer render to the toggle", () => {
    render(
      <Tag
        nativeButton={false}
        remove={<TagRemove />}
        render={<span data-custom="" />}
        value="react"
      >
        React
      </Tag>
    );
    const toggle = document.querySelector("[data-custom]") as HTMLElement;
    expect(toggle.tagName).toBe("SPAN");
    expect(toggle.getAttribute("data-slot")).toBe("tag-toggle");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle.nextElementSibling?.getAttribute("data-slot")).toBe(
      "tag-remove"
    );
  });
});

// ---------------------------------------------------------------------------
// Codex finding 2 / second reviewer finding 3: remove switched at runtime
// ---------------------------------------------------------------------------

function Switchable({
  initial,
  pressed,
}: {
  initial: boolean;
  pressed?: boolean;
}) {
  const [removable, setRemovable] = useState(initial);
  return (
    <>
      <button onClick={() => setRemovable((r) => !r)} type="button">
        switch
      </button>
      <Tag
        data-testid="t"
        pressed={pressed}
        remove={removable ? <TagRemove /> : undefined}
        value="react"
      >
        React
      </Tag>
    </>
  );
}

describe("remove switched at runtime", () => {
  for (const initial of [false, true]) {
    it(`keeps uncontrolled pressed state when remove goes ${initial ? "away" : "on"}`, async () => {
      const user = userEvent.setup();
      render(<Switchable initial={initial} />);
      await user.click(screen.getByTestId("t"));
      expect(screen.getByTestId("t")).toHaveAttribute("aria-pressed", "true");

      await user.click(screen.getByRole("button", { name: "switch" }));
      const live = screen.getByTestId("t");
      // The shape really switched...
      expect(live.parentElement?.getAttribute("data-slot") === "tag").toBe(
        !initial
      );
      // ...and the pressed state survived it.
      expect(live).toHaveAttribute("aria-pressed", "true");
    });
  }

  it("keeps focus on the toggle when remove appears while it is focused", () => {
    function Harness() {
      const [removable, setRemovable] = useState(false);
      return (
        <Tag
          data-testid="t"
          onKeyDown={(event) => {
            if (event.key === "r") {
              setRemovable((r) => !r);
            }
          }}
          remove={removable ? <TagRemove /> : undefined}
          value="react"
        >
          React
        </Tag>
      );
    }
    render(<Harness />);
    const before = screen.getByTestId("t");
    act(() => before.focus());
    act(() => {
      fireEvent.keyDown(before, { key: "r" });
    });
    const during = screen.getByTestId("t");
    expect(during.parentElement?.getAttribute("data-slot")).toBe("tag");
    expect(during).toHaveFocus();
    act(() => {
      fireEvent.keyDown(during, { key: "r" });
    });
    expect(screen.getByTestId("t")).toHaveFocus();
  });

  it("follows a controlled pressed prop in both shapes", () => {
    const { rerender } = render(<Switchable initial={false} pressed />);
    expect(screen.getByTestId("t")).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "switch" }));
    expect(screen.getByTestId("t")).toHaveAttribute("aria-pressed", "true");
    rerender(<Switchable initial={false} pressed={false} />);
    expect(screen.getByTestId("t")).toHaveAttribute("aria-pressed", "false");
  });

  it("points the consumer ref at the live toggle after a switch", () => {
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(
      <Tag data-testid="t" ref={ref} value="react">
        React
      </Tag>
    );
    expect(ref.current).toBe(screen.getByTestId("t"));
    rerender(
      <Tag data-testid="t" ref={ref} remove={<TagRemove />} value="react">
        React
      </Tag>
    );
    expect(ref.current).toBe(screen.getByTestId("t"));
    expect(ref.current?.isConnected).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Codex finding 3: the toggle's effective disabled state rules the X
// ---------------------------------------------------------------------------

const WrappedRemove = (props: { onClick?: () => void }) => (
  <TagRemove {...props} />
);
const MemoRemove = memo(TagRemove);

describe("disabled", () => {
  it("disables the X of a disabled Tag, even when the X says disabled={false}", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Tag
        disabled
        remove={<TagRemove disabled={false} onClick={onRemove} />}
        value="react"
      >
        React
      </Tag>
    );
    const remove = screen.getByRole("button", { name: "Remove" });
    expect(remove).toBeDisabled();
    expect(remove.parentElement).toHaveAttribute("data-disabled");
    await user.tab();
    expect(remove).not.toHaveFocus();
    fireEvent.click(remove);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("disables any TagRemove composition: fragment, memo, wrapper component, lazy", async () => {
    const LoadedLazy = lazy(async () => ({ default: TagRemove }));
    const removes: [string, ReactNode][] = [
      [
        "fragment",
        <>
          <TagRemove />
        </>,
      ],
      ["memo", <MemoRemove key="m" />],
      ["wrapper", <WrappedRemove key="w" />],
      ["lazy", <LoadedLazy key="l" />],
    ];
    await act(async () => {
      render(
        <Suspense fallback={null}>
          {removes.map(([name, remove]) => (
            <Tag disabled key={name} remove={remove} value={name}>
              {name}
            </Tag>
          ))}
        </Suspense>
      );
      await Promise.resolve();
    });
    await screen.findAllByRole("button", { hidden: true, name: "Remove" });
    const xs = screen.getAllByRole("button", { name: "Remove" });
    expect(xs).toHaveLength(4);
    for (const x of xs) {
      expect(x).toBeDisabled();
    }
  });

  it("disables the X for a disabled item, a disabled group and a disabled Toolbar", () => {
    render(
      <>
        <TagGroup onRemove={noop}>
          <TagGroupItem disabled value="a">
            Alpha
          </TagGroupItem>
          <TagGroupItem value="b">Beta</TagGroupItem>
        </TagGroup>
        <TagGroup disabled onRemove={noop}>
          <TagGroupItem value="c">Gamma</TagGroupItem>
        </TagGroup>
        <Toolbar.Root disabled>
          <TagGroup onRemove={noop}>
            <TagGroupItem value="d">Delta</TagGroupItem>
          </TagGroup>
        </Toolbar.Root>
      </>
    );
    const removes = screen.getAllByRole("button", { name: "Remove" });
    expect(removes.map((r) => (r as HTMLButtonElement).disabled)).toEqual([
      true,
      false,
      true,
      true,
    ]);
  });
});

// ---------------------------------------------------------------------------
// TagGroupItem
// ---------------------------------------------------------------------------

describe("TagGroupItem with onRemove", () => {
  it("renders sibling buttons in a chip named tag-group-item, with no nesting warning", async () => {
    let container!: HTMLElement;
    const errors = await consoleErrors(() => {
      ({ container } = render(
        <TagGroup defaultValue={["a"]} onRemove={noop}>
          <TagGroupItem className="custom" value="a">
            Alpha
          </TagGroupItem>
          <TagGroupItem value="b">Beta</TagGroupItem>
        </TagGroup>
      ));
    });
    expect(errors.filter((e) => NESTING_WARNING.test(e))).toEqual([]);
    expect(container.querySelectorAll("button button")).toHaveLength(0);
    const toggle = screen.getByRole("button", { name: "Alpha" });
    const chip = toggle.parentElement as HTMLElement;
    expect(chip.getAttribute("data-slot")).toBe("tag-group-item");
    expect(chip).toHaveClass("custom");
    expect(chip).toHaveAttribute("data-pressed");
    expect(toggle.getAttribute("data-slot")).toBe("tag-toggle");
    expect(toggle.nextElementSibling?.getAttribute("data-slot")).toBe(
      "tag-remove"
    );
  });

  it("removes by click and keyboard without toggling", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onValueChange = vi.fn();
    render(
      <TagGroup multiple onRemove={onRemove} onValueChange={onValueChange}>
        <TagGroupItem value="a">Alpha</TagGroupItem>
        <TagGroupItem value="b">Beta</TagGroupItem>
      </TagGroup>
    );
    const removes = screen.getAllByRole("button", { name: "Remove" });
    await user.click(removes[1] as HTMLElement);
    expect(onRemove).toHaveBeenLastCalledWith("b");
    (removes[0] as HTMLElement).focus();
    await user.keyboard("{Enter}");
    expect(onRemove).toHaveBeenLastCalledWith("a");
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Alpha" }));
    expect(onValueChange).toHaveBeenCalledWith(["a"], expect.anything());
  });

  it("keeps the group's pressed value when onRemove is switched on and off", () => {
    function Harness() {
      const [editing, setEditing] = useState(false);
      return (
        <>
          <button onClick={() => setEditing((e) => !e)} type="button">
            edit
          </button>
          <TagGroup defaultValue={["b"]} onRemove={editing ? noop : undefined}>
            <TagGroupItem value="a">Alpha</TagGroupItem>
            <TagGroupItem value="b">Beta</TagGroupItem>
          </TagGroup>
        </>
      );
    }
    render(<Harness />);
    const pressed = () =>
      ["Alpha", "Beta"].map((name) =>
        screen.getByRole("button", { name }).getAttribute("aria-pressed")
      );
    expect(pressed()).toEqual(["false", "true"]);
    fireEvent.click(screen.getByRole("button", { name: "edit" }));
    expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(2);
    expect(pressed()).toEqual(["false", "true"]);
    fireEvent.click(screen.getByRole("button", { name: "edit" }));
    expect(screen.queryAllByRole("button", { name: "Remove" })).toHaveLength(0);
    expect(pressed()).toEqual(["false", "true"]);
  });

  it("Shift+Tab from an X goes to its own toggle", async () => {
    const user = userEvent.setup();
    render(
      <TagGroup onRemove={noop}>
        <TagGroupItem value="a">Alpha</TagGroupItem>
        <TagGroupItem value="b">Beta</TagGroupItem>
        <TagGroupItem value="c">Gamma</TagGroupItem>
      </TagGroup>
    );
    const removes = screen.getAllByRole("button", { name: "Remove" });
    act(() => (removes[2] as HTMLElement).focus());
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Gamma" })).toHaveFocus();
  });
});

// ---------------------------------------------------------------------------
// Keyboard from an X in a TagGroup, against the base behaviour as oracle
// ---------------------------------------------------------------------------

const GREEK = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"] as const;

/**
 * The same group in two forms. "child" is the old form (TagRemove nested in
 * each item, as on the base), whose keyboard behaviour is the reference;
 * "prop" is `onRemove`, which now renders each X beside its toggle. Gamma is
 * disabled in both.
 */
function GreekGroup({
  form,
  ...props
}: { form: "child" | "prop" } & Omit<
  ComponentProps<typeof TagGroup>,
  "children"
>) {
  return (
    <TagGroup onRemove={form === "prop" ? noop : undefined} {...props}>
      {GREEK.map((label) => (
        <TagGroupItem disabled={label === "Gamma"} key={label} value={label}>
          {label}
          {form === "child" && <TagRemove />}
        </TagGroupItem>
      ))}
    </TagGroup>
  );
}

function itemParts(label: string) {
  const item = Array.from(
    document.querySelectorAll<HTMLElement>('[data-slot="tag-group-item"]')
  ).find((el) => el.textContent === label) as HTMLElement;
  const toggle = item.matches("button")
    ? item
    : (item.querySelector('[data-slot="tag-toggle"]') as HTMLElement);
  const x = item.querySelector('[data-slot="tag-remove"]') as HTMLElement;
  return { toggle, x };
}

/** "x:Beta" or "toggle:Beta": what has focus, and in which item. */
function focusedPart() {
  const active = document.activeElement as HTMLElement;
  const item = active.closest('[data-slot="tag-group-item"]');
  const part = active.dataset.slot === "tag-remove" ? "x" : "toggle";
  return `${part}:${item?.textContent ?? active.tagName}`;
}

type Wrap = (group: ReactNode) => ReactNode;

/** Focus Alpha (the group's current item), then `from`'s X, then press `key`. */
async function pressOnX(
  form: "child" | "prop",
  groupProps: Omit<ComponentProps<typeof TagGroup>, "children">,
  wrap: Wrap,
  from: string,
  key: string
) {
  const user = userEvent.setup();
  let unmount!: () => void;
  await consoleErrors(() => {
    ({ unmount } = render(
      <>{wrap(<GreekGroup form={form} {...groupProps} />)}</>
    ));
  });
  act(() => itemParts("Alpha").toggle.focus());
  act(() => itemParts(from).x.focus());
  await user.keyboard(key);
  // Base UI moves focus in a microtask.
  await act(async () => {
    await Promise.resolve();
  });
  const result = focusedPart();
  unmount();
  return result;
}

const SCENARIOS: [
  string,
  Omit<ComponentProps<typeof TagGroup>, "children">,
  Wrap,
  [string, string][],
][] = [
  [
    "horizontal",
    {},
    (g) => g,
    [
      ["Beta", "{ArrowRight}"],
      ["Delta", "{ArrowLeft}"],
      ["Delta", "{Home}"],
      ["Beta", "{End}"],
      ["Epsilon", "{ArrowRight}"],
      ["Alpha", "{ArrowLeft}"],
      ["Delta", "{Shift>}{Tab}{/Shift}"],
      ["Beta", "{ArrowDown}"],
    ],
  ],
  [
    "vertical",
    { orientation: "vertical" },
    (g) => g,
    [
      ["Beta", "{ArrowDown}"],
      ["Delta", "{ArrowUp}"],
      ["Beta", "{ArrowRight}"],
    ],
  ],
  [
    "rtl",
    {},
    (g) => (
      <DirectionProvider direction="rtl">
        <div dir="rtl">{g}</div>
      </DirectionProvider>
    ),
    [
      ["Beta", "{ArrowLeft}"],
      ["Delta", "{ArrowRight}"],
    ],
  ],
  [
    "no loop",
    { loopFocus: false },
    (g) => g,
    [
      ["Delta", "{ArrowRight}"],
      ["Delta", "{ArrowLeft}"],
    ],
  ],
  [
    "toolbar",
    {},
    (g) => <Toolbar.Root>{g}</Toolbar.Root>,
    [
      ["Beta", "{ArrowRight}"],
      ["Delta", "{ArrowLeft}"],
    ],
  ],
];

describe("keys pressed on an X in a TagGroup act from its own toggle, as when it was nested", () => {
  for (const [name, groupProps, wrap, presses] of SCENARIOS) {
    for (const [from, key] of presses) {
      it(`${name}: ${key} on ${from}'s X`, async () => {
        const reference = await pressOnX("child", groupProps, wrap, from, key);
        const actual = await pressOnX("prop", groupProps, wrap, from, key);
        expect(actual).toBe(reference);
      });
    }
  }

  // The one difference: when the group does not move (no loop, at either
  // end), focus is left on the X's own toggle, where the nested X kept it.
  for (const [from, key] of [
    ["Epsilon", "{ArrowRight}"],
    ["Alpha", "{ArrowLeft}"],
  ] as const) {
    it(`no loop: ${key} on ${from}'s X leaves focus on its toggle`, async () => {
      const args = [
        { loopFocus: false },
        (g: ReactNode) => g,
        from,
        key,
      ] as const;
      expect(await pressOnX("child", ...args)).toBe(`x:${from}`);
      expect(await pressOnX("prop", ...args)).toBe(`toggle:${from}`);
    });
  }
});
