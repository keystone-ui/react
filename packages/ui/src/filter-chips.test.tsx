import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Field } from "@base-ui/react/field";
import { Fieldset } from "@base-ui/react/fieldset";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { flushSync } from "react-dom";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  FilterChip,
  type FilterChipState,
  FilterChips,
  type FilterChipsChangeEventDetails,
  type FilterChipsRenderProp,
  type FilterChipsState,
} from "./filter-chips";

const OUTSIDE_ROW = /FilterChips/;
const HOVER_OR_PRESS = /(^|:)(hover|active):|group-hover/;

let errorSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
});
afterEach(() => {
  errorSpy.mockRestore();
  warnSpy.mockRestore();
});

const messages = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls.map((call: unknown[]) => String(call[0]));

const chip = (name: string) =>
  screen
    .getAllByRole("radio")
    .find((el) => el.textContent?.startsWith(name)) as HTMLElement;

const checkedValues = () =>
  screen
    .getAllByRole("radio")
    .filter((el) => el.getAttribute("aria-checked") === "true")
    .map((el) => el.textContent);

const tabStops = () =>
  screen
    .getAllByRole("radio")
    .filter((el) => el.getAttribute("tabindex") === "0")
    .map((el) => el.textContent);

/** Lets observers, microtasks and React settle. */
const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

// Handlers hoisted so the rows below pass stable references.
const cancelChange = (_value: string, details: FilterChipsChangeEventDetails) =>
  details.cancel();
const ignoreChange = () => undefined;
const functionStyle = () => ({});
const formatNone = (n: number) => (n === 0 ? "none" : `${n}+`);
const formatZero = () => "0";
const rootStates: FilterChipsState[] = [];
const chipStates: FilterChipState[] = [];
const recordRoot = (state: FilterChipsState) => {
  rootStates.push(state);
  return "root-class";
};
const recordChip = (state: FilterChipState) => {
  chipStates.push(state);
  return "chip-class";
};
const recordRender = (
  props: React.HTMLAttributes<HTMLElement>,
  state: FilterChipState
) => {
  chipStates.push(state);
  return <span {...props} />;
};
beforeEach(() => {
  rootStates.length = 0;
  chipStates.length = 0;
});

interface Spec {
  count?: number;
  disabled?: boolean;
  value: string;
}
const FOUR: Spec[] = [
  { value: "All", count: 6 },
  { value: "Typography", count: 3 },
  { value: "Color", count: 2 },
  { value: "Motion", count: 1 },
];

function Row({
  chips = FOUR,
  ...props
}: Omit<React.ComponentProps<typeof FilterChips>, "children"> & {
  chips?: Spec[];
}) {
  return (
    <FilterChips aria-label="Topic" {...props}>
      {chips.map((c) => (
        <FilterChip
          count={c.count}
          disabled={c.disabled}
          key={c.value}
          value={c.value}
        >
          {c.value}
        </FilterChip>
      ))}
    </FilterChips>
  );
}

// ---------------------------------------------------------------------------
// Selection and values
// ---------------------------------------------------------------------------

describe("FilterChips selection", () => {
  test("reports duplicate values with console.error", () => {
    render(
      <Row
        chips={[
          { value: "a", count: 1 },
          { value: "a", count: 2 },
        ]}
      />
    );
    expect(messages(errorSpy).some((m: string) => m.includes('"a"'))).toBe(
      true
    );
  });

  test("reports a switch between controlled and uncontrolled", () => {
    const { rerender } = render(<Row value="All" />);
    rerender(<Row value={undefined} />);
    expect(
      messages(errorSpy).some((m: string) => m.includes("controlled"))
    ).toBe(true);
  });

  test("a controlled value selects its chip, and null selects none", () => {
    const { rerender } = render(<Row value="Color" />);
    expect(checkedValues()).toEqual(["Color 2"]);
    rerender(<Row value={null} />);
    expect(checkedValues()).toEqual([]);
  });

  test("defaultValue selects its chip without a callback", () => {
    const onValueChange = vi.fn();
    render(<Row defaultValue="Typography" onValueChange={onValueChange} />);
    expect(checkedValues()).toEqual(["Typography 3"]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("no value, or a value no chip has, selects nothing and reports nothing", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Row onValueChange={onValueChange} />);
    expect(checkedValues()).toEqual([]);
    rerender(<Row onValueChange={onValueChange} value="nope" />);
    expect(checkedValues()).toEqual([]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("clicking a chip reports its value with Base UI's details", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Row onValueChange={onValueChange} />);
    await user.click(chip("Color"));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [value, details] = onValueChange.mock.calls[0] as [
      string,
      FilterChipsChangeEventDetails,
    ];
    expect(value).toBe("Color");
    expect(details.reason).toBe("none");
    expect(typeof details.cancel).toBe("function");
    expect(typeof details.allowPropagation).toBe("function");
    expect(details.isCanceled).toBe(false);
    expect(details.event).toBeDefined();
    expect(checkedValues()).toEqual(["Color 2"]);
  });

  test("clicking or pressing Space on the selected chip keeps it and fires nothing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Row defaultValue="Color" onValueChange={onValueChange} />);
    await user.click(chip("Color"));
    chip("Color").focus();
    await user.keyboard(" ");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(checkedValues()).toEqual(["Color 2"]);
  });

  test("Space selects a focused unselected chip; Enter does nothing", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Row onValueChange={onValueChange} />);
    act(() => chip("Color").focus());
    await user.keyboard("{Enter}");
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard(" ");
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual(["Color"]);
  });

  test("a cancelled change does not commit an uncontrolled value", async () => {
    const user = userEvent.setup();
    render(<Row defaultValue="All" onValueChange={cancelChange} />);
    await user.click(chip("Color"));
    expect(checkedValues()).toEqual(["All 6"]);
  });

  test("a controlled value wins over an uncancelled change the parent ignores", async () => {
    const user = userEvent.setup();
    render(
      <FilterChips aria-label="Topic" onValueChange={ignoreChange} value="All">
        <FilterChip count={0} value="All">
          All
        </FilterChip>
        <FilterChip className={recordChip} count={2} value="Color">
          Color
        </FilterChip>
      </FilterChips>
    );
    await user.click(chip("Color"));
    expect(checkedValues()).toEqual(["All 0"]);
    expect(chip("Color")).not.toHaveAttribute("data-selected");
    expect(chip("All")).toHaveAttribute("data-selected");
    // The zero exemption follows the supplied value, so All stays available.
    expect(chip("All")).not.toHaveAttribute("data-disabled");
    expect(chipStates.at(-1)?.selected).toBe(false);
  });

  test("a parent that cancels and then sets the value itself owns it", async () => {
    const user = userEvent.setup();
    function Parent() {
      const [value, setValue] = React.useState<string | null>("All");
      const takeOver = React.useCallback(
        (next: string, details: FilterChipsChangeEventDetails) => {
          details.cancel();
          setValue(next);
        },
        []
      );
      return <Row onValueChange={takeOver} value={value} />;
    }
    render(<Parent />);
    await user.click(chip("Color"));
    expect(checkedValues()).toEqual(["Color 2"]);
  });

  test("removing the selected chip leaves the value unmatched and reports nothing", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Row onValueChange={onValueChange} value="Color" />
    );
    rerender(
      <Row
        chips={FOUR.filter((c) => c.value !== "Color")}
        onValueChange={onValueChange}
        value="Color"
      />
    );
    await flush();
    expect(checkedValues()).toEqual([]);
    expect(tabStops()).toEqual(["All 6"]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("a count update emits no change", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Row onValueChange={onValueChange} value="Color" />
    );
    rerender(
      <Row
        chips={FOUR.map((c) => ({ ...c, count: (c.count ?? 0) + 5 }))}
        onValueChange={onValueChange}
        value="Color"
      />
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Entry target (the one chip with tabindex 0 while focus is outside)
// ---------------------------------------------------------------------------

describe("FilterChips entry target", () => {
  test("is the selected chip when it is available", () => {
    render(<Row value="Color" />);
    expect(tabStops()).toEqual(["Color 2"]);
  });

  test("is the first available chip with no value", () => {
    render(<Row value={null} />);
    expect(tabStops()).toEqual(["All 6"]);
  });

  test("skips an unavailable first chip", () => {
    render(
      <Row
        chips={[{ value: "All", count: 0 }, ...FOUR.slice(1)]}
        value={null}
      />
    );
    expect(tabStops()).toEqual(["Typography 3"]);
  });

  test("is the first available chip for an unmatched value", () => {
    render(<Row value="nope" />);
    expect(tabStops()).toEqual(["All 6"]);
  });

  test("moves past an explicitly disabled selected chip, which stays checked", () => {
    render(
      <Row
        chips={[{ value: "All", count: 6, disabled: true }, ...FOUR.slice(1)]}
        value="All"
      />
    );
    expect(tabStops()).toEqual(["Typography 3"]);
    expect(checkedValues()).toEqual(["All 6"]);
  });

  test("is the selected chip at count 0", () => {
    render(
      <Row
        chips={[FOUR[0], { value: "Typography", count: 0 }, ...FOUR.slice(2)]}
        value="Typography"
      />
    );
    expect(tabStops()).toEqual(["Typography 0"]);
  });

  test("is none when the row is disabled", () => {
    render(<Row disabled value="All" />);
    expect(tabStops()).toEqual([]);
  });

  test("is none when every chip is unavailable", () => {
    render(<Row chips={FOUR.map((c) => ({ ...c, count: 0 }))} value={null} />);
    expect(tabStops()).toEqual([]);
  });

  test("gives every other chip tabindex -1", () => {
    render(<Row value="Color" />);
    expect(
      screen.getAllByRole("radio").map((el) => el.getAttribute("tabindex"))
    ).toEqual(["-1", "-1", "0", "-1"]);
  });
});

describe("FilterChips entry target after the row changes", () => {
  const ABC: Spec[] = [
    { value: "a", count: 1 },
    { value: "b", count: 1 },
    { value: "c", count: 1 },
  ];
  const reorder = (chips: Spec[], order: string[]) =>
    order.map((v) => chips.find((c) => c.value === v) as Spec);

  test.each([
    ["no value", null],
    ["an unmatched value", "zzz"],
  ])("follows a keyed reorder with %s", async (_label, value) => {
    const { rerender } = render(<Row chips={ABC} value={value} />);
    expect(tabStops()).toEqual(["a 1"]);
    rerender(<Row chips={reorder(ABC, ["c", "a", "b"])} value={value} />);
    await flush();
    expect(tabStops()).toEqual(["c 1"]);
  });

  test("follows a keyed reorder past an explicitly disabled selected chip", async () => {
    const chips = [{ value: "a", count: 1, disabled: true }, ...ABC.slice(1)];
    const { rerender } = render(<Row chips={chips} value="a" />);
    expect(tabStops()).toEqual(["b 1"]);
    rerender(<Row chips={reorder(chips, ["a", "c", "b"])} value="a" />);
    await flush();
    expect(tabStops()).toEqual(["c 1"]);
  });

  function Rendered({
    tag,
    label = "Topic",
    value = null,
  }: {
    tag: "span" | "div";
    label?: string;
    value?: string | null;
  }) {
    return (
      <FilterChips aria-label={label} value={value}>
        {["a", "b"].map((v) => (
          <FilterChip
            key={v}
            render={v === "a" ? React.createElement(tag) : undefined}
            value={v}
          >
            {v}
          </FilterChip>
        ))}
      </FilterChips>
    );
  }

  test.each([
    ["unselected", null],
    ["selected", "a"],
  ])(
    "keeps the Tab stop on a replaced rendered element (%s)",
    async (_label, value) => {
      const { rerender } = render(<Rendered tag="span" value={value} />);
      expect(tabStops()).toEqual(["a"]);
      rerender(<Rendered tag="div" value={value} />);
      rerender(<Rendered label="New topic" tag="div" value={value} />);
      await flush();
      expect(chip("a").tagName).toBe("DIV");
      expect(tabStops()).toEqual(["a"]);
    }
  );

  test("an arrow that moves nothing lets no focus in the same task select", () => {
    const onValueChange = vi.fn();
    const row = (available: boolean) => (
      <FilterChips aria-label="Topic" onValueChange={onValueChange}>
        <FilterChip value="a">a</FilterChip>
        <FilterChip disabled={!available} value="b">
          b
        </FilterChip>
      </FilterChips>
    );
    const { rerender } = render(row(false));
    act(() => chip("a").focus());
    fireEvent.keyDown(chip("a"), { key: "ArrowRight" });
    rerender(row(true));
    act(() => chip("b").focus());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(checkedValues()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

describe("FilterChips surface", () => {
  test("renders a radiogroup div and radio spans with their slots", () => {
    render(<Row value="All" />);
    const group = screen.getByRole("radiogroup");
    expect(group.tagName).toBe("DIV");
    expect(group).toHaveAttribute("data-slot", "filter-chips");
    expect(group).toHaveAttribute("data-size", "default");
    const all = chip("All");
    expect(all.tagName).toBe("SPAN");
    expect(all).toHaveAttribute("data-slot", "filter-chip");
    expect(
      all.querySelector('[data-slot="filter-chip-count"]')
    ).toHaveTextContent("6");
  });

  test("marks selected, disabled and empty chips", () => {
    render(
      <Row
        chips={[
          { value: "All", count: 6 },
          { value: "Typography", count: 0 },
          { value: "Color", count: 2, disabled: true },
        ]}
        value="All"
      />
    );
    expect(chip("All")).toHaveAttribute("data-selected");
    expect(chip("All")).not.toHaveAttribute("data-empty");
    expect(chip("Typography")).toHaveAttribute("data-empty");
    expect(chip("Typography")).toHaveAttribute("data-disabled");
    expect(chip("Color")).toHaveAttribute("data-disabled");
    expect(chip("Color")).not.toHaveAttribute("data-selected");
  });

  test("marks the disabled row", () => {
    render(<Row disabled size="sm" />);
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("data-disabled");
    expect(group).toHaveAttribute("data-size", "sm");
  });

  test("passes its own state to a function className", () => {
    render(
      <FilterChips
        aria-label="Topic"
        className={recordRoot}
        size="lg"
        value="a"
      >
        <FilterChip className={recordChip} count={0} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(rootStates.at(-1)).toEqual({ disabled: false, size: "lg" });
    expect(chipStates.at(-1)).toEqual({
      selected: true,
      disabled: false,
      empty: true,
      size: "lg",
    });
    expect(screen.getByRole("radiogroup")).toHaveClass("root-class");
    expect(chip("A")).toHaveClass("chip-class");
  });

  test("a string className is merged with the chip's own classes", () => {
    render(
      <FilterChips aria-label="Topic" className="row-extra">
        <FilterChip className="chip-extra" value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(screen.getByRole("radiogroup")).toHaveClass("row-extra", "flex");
    expect(chip("A")).toHaveClass("chip-extra", "rounded-full");
  });

  test("forwards refs to the group div and to the visible radio", () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const chipRef = React.createRef<HTMLSpanElement>();
    render(
      <FilterChips aria-label="Topic" ref={rootRef}>
        <FilterChip ref={chipRef} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(rootRef.current).toBe(screen.getByRole("radiogroup"));
    expect(chipRef.current).toBe(chip("A"));
  });

  test("puts a chip's id on its hidden input, as Base UI does", () => {
    const { container } = render(
      <FilterChips aria-label="Topic">
        <FilterChip id="chip-a" value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(container.querySelector("input#chip-a")).not.toBeNull();
    expect(chip("A")).not.toHaveAttribute("id", "chip-a");
  });

  test("passes through attributes and merges event handlers", async () => {
    const user = userEvent.setup();
    const rootKeyDown = vi.fn();
    const chipClick = vi.fn();
    const chipFocus = vi.fn();
    const onValueChange = vi.fn();
    render(
      <FilterChips
        aria-describedby="hint"
        aria-label="Topic"
        data-testid="row"
        dir="ltr"
        id="row-id"
        onKeyDown={rootKeyDown}
        onValueChange={onValueChange}
        style={{ marginTop: 3 }}
        title="Row title"
      >
        <FilterChip
          aria-describedby="chip-hint"
          data-testid="chip-a"
          onClick={chipClick}
          onFocus={chipFocus}
          style={{ marginLeft: 2 }}
          title="Chip title"
          value="a"
        >
          A
        </FilterChip>
        <FilterChip value="b">B</FilterChip>
      </FilterChips>
    );
    const row = screen.getByTestId("row");
    expect(row).toHaveAttribute("id", "row-id");
    expect(row).toHaveAttribute("title", "Row title");
    expect(row).toHaveAttribute("dir", "ltr");
    expect(row).toHaveAttribute("aria-describedby", "hint");
    expect(row.style.marginTop).toBe("3px");
    const a = screen.getByTestId("chip-a");
    expect(a).toHaveAttribute("title", "Chip title");
    expect(a).toHaveAttribute("aria-describedby", "chip-hint");
    expect(a.style.marginLeft).toBe("2px");
    await user.click(a);
    expect(chipClick).toHaveBeenCalled();
    expect(chipFocus).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenCalledWith("a", expect.anything());
    await user.keyboard("{ArrowRight}");
    expect(rootKeyDown).toHaveBeenCalled();
  });

  test("render forwards props, ref and children to a non-interactive element", () => {
    const chipRef = React.createRef<HTMLSpanElement>();
    render(
      <FilterChips aria-label="Topic" render={<section />} value="a">
        <FilterChip count={4} ref={chipRef} render={<div />} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    const group = screen.getByRole("radiogroup");
    expect(group.tagName).toBe("SECTION");
    expect(group).toHaveAttribute("data-slot", "filter-chips");
    const a = screen.getByRole("radio");
    expect(a.tagName).toBe("DIV");
    expect(a).toHaveAttribute("data-slot", "filter-chip");
    expect(a).toHaveAttribute("data-selected");
    expect(a).toHaveTextContent("A 4");
    expect(chipRef.current).toBe(a);
  });

  test("a render prop can be named by its public type", () => {
    const rowRef = React.createRef<HTMLElement>();
    const chipRef = React.createRef<HTMLDivElement>();
    const rowRender: FilterChipsRenderProp<FilterChipsState> = (props) => (
      <div {...props} />
    );
    const chipRender: FilterChipsRenderProp<FilterChipState> = (props) => (
      <div {...props} />
    );
    render(
      <FilterChips aria-label="Topic" ref={rowRef} render={rowRender} value="a">
        <FilterChip count={4} ref={chipRef} render={chipRender} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    const group = screen.getByRole("radiogroup");
    expect(group.tagName).toBe("DIV");
    expect(rowRef.current).toBe(group);
    const a = screen.getByRole("radio");
    expect(a.tagName).toBe("DIV");
    expect(chipRef.current).toBe(a);
    expect(a).toHaveAttribute("aria-checked", "true");
    expect(a).toHaveTextContent("A 4");
    expect(
      a.querySelector('[data-slot="filter-chip-count"]')
    ).toHaveTextContent("4");
  });

  test("a ref can be typed for the element render swaps in", () => {
    // `render` can replace the row's <div> and the chip's <span>, so the
    // refs accept any HTMLElement, including one typed for the new element.
    // Only the row's case can fail to compile: a span adds no members to
    // HTMLElement, so any element ref already fits the chip's.
    const rowRef = React.createRef<HTMLElement>();
    const chipRef = React.createRef<HTMLDivElement>();
    render(
      <FilterChips
        aria-label="Topic"
        ref={rowRef}
        render={<section />}
        value="a"
      >
        <FilterChip ref={chipRef} render={<div />} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(rowRef.current?.tagName).toBe("SECTION");
    expect(chipRef.current).toBe(screen.getByRole("radio"));
    expect(chipRef.current?.tagName).toBe("DIV");
  });

  test("a render function receives the component's own state", () => {
    const rowRender = (
      props: React.HTMLAttributes<HTMLElement>,
      state: FilterChipsState
    ) => {
      rootStates.push(state);
      return <div {...props} />;
    };
    render(
      <FilterChips aria-label="Topic" render={rowRender} size="sm" value="a">
        <FilterChip count={0} render={recordRender} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(chipStates.at(-1)).toEqual({
      selected: true,
      disabled: false,
      empty: true,
      size: "sm",
    });
    expect(rootStates.at(-1)).toEqual({ disabled: false, size: "sm" });
  });

  test("render element children replace the generated label and count", () => {
    render(
      <FilterChips aria-label="Topic">
        <FilterChip count={4} render={<span>Custom</span>} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(screen.getByRole("radio")).toHaveTextContent("Custom");
    expect(
      screen.getByRole("radio").querySelector('[data-slot="filter-chip-count"]')
    ).toBeNull();
  });

  test("throws when a chip is rendered outside a row", () => {
    expect(() => render(<FilterChip value="a">A</FilterChip>)).toThrow(
      OUTSIDE_ROW
    );
  });

  test("warns about a row without a name", async () => {
    render(
      <FilterChips>
        <FilterChip value="a">A</FilterChip>
      </FilterChips>
    );
    await waitFor(() =>
      expect(
        messages(warnSpy).some((m: string) => m.includes("aria-label"))
      ).toBe(true)
    );
  });

  test("does not warn about a row named by aria-labelledby or a fieldset legend", async () => {
    render(
      <>
        <span id="lbl">Topic</span>
        <FilterChips aria-labelledby="lbl">
          <FilterChip value="a">A</FilterChip>
        </FilterChips>
        <Fieldset.Root>
          <Fieldset.Legend>Topic</Fieldset.Legend>
          <FilterChips>
            <FilterChip value="b">B</FilterChip>
          </FilterChips>
        </Fieldset.Root>
      </>
    );
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(
      messages(warnSpy).filter((m: string) => m.includes("aria-label"))
    ).toEqual([]);
  });

  test("drops radio props that are not part of the contract", () => {
    const rowExtra = {
      name: "topic",
      form: "f",
      required: true,
      readOnly: true,
    } as object;
    const chipExtra = { required: true, readOnly: true } as object;
    const onValueChange = vi.fn();
    render(
      <FilterChips
        aria-label="Topic"
        onValueChange={onValueChange}
        {...rowExtra}
      >
        <FilterChip value="a" {...chipExtra}>
          A
        </FilterChip>
      </FilterChips>
    );
    const input = document.querySelector("input") as HTMLInputElement;
    expect(input).not.toHaveAttribute("name");
    expect(input).not.toHaveAttribute("form");
    expect(input).not.toBeRequired();
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("aria-required");
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("aria-readonly");
    // A read-only primitive would ignore the click.
    fireEvent.click(chip("A"));
    expect(onValueChange).toHaveBeenCalledWith("a", expect.anything());
  });

  test("a caller's tabIndex does not reach a chip, outside or inside the row", () => {
    const extra = { tabIndex: 7 } as object;
    render(
      <FilterChips aria-label="Topic">
        <FilterChip value="a">A</FilterChip>
        <FilterChip value="b" {...extra}>
          B
        </FilterChip>
      </FilterChips>
    );
    expect(chip("B")).toHaveAttribute("tabindex", "-1");
    act(() => chip("A").focus());
    expect(chip("B")).not.toHaveAttribute("tabindex", "7");
  });

  test("a chip's inputRef does not reach the primitive", () => {
    const inputRef = React.createRef<HTMLInputElement>();
    const extra = { inputRef } as object;
    render(
      <FilterChips aria-label="Topic">
        <FilterChip value="a" {...extra}>
          A
        </FilterChip>
      </FilterChips>
    );
    expect(inputRef.current).toBeNull();
    expect(document.querySelector("input")).not.toBeNull();
  });

  test("a chip's nativeButton does not reach the primitive", () => {
    // A native-button radio would move the chip's id from its hidden input
    // to the visible element.
    const extra = { nativeButton: true } as object;
    const { container } = render(
      <FilterChips aria-label="Topic">
        <FilterChip id="chip-a" value="a" {...extra}>
          A
        </FilterChip>
      </FilterChips>
    );
    expect(chip("A").tagName).toBe("SPAN");
    expect(container.querySelector("input#chip-a")).not.toBeNull();
    expect(chip("A")).not.toHaveAttribute("id", "chip-a");
  });

  test("a row's tabIndex does not reach the DOM", () => {
    // The row owns the one Tab stop; a tabIndex on the group would add a
    // second one beside it.
    const extra = { tabIndex: 7 } as object;
    const { container } = render(
      <FilterChips aria-label="Topic" defaultValue="a" {...extra}>
        <FilterChip value="a">A</FilterChip>
        <FilterChip value="b">B</FilterChip>
      </FilterChips>
    );
    expect(container.querySelector('[tabindex="7"]')).toBeNull();
    expect(screen.getByRole("radiogroup")).not.toHaveAttribute("tabindex");
  });

  test("the types reject a row tabIndex", () => {
    const elements = [
      // @ts-expect-error the row owns the Tab stop
      <FilterChips aria-label="Topic" key="tabIndex" tabIndex={0} />,
    ];
    expect(elements).toHaveLength(1);
  });

  test("the types accept no form props and only an object style", () => {
    const elements = [
      // @ts-expect-error a form name is not part of the row's contract
      <FilterChips aria-label="Topic" key="name" name="topic" />,
      // @ts-expect-error nor is `required`
      <FilterChips aria-label="Topic" key="required" required />,
      // @ts-expect-error nor is `inputRef`
      <FilterChips aria-label="Topic" inputRef={null} key="inputRef" />,
      // @ts-expect-error a function style would receive the primitive's state
      <FilterChips aria-label="Topic" key="style" style={functionStyle} />,
      // @ts-expect-error a chip renders no native button
      <FilterChip key="nativeButton" nativeButton value="a" />,
      // @ts-expect-error the row owns every chip's tab stop
      <FilterChip key="tabIndex" tabIndex={0} value="a" />,
      // @ts-expect-error a function style would receive the primitive's state
      <FilterChip key="chip-style" style={functionStyle} value="a" />,
      <FilterChip key="object-style" style={{ opacity: 1 }} value="a" />,
    ];
    expect(elements).toHaveLength(8);
  });
});

// ---------------------------------------------------------------------------
// Counts
// ---------------------------------------------------------------------------

describe("FilterChip counts", () => {
  const pill = (el: HTMLElement) =>
    el.querySelector('[data-slot="filter-chip-count"]');

  test.each([
    ["omitted", {}],
    ["undefined", { count: undefined }],
  ])("draws no pill when count is %s", (_label, countProp) => {
    render(
      <FilterChips aria-label="Topic">
        <FilterChip value="a" {...countProp}>
          A
        </FilterChip>
      </FilterChips>
    );
    expect(pill(chip("A"))).toBeNull();
    expect(chip("A")).not.toHaveAttribute("data-empty");
    expect(chip("A")).toHaveClass("pe-3.5");
    expect(chip("A")).not.toHaveClass("pe-1.5");
  });

  test.each([
    [0, "0"],
    [-0, "0"],
    [1234, "1234"],
    [Number.MAX_SAFE_INTEGER, String(Number.MAX_SAFE_INTEGER)],
  ])("draws %s as %s", (count, text) => {
    render(
      <FilterChips aria-label="Topic" value="a">
        <FilterChip count={count} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(pill(chip("A"))).toHaveTextContent(text);
    expect(chip("A")).toHaveClass("pe-1.5");
    expect(
      messages(warnSpy).filter((m: string) => m.includes("count"))
    ).toEqual([]);
  });

  test.each([
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])("treats %s as omitted and warns", (count) => {
    render(
      <FilterChips aria-label="Topic">
        <FilterChip count={count} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(pill(chip("A"))).toBeNull();
    expect(chip("A")).not.toHaveAttribute("data-empty");
    expect(chip("A")).not.toHaveAttribute("data-disabled");
    expect(messages(warnSpy).some((m: string) => m.includes("count"))).toBe(
      true
    );
  });

  test("names a chip by its label, a real space and the count", () => {
    render(
      <FilterChips aria-label="Topic">
        <FilterChip count={3} value="t">
          Typography
        </FilterChip>
      </FilterChips>
    );
    expect(screen.getByRole("radio", { name: "Typography 3" })).toBeDefined();
    expect(chip("Typography").textContent).toBe("Typography 3");
  });

  test("an aria-label replaces the whole name", () => {
    render(
      <FilterChips aria-label="Topic">
        <FilterChip aria-label="Typography, 3 results" count={3} value="t">
          Typography
        </FilterChip>
      </FilterChips>
    );
    expect(
      screen.getByRole("radio", { name: "Typography, 3 results" })
    ).toBeDefined();
  });

  test("formatCount prints every pill; the zero rule reads the raw number", () => {
    render(
      <FilterChips aria-label="Topic" formatCount={formatNone}>
        <FilterChip count={0} value="a">
          A
        </FilterChip>
        <FilterChip count={12} value="b">
          B
        </FilterChip>
      </FilterChips>
    );
    expect(pill(chip("A"))).toHaveTextContent("none");
    expect(chip("A")).toHaveAttribute("data-empty");
    expect(chip("A")).toHaveAttribute("data-disabled");
    expect(pill(chip("B"))).toHaveTextContent("12+");
    expect(screen.getByRole("radio", { name: "B 12+" })).toBeDefined();
  });

  test("a formatter returning '0' for a non-zero count does not make it empty", () => {
    render(
      <FilterChips aria-label="Topic" formatCount={formatZero}>
        <FilterChip count={5} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(chip("A")).not.toHaveAttribute("data-empty");
    expect(chip("A")).not.toHaveAttribute("data-disabled");
  });

  test("disables unselected zero chips and never the selected one", () => {
    render(
      <Row
        chips={[
          { value: "All", count: 0 },
          { value: "Typography", count: 0 },
        ]}
        value="All"
      />
    );
    expect(chip("All")).not.toHaveAttribute("data-disabled");
    expect(chip("Typography")).toHaveAttribute("data-disabled");
  });

  test("disableEmpty={false} keeps zero chips available", () => {
    render(
      <Row
        chips={[
          { value: "All", count: 0 },
          { value: "Typography", count: 0 },
        ]}
        disableEmpty={false}
      />
    );
    expect(chip("All")).not.toHaveAttribute("data-disabled");
    expect(chip("Typography")).not.toHaveAttribute("data-disabled");
    expect(chip("Typography")).toHaveAttribute("data-empty");
  });

  test("disabled={false} does not re-enable a zero chip", () => {
    render(
      <FilterChips aria-label="Topic">
        <FilterChip count={0} disabled={false} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(chip("A")).toHaveAttribute("data-disabled");
  });

  test("explicit disabled applies to the selected chip too", () => {
    render(
      <FilterChips aria-label="Topic" value="a">
        <FilterChip count={0} disabled value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(chip("A")).toHaveAttribute("data-disabled");
  });

  test("an empty chip ignores clicks", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Row
        chips={[
          { value: "All", count: 6 },
          { value: "Typography", count: 0 },
        ]}
        onValueChange={onValueChange}
        value="All"
      />
    );
    await user.click(chip("Typography"));
    fireEvent.click(chip("Typography"));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Sizes
// ---------------------------------------------------------------------------

describe("FilterChips sizes", () => {
  test.each([
    ["sm", "h-(--ks-control-xs,1.5rem)", "ps-3", "text-xs", "h-4"],
    ["default", "h-(--ks-control-sm,2rem)", "ps-3.5", "text-sm", "h-5"],
    ["lg", "h-(--ks-control-md,2.5rem)", "ps-4", "text-sm", "h-5"],
  ] as const)("%s reads its rung", (size, height, start, text, pillHeight) => {
    render(
      <FilterChips aria-label="Topic" size={size}>
        <FilterChip count={1} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    expect(chip("A")).toHaveClass(height, start, text);
    expect(
      chip("A").querySelector('[data-slot="filter-chip-count"]')
    ).toHaveClass(pillHeight);
  });
});

// ---------------------------------------------------------------------------
// Server render
// ---------------------------------------------------------------------------

describe("FilterChips server render", () => {
  test.each([null, "Typography", "Motion"])(
    "hydrates without a warning (value %s)",
    async (value) => {
      const chips = [...FOUR.slice(0, 3), { value: "Motion", count: 0 }];
      const html = renderToString(<Row chips={chips} value={value} />);
      const host = document.createElement("div");
      host.innerHTML = html;
      document.body.append(host);
      const serverText = host.textContent;
      let root: ReturnType<typeof hydrateRoot> | undefined;
      try {
        await act(async () => {
          root = hydrateRoot(host, <Row chips={chips} value={value} />);
        });
        expect(messages(errorSpy)).toEqual([]);
        expect(host.textContent).toBe(serverText);
        const stops = [...host.querySelectorAll('[role="radio"]')]
          .filter((el) => el.getAttribute("tabindex") === "0")
          .map((el) => el.textContent);
        expect(stops).toEqual([
          value === null
            ? "All 6"
            : `${value} ${chips.find((c) => c.value === value)?.count}`,
        ]);
      } finally {
        act(() => root?.unmount());
        host.remove();
      }
    }
  );

  test("formatCount prints the same text on server and client", async () => {
    const format = (n: number) => `${n.toLocaleString("en-US")} items`;
    const el = (
      <FilterChips aria-label="Topic" formatCount={format}>
        <FilterChip count={12_345} value="a">
          A
        </FilterChip>
      </FilterChips>
    );
    const html = renderToString(el);
    const host = document.createElement("div");
    host.innerHTML = html;
    document.body.append(host);
    expect(host.textContent).toBe("A 12,345 items");
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(host, el);
      });
      expect(messages(errorSpy)).toEqual([]);
      expect(host.textContent).toBe("A 12,345 items");
    } finally {
      act(() => root?.unmount());
      host.remove();
    }
  });
});

// ---------------------------------------------------------------------------
// Keys and state styles
// ---------------------------------------------------------------------------

describe("FilterChips keys", () => {
  test("arrows follow the reading direction inside a DirectionProvider", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DirectionProvider direction="rtl">
        <div dir="rtl">
          <Row defaultValue="Typography" onValueChange={onValueChange} />
        </div>
      </DirectionProvider>
    );
    act(() => chip("Typography").focus());
    await user.keyboard("{ArrowRight}");
    await waitFor(() => expect(document.activeElement).toBe(chip("All")));
    await user.keyboard("{ArrowLeft}");
    await waitFor(() =>
      expect(document.activeElement).toBe(chip("Typography"))
    );
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual([
      "All",
      "Typography",
    ]);
  });
});

describe("FilterChip state styles", () => {
  const tokens = (el: HTMLElement) =>
    el.className.split(" ").filter((t) => HOVER_OR_PRESS.test(t));

  test("an unavailable chip carries no hover fill", () => {
    render(
      <Row
        chips={[
          { value: "All", count: 6 },
          { value: "Typography", count: 0 },
        ]}
        value="All"
      />
    );
    expect(tokens(chip("Typography"))).toEqual([]);
    const pill = chip("Typography").querySelector(
      '[data-slot="filter-chip-count"]'
    ) as HTMLElement;
    expect(tokens(pill)).toEqual([]);
  });

  test("forced colours paint the selected chip and its pill with system colours, and leave adjustment on", () => {
    render(<Row value="All" />);
    const selected = chip("All");
    const pill = selected.querySelector(
      '[data-slot="filter-chip-count"]'
    ) as HTMLElement;
    const forced = (el: HTMLElement) =>
      el.className.split(" ").filter((t) => t.startsWith("forced-colors:"));
    // `forced-color-adjust` is inherited: `none` on the chip would also stop
    // the browser forcing the pill's colours and the focus outline.
    expect(forced(selected).join(" ")).not.toContain("forced-color-adjust");
    expect(forced(selected)).toEqual(
      expect.arrayContaining([
        "forced-colors:bg-[Highlight]",
        "forced-colors:text-[HighlightText]",
      ])
    );
    expect(forced(pill)).toEqual(
      expect.arrayContaining([
        "forced-colors:bg-transparent",
        "forced-colors:text-[HighlightText]",
      ])
    );
  });

  test("a selected chip carries no hover fill, and no chip a press scale", () => {
    render(<Row value="All" />);
    expect(tokens(chip("All"))).toEqual([]);
    expect(tokens(chip("Color"))).toEqual(
      expect.arrayContaining(["hover:bg-accent", "dark:hover:bg-input/50"])
    );
    expect(tokens(chip("Color")).filter((t) => t.includes("active:"))).toEqual(
      []
    );
  });
});

describe("FilterChips inside a Field", () => {
  // Not a supported composition: this pins the hazard the docs describe.
  test("an unnamed chip takes the Field's label; a chip's own aria-label keeps it", async () => {
    render(
      <Field.Root>
        <Field.Label>Topic field</Field.Label>
        <FilterChips>
          <FilterChip count={2} value="a">
            Alpha
          </FilterChip>
          <FilterChip aria-label="Beta, 2 results" count={2} value="b">
            Beta
          </FilterChip>
        </FilterChips>
      </Field.Root>
    );
    const radios = await screen.findAllByRole("radio");
    await waitFor(() =>
      expect(screen.getAllByRole("radio", { name: "Topic field" })).toEqual([
        radios[0],
      ])
    );
    expect(screen.getByRole("radio", { name: "Beta, 2 results" })).toBe(
      radios[1]
    );
  });
});

// ---------------------------------------------------------------------------
// Focus bookkeeping: the Tab stop and the record of where focus was
// ---------------------------------------------------------------------------

const radio = (value: string) =>
  document.querySelector(`[data-v="${value}"]`) as HTMLElement | null;

function Letters({
  values,
  onValueChange,
  focusOn,
  value,
}: {
  values: string[];
  onValueChange?: (value: string) => void;
  /** chip value -> the chip its focus callback moves focus to */
  focusOn?: Record<string, string>;
  value?: string | null;
}) {
  return (
    <>
      <button data-testid="before" type="button">
        before
      </button>
      <FilterChips
        aria-label="Letters"
        onValueChange={onValueChange}
        {...(value === undefined ? {} : { value })}
      >
        {values.map((v) => (
          <FilterChip
            data-v={v}
            key={v}
            onFocus={
              focusOn?.[v]
                ? () => radio(focusOn[v] as string)?.focus()
                : undefined
            }
            value={v}
          >
            {v}
          </FilterChip>
        ))}
      </FilterChips>
      <button data-testid="after" type="button">
        after
      </button>
    </>
  );
}

let setLetters: (values: string[]) => void = () => undefined;
/** Letters whose chips a test changes with `setLetters`, in a commit of its own. */
function StatefulLetters({
  initial,
  ...props
}: Omit<React.ComponentProps<typeof Letters>, "values"> & {
  initial: string[];
}) {
  const [values, setValues] = React.useState(initial);
  setLetters = setValues;
  return <Letters values={values} {...props} />;
}

describe("FilterChips focus bookkeeping", () => {
  test("a focus callback that moves focus on leaves the new chip as the only roving stop, and its removal recovers to the entry target without a change", async () => {
    const onValueChange = vi.fn();
    render(
      <StatefulLetters
        focusOn={{ c: "d" }}
        initial={["a", "b", "c", "d"]}
        onValueChange={onValueChange}
      />
    );
    await flush();
    act(() => radio("b")?.focus());
    fireEvent.keyDown(radio("b") as HTMLElement, { key: "ArrowRight" });
    await flush();
    expect(document.activeElement).toBe(radio("d"));
    expect(tabStops()).toEqual(["d"]);
    expect(onValueChange).not.toHaveBeenCalled();
    act(() => {
      flushSync(() => setLetters(["a", "b", "c"]));
    });
    await flush();
    expect(document.activeElement).toBe(radio("a"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(checkedValues()).toEqual([]);
  });

  test.each([
    ["before", true],
    ["after", false],
  ])(
    "an outside focus that wins a removal retires the record: focus and blur %s the observers run",
    async (_label, beforeDelivery) => {
      render(<StatefulLetters initial={["a", "b", "c", "d"]} />);
      await flush();
      act(() => radio("a")?.focus());
      await flush();
      const after = screen.getByTestId("after");
      act(() => {
        // The removal commits first, then the page takes focus in the same task.
        flushSync(() => setLetters(["b", "c", "d"]));
        expect(document.activeElement).toBe(document.body);
        after.focus();
        if (beforeDelivery) {
          after.blur();
        }
      });
      await flush();
      if (!beforeDelivery) {
        expect(document.activeElement).toBe(after);
        act(() => after.blur());
        await flush();
      }
      expect(document.activeElement).toBe(document.body);
      // An unrelated change the row observes must not pull focus back.
      act(() =>
        radio("c")?.setAttribute("class", `${radio("c")?.className} x`)
      );
      await flush();
      act(() => flushSync(() => setLetters(["b", "c", "d", "e"])));
      await flush();
      expect(document.activeElement).toBe(document.body);
    }
  );

  test("a deliberate exit, then removal of the chip that had focus, recovers nothing", async () => {
    const { rerender } = render(<Letters values={["a", "b"]} />);
    await flush();
    act(() => radio("a")?.focus());
    act(() => screen.getByTestId("after").focus());
    act(() => screen.getByTestId("after").blur());
    rerender(<Letters values={["b"]} />);
    await flush();
    expect(document.activeElement).toBe(document.body);
  });

  test("a loss with no target is consumed: a chip that becomes available later does not take focus", async () => {
    let set: (next: { values: string[]; off: boolean }) => void = () =>
      undefined;
    function Row2() {
      const [state, setState] = React.useState({
        values: ["a", "b"],
        off: true,
      });
      set = setState;
      return (
        <FilterChips aria-label="Letters">
          {state.values.map((v) => (
            <FilterChip
              data-v={v}
              disabled={state.off && v !== "a"}
              key={v}
              value={v}
            >
              {v}
            </FilterChip>
          ))}
        </FilterChips>
      );
    }
    render(<Row2 />);
    await flush();
    act(() => radio("a")?.focus());
    act(() => {
      flushSync(() => set({ values: ["b"], off: true }));
    });
    await flush();
    expect(document.activeElement).toBe(document.body);
    act(() => flushSync(() => set({ values: ["b"], off: false })));
    await flush();
    act(() => flushSync(() => set({ values: ["b", "c"], off: false })));
    await flush();
    expect(document.activeElement).toBe(document.body);
  });

  test("a forwarded ref that focuses its chip while attaching selects nothing", async () => {
    const onValueChange = vi.fn();
    const focusOnAttach = (node: HTMLSpanElement | null) => node?.focus();
    render(
      <FilterChips aria-label="Letters" onValueChange={onValueChange}>
        <FilterChip data-v="a" value="a">
          a
        </FilterChip>
        <FilterChip data-v="b" ref={focusOnAttach} value="b">
          b
        </FilterChip>
      </FilterChips>
    );
    await flush();
    expect(document.activeElement).toBe(radio("b"));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(checkedValues()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Lifecycle: observers, listeners and refs
// ---------------------------------------------------------------------------

describe("FilterChips lifecycle", () => {
  let live: Set<object>;
  let observed: number;
  /** How many times each element was given to a ResizeObserver. */
  let observeCalls: Map<Element, number>;
  /** Each subtree observer's callback, with the element it observes. */
  let subtreeCallbacks: { callback: MutationCallback; target: Node }[];
  const RealMutationObserver = globalThis.MutationObserver;
  const RealResizeObserver = globalThis.ResizeObserver;
  beforeEach(() => {
    live = new Set();
    observed = 0;
    observeCalls = new Map();
    subtreeCallbacks = [];
    globalThis.MutationObserver = class extends RealMutationObserver {
      readonly callback: MutationCallback;
      constructor(callback: MutationCallback) {
        super(callback);
        this.callback = callback;
      }
      override observe(target: Node, options?: MutationObserverInit) {
        live.add(this);
        if (options?.subtree) {
          subtreeCallbacks.push({ callback: this.callback, target });
        }
        super.observe(target, options);
      }
      override disconnect() {
        live.delete(this);
        super.disconnect();
      }
    };
    globalThis.ResizeObserver = class {
      observe(target: Element) {
        observed += 1;
        observeCalls.set(target, (observeCalls.get(target) ?? 0) + 1);
      }
      unobserve() {
        observed -= 1;
      }
      disconnect() {
        observed = 0;
      }
    } as unknown as typeof ResizeObserver;
  });
  afterEach(() => {
    globalThis.MutationObserver = RealMutationObserver;
    globalThis.ResizeObserver = RealResizeObserver;
  });

  test("mount observes the row and its chips; unmount removes every observer and listener", async () => {
    const add = vi.spyOn(document, "addEventListener");
    const remove = vi.spyOn(document, "removeEventListener");
    const { unmount } = render(<Letters values={["a", "b", "c"]} />);
    await flush();
    expect(live.size).toBeGreaterThanOrEqual(1);
    expect(observed).toBe(3);
    unmount();
    await flush();
    expect(live.size).toBe(0);
    const added = add.mock.calls.filter(([type]) =>
      ["keydown", "focusin"].includes(String(type))
    ).length;
    const removed = remove.mock.calls.filter(([type]) =>
      ["keydown", "focusin"].includes(String(type))
    ).length;
    expect(added).toBeGreaterThan(0);
    expect(removed).toBe(added);
    expect(observed).toBe(0);
    add.mockRestore();
    remove.mockRestore();
  });

  test("observes chips as they come and go, without re-observing the rest", async () => {
    const { rerender } = render(<Letters values={["a", "b"]} />);
    await flush();
    expect(observed).toBe(2);
    const a = radio("a") as HTMLElement;
    const b = radio("b") as HTMLElement;
    const settled = [observeCalls.get(a), observeCalls.get(b)];
    rerender(<Letters values={["a", "b", "c"]} />);
    await flush();
    expect(observed).toBe(3);
    expect(observeCalls.get(radio("c") as HTMLElement)).toBe(1);
    rerender(<Letters values={["b", "c"]} />);
    await flush();
    expect(observed).toBe(2);
    // The chips that stayed were not observed again.
    expect([observeCalls.get(a), observeCalls.get(b)]).toEqual(settled);
  });

  test("under StrictMode the row ends with one live set of observers and still works", async () => {
    const plain = render(<Letters values={["a", "b", "c"]} />);
    await flush();
    const baseline = live.size;
    plain.unmount();
    await flush();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <React.StrictMode>
        <Letters onValueChange={onValueChange} values={["a", "b", "c"]} />
      </React.StrictMode>
    );
    await flush();
    expect(live.size).toBe(baseline);
    expect(observed).toBe(3);
    rerender(
      <React.StrictMode>
        <Letters onValueChange={onValueChange} values={["c", "a", "b"]} />
      </React.StrictMode>
    );
    await flush();
    expect(tabStops()).toEqual(["c"]);
    act(() => radio("c")?.focus());
    fireEvent.keyDown(radio("c") as HTMLElement, { key: "ArrowRight" });
    await flush();
    expect(document.activeElement).toBe(radio("a"));
    expect(onValueChange.mock.calls.map((c) => c[0])).toEqual(["a"]);
  });

  test("a row whose render replaces its own element observes the new one only", async () => {
    function Swapping({
      tag,
      values,
    }: {
      tag: "div" | "section";
      values: string[];
    }) {
      return (
        <FilterChips aria-label="Letters" render={React.createElement(tag)}>
          {values.map((v) => (
            <FilterChip data-v={v} key={v} value={v}>
              {v}
            </FilterChip>
          ))}
        </FilterChips>
      );
    }
    const { rerender } = render(
      <Swapping tag="div" values={["a", "b", "c"]} />
    );
    await flush();
    const first = live.size;
    rerender(<Swapping tag="section" values={["a", "b", "c"]} />);
    await flush();
    expect(screen.getByRole("radiogroup").tagName).toBe("SECTION");
    expect(live.size).toBe(first);
    rerender(<Swapping tag="section" values={["c", "a", "b"]} />);
    await flush();
    expect(tabStops()).toEqual(["c"]);
  });

  test.each([null, "y"])(
    "recovery cannot publish a retired root's entry target (value %s)",
    async (finalValue) => {
      interface State {
        tag: "div" | "section";
        value: string | null;
        values: string[];
      }
      let update!: React.Dispatch<React.SetStateAction<State>>;
      let armed = false;
      let swapped = false;
      const changes = vi.fn();

      function Host() {
        const [state, setState] = React.useState<State>({
          values: ["a", "b", "c"],
          tag: "div",
          value: null,
        });
        update = setState;
        return (
          <FilterChips
            aria-label="Letters"
            onValueChange={changes}
            render={React.createElement(state.tag)}
            value={state.value}
          >
            {state.values.map((value) => (
              <FilterChip
                key={value}
                // biome-ignore lint/performance/noJsxPropsBind: the callback reads this render's state
                onFocus={() => {
                  // biome-ignore lint/suspicious/noUnnecessaryConditions: both flags change outside this render
                  if (armed && value === "b" && !swapped) {
                    swapped = true;
                    flushSync(() => {
                      setState({
                        values: ["x", "y"],
                        tag: "section",
                        value: finalValue,
                      });
                    });
                  }
                }}
                value={value}
              >
                {value}
              </FilterChip>
            ))}
          </FilterChips>
        );
      }

      render(<Host />);
      await flush();
      act(() => screen.getByRole("radio", { name: "a" }).focus());
      armed = true;
      act(() => {
        flushSync(() => {
          update((state) => ({ ...state, values: ["b", "c"] }));
        });
      });
      await flush();
      expect(swapped).toBe(true);
      expect(screen.getByRole("radiogroup").tagName).toBe("SECTION");
      expect(tabStops()).toEqual([finalValue ?? "x"]);
      expect(checkedValues()).toEqual(finalValue ? [finalValue] : []);
      expect(changes).not.toHaveBeenCalled();
    }
  );

  test("an observer callback of a replaced row element publishes nothing into the new one", async () => {
    function Swapping({ tag }: { tag: "div" | "section" }) {
      return (
        <>
          <FilterChips aria-label="Letters" render={React.createElement(tag)}>
            {["a", "b"].map((v) => (
              <FilterChip data-v={v} key={v} value={v}>
                {v}
              </FilterChip>
            ))}
          </FilterChips>
          <button data-testid="after" type="button">
            after
          </button>
        </>
      );
    }
    const { rerender } = render(<Swapping tag="div" />);
    await flush();
    const oldRoot = screen.getByRole("radiogroup");
    const old = subtreeCallbacks.find((c) => c.target === oldRoot);
    expect(old).toBeDefined();
    rerender(<Swapping tag="section" />);
    await flush();
    expect(screen.getByRole("radiogroup").tagName).toBe("SECTION");
    expect(tabStops()).toEqual(["a"]);
    act(() => screen.getByTestId("after").focus());
    // The retired root's callback runs late, with a structural change.
    act(() =>
      old?.callback(
        [{ type: "childList" } as MutationRecord],
        {} as MutationObserver
      )
    );
    await flush();
    expect(tabStops()).toEqual(["a"]);
    expect(document.activeElement).toBe(screen.getByTestId("after"));
  });

  test("consumer ref cleanups run on unmount and when a chip's element is replaced", async () => {
    const rootCleanup = vi.fn();
    const chipCleanup = vi.fn();
    const rootRef = () => rootCleanup;
    const chipRef = () => chipCleanup;
    function Refs({ tag }: { tag: "span" | "div" }) {
      return (
        <FilterChips aria-label="Letters" ref={rootRef}>
          <FilterChip ref={chipRef} render={React.createElement(tag)} value="a">
            a
          </FilterChip>
        </FilterChips>
      );
    }
    const { rerender, unmount } = render(<Refs tag="span" />);
    await flush();
    rerender(<Refs tag="div" />);
    await flush();
    expect(chipCleanup).toHaveBeenCalledTimes(1);
    unmount();
    expect(chipCleanup).toHaveBeenCalledTimes(2);
    expect(rootCleanup).toHaveBeenCalledTimes(1);
  });

  test("unmounting the row while its focused chip is gone does not focus anything", async () => {
    function Host({ show, values }: { show: boolean; values: string[] }) {
      return show ? <Letters values={values} /> : <p>gone</p>;
    }
    const { rerender } = render(<Host show values={["a", "b"]} />);
    await flush();
    act(() => radio("a")?.focus());
    act(() => {
      rerender(<Host show values={["b"]} />);
      rerender(<Host show={false} values={["b"]} />);
    });
    await flush();
    expect(document.activeElement).toBe(document.body);
  });
});

// ---------------------------------------------------------------------------
// Server render: the same tab indexes on the server and the first client render
// ---------------------------------------------------------------------------

describe("FilterChips server tab indexes", () => {
  const states: [string, Spec[], string | null][] = [
    ["a selected chip", FOUR, "Color"],
    ["no value", FOUR, null],
    ["an unmatched value", FOUR, "zzz"],
    ["an empty row", [], null],
    [
      "every chip unavailable",
      FOUR.map((c) => ({ ...c, disabled: true })),
      null,
    ],
  ];
  test.each(states)(
    "%s: the server's tab indexes hydrate unchanged, then converge on the entry target",
    async (_label, chips, value) => {
      const html = renderToString(<Row chips={chips} value={value} />);
      const host = document.createElement("div");
      host.innerHTML = html;
      document.body.append(host);
      const indexes = () =>
        [...host.querySelectorAll('[role="radio"]')].map((el) =>
          el.getAttribute("tabindex")
        );
      const server = indexes();
      // The server gives no chip a Tab stop.
      expect(server).toEqual(chips.map(() => "-1"));
      let firstClientSeen = false;
      let firstClient: (string | null)[] = [];
      const probe = (node: HTMLDivElement | null) => {
        if (node && !firstClientSeen) {
          firstClientSeen = true;
          firstClient = indexes();
        }
      };
      let root: ReturnType<typeof hydrateRoot> | undefined;
      try {
        await act(async () => {
          root = hydrateRoot(
            host,
            <Row chips={chips} ref={probe} value={value} />
          );
        });
        await flush();
        expect(messages(errorSpy)).toEqual([]);
        expect(firstClientSeen).toBe(true);
        expect(firstClient).toEqual(server);
        const selected = chips.find(
          (c) => c.value === value && !c.disabled
        )?.value;
        const first = chips.find((c) => !c.disabled)?.value;
        const want = selected ?? first;
        const stops = [...host.querySelectorAll('[role="radio"]')]
          .filter((el) => el.getAttribute("tabindex") === "0")
          .map((el) => el.textContent?.split(" ")[0]);
        expect(stops).toEqual(want ? [want] : []);
      } finally {
        act(() => root?.unmount());
        host.remove();
      }
    }
  );
  // Known limit: a chip focused from code while the row mounts or hydrates
  // keeps the Tab stop on the entry chip until focus next moves. Stated limit.
  test.fails("a chip ref that focuses while hydrating selects nothing, and the focused chip is the only stop", async () => {
    const onValueChange = vi.fn();
    const focusOnAttach = (node: HTMLSpanElement | null) => node?.focus();
    const row = (ref?: (node: HTMLSpanElement | null) => void) => (
      <>
        <FilterChips
          aria-label="Topic"
          defaultValue="a"
          onValueChange={onValueChange}
        >
          <FilterChip value="a">a</FilterChip>
          <FilterChip ref={ref} value="b">
            b
          </FilterChip>
          <FilterChip value="c">c</FilterChip>
        </FilterChips>
        <button type="button">after</button>
      </>
    );
    const host = document.createElement("div");
    host.innerHTML = renderToString(row());
    document.body.append(host);
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(host, row(focusOnAttach));
      });
      await flush();
      const b = host.querySelectorAll('[role="radio"]')[1] as HTMLElement;
      expect(document.activeElement).toBe(b);
      expect(onValueChange).not.toHaveBeenCalled();
      const stops = () =>
        [...host.querySelectorAll('[role="radio"]')]
          .filter((el) => el.getAttribute("tabindex") === "0")
          .map((el) => el.textContent);
      expect(stops()).toEqual(["b"]);
      act(() => (host.querySelector("button") as HTMLElement).focus());
      await flush();
      expect(stops()).toEqual(["a"]);
      expect(onValueChange).not.toHaveBeenCalled();
    } finally {
      act(() => root?.unmount());
      host.remove();
    }
  });
});

// ---------------------------------------------------------------------------
// Duplicate values, read from each chip's own input
// ---------------------------------------------------------------------------

describe("FilterChips child-only value changes", () => {
  test.each([
    ["with a count", 2],
    ["at count zero", 0],
  ])(
    "a value changed only in a child drives the entry target and activation (%s)",
    async (_label, middleCount) => {
      const onValueChange = vi.fn();
      let setMiddle: (value: string) => void = () => undefined;
      function Middle() {
        const [value, setValue] = React.useState("b");
        setMiddle = setValue;
        return (
          <FilterChip count={middleCount} data-v="middle" value={value}>
            middle
          </FilterChip>
        );
      }
      render(
        <>
          <FilterChips
            aria-label="Letters"
            onValueChange={onValueChange}
            value="b"
          >
            <FilterChip count={1} data-v="a" value="a">
              a
            </FilterChip>
            <Middle />
            <FilterChip count={1} data-v="c" value="c">
              c
            </FilterChip>
          </FilterChips>
          <button data-testid="after" type="button">
            after
          </button>
        </>
      );
      await flush();
      expect(tabStops()).toEqual([`middle ${middleCount}`]);
      // The child alone changes its value: nothing is checked and the row
      // is entered on its first chip.
      act(() => setMiddle("x"));
      await flush();
      expect(onValueChange).not.toHaveBeenCalled();
      expect(checkedValues()).toEqual([]);
      expect(tabStops()).toEqual(["a 1"]);
      // An arrow from the first chip reaches the middle chip and reports
      // its new value, unless the zero rule now disables it.
      act(() => radio("a")?.focus());
      fireEvent.keyDown(radio("a") as HTMLElement, { key: "ArrowRight" });
      await flush();
      if (middleCount === 0) {
        expect(document.activeElement).toBe(radio("c"));
        expect(onValueChange.mock.calls.map((c) => c[0])).toEqual(["c"]);
      } else {
        expect(document.activeElement).toBe(radio("middle"));
        expect(onValueChange.mock.calls.map((c) => c[0])).toEqual(["x"]);
      }
      // Focus leaves; the child alone changes back to the row's value: it is
      // checked again and is the entry target.
      act(() => screen.getByTestId("after").focus());
      act(() => setMiddle("b"));
      await flush();
      expect(checkedValues()).toEqual([`middle ${middleCount}`]);
      expect(tabStops()).toEqual([`middle ${middleCount}`]);
    }
  );
});

describe("FilterChips duplicate values", () => {
  const duplicates = () =>
    messages(errorSpy).filter((m: string) => m.includes("share the value"));

  function Child({ initial }: { initial: string }) {
    const [value, setValue] = React.useState(initial);
    childSetters.push(setValue);
    return (
      <FilterChip data-v={`child-${initial}`} value={value}>
        second
      </FilterChip>
    );
  }
  const childSetters: ((v: string) => void)[] = [];
  beforeEach(() => {
    childSetters.length = 0;
  });

  test("a value changed only in a child is reported once, and a harmless re-render does not repeat it", async () => {
    const { rerender } = render(
      <FilterChips aria-label="Letters">
        <FilterChip value="a">first</FilterChip>
        <Child initial="b" />
      </FilterChips>
    );
    await flush();
    expect(duplicates()).toEqual([]);
    act(() => childSetters.at(-1)?.("a"));
    await flush();
    expect(duplicates()).toHaveLength(1);
    expect(duplicates()[0]).toContain('"a"');
    rerender(
      <FilterChips aria-label="Letters" className="x">
        <FilterChip value="a">first</FilterChip>
        <Child initial="b" />
      </FilterChips>
    );
    await flush();
    expect(duplicates()).toHaveLength(1);
  });

  test.each([
    ["inserted after the first", ["a", "b", "a"]],
    ["empty strings", ["", "b", ""]],
  ])("reports duplicates %s", async (_label, values) => {
    const { rerender } = render(
      <Row chips={[{ value: values[0] as string }]} />
    );
    await flush();
    rerender(<Row chips={values.map((value) => ({ value }))} />);
    await flush();
    expect(duplicates()).toHaveLength(1);
  });

  test("reports duplicates on hidden and disabled chips", async () => {
    render(
      <FilterChips aria-label="Letters">
        <FilterChip value="a">a</FilterChip>
        <FilterChip disabled value="b">
          b
        </FilterChip>
        <FilterChip style={{ display: "none" }} value="b">
          b again
        </FilterChip>
      </FilterChips>
    );
    await flush();
    expect(duplicates()).toHaveLength(1);
    expect(duplicates()[0]).toContain('"b"');
  });

  test("ignores stray inputs and equal values in a nested row", async () => {
    render(
      <FilterChips aria-label="Outer">
        <FilterChip value="a">a</FilterChip>
        <input readOnly type="radio" value="a" />
        <div>
          <FilterChips aria-label="Inner">
            <FilterChip value="a">inner a</FilterChip>
          </FilterChips>
        </div>
      </FilterChips>
    );
    await flush();
    expect(duplicates()).toEqual([]);
  });

  test("reads the current input after a chip's element is replaced, and never treats a missing input as 'on'", async () => {
    function Swap({ tag, values }: { tag: "span" | "div"; values: string[] }) {
      return (
        <FilterChips aria-label="Letters">
          {values.map((v) => (
            <FilterChip
              data-v={v}
              key={v}
              render={v === "x" ? React.createElement(tag) : undefined}
              value={v}
            >
              {v}
            </FilterChip>
          ))}
        </FilterChips>
      );
    }
    const { rerender } = render(<Swap tag="span" values={["x", "on"]} />);
    await flush();
    rerender(<Swap tag="div" values={["x", "on"]} />);
    await flush();
    // Take x's input out of the document; a later structural change must
    // not read it as the radio default "on".
    const xInput = radio("x")?.nextElementSibling as HTMLElement;
    expect(xInput.tagName).toBe("INPUT");
    xInput.remove();
    rerender(<Swap tag="div" values={["x", "on", "y"]} />);
    await flush();
    expect(duplicates()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// The focus record across a re-attached row ref and a window that loses focus
// ---------------------------------------------------------------------------

describe("FilterChips focus record: inline row ref and window blur", () => {
  let attached: HTMLDivElement | null = null;
  function InlineRef({ values }: { values: string[] }) {
    return (
      <>
        <FilterChips
          aria-label="Letters"
          // A new callback on every render, as an app would write it.
          // biome-ignore lint/performance/noJsxPropsBind: the new callback on every render is what this test needs
          ref={(node: HTMLDivElement | null) => {
            attached = node;
          }}
        >
          {values.map((v) => (
            <FilterChip data-v={v} key={v} value={v}>
              {v}
            </FilterChip>
          ))}
        </FilterChips>
        <button data-testid="after" type="button">
          after
        </button>
      </>
    );
  }

  test("with an inline row ref, removing the focused chip still recovers to the entry target", async () => {
    const { rerender } = render(<InlineRef values={["a", "b", "c"]} />);
    await flush();
    act(() => radio("b")?.focus());
    await flush();
    rerender(<InlineRef values={["a", "c"]} />);
    await flush();
    expect(attached).toBe(screen.getByRole("radiogroup"));
    expect(document.activeElement).toBe(radio("a"));
    expect(checkedValues()).toEqual([]);
  });

  test("with an inline row ref, a re-render keeps the record and a later removal recovers", async () => {
    const { rerender } = render(<InlineRef values={["a", "b", "c"]} />);
    await flush();
    act(() => radio("b")?.focus());
    await flush();
    rerender(<InlineRef values={["a", "b", "c", "d"]} />);
    await flush();
    expect(document.activeElement).toBe(radio("b"));
    rerender(<InlineRef values={["a", "c", "d"]} />);
    await flush();
    expect(document.activeElement).toBe(radio("a"));
  });

  test("with an inline row ref, a retired record stays retired", async () => {
    const { rerender } = render(<InlineRef values={["a", "b", "c"]} />);
    await flush();
    act(() => radio("b")?.focus());
    act(() => screen.getByTestId("after").focus());
    act(() => screen.getByTestId("after").blur());
    rerender(<InlineRef values={["a", "c"]} />);
    await flush();
    rerender(<InlineRef values={["a", "c", "d"]} />);
    await flush();
    expect(document.activeElement).toBe(document.body);
  });

  test("a blur that leaves the chip the active element (the window lost focus) keeps the record", async () => {
    const { rerender } = render(<Letters values={["a", "b", "c"]} />);
    await flush();
    act(() => radio("b")?.focus());
    await flush();
    // The window loses focus: blur and focusout reach the chip, which stays
    // the document's active element.
    fireEvent.blur(radio("b") as HTMLElement);
    await flush();
    expect(document.activeElement).toBe(radio("b"));
    rerender(<Letters values={["a", "c"]} />);
    await flush();
    expect(document.activeElement).toBe(radio("a"));
    expect(checkedValues()).toEqual([]);
  });

  test("leaving a chip for the page itself retires the record", async () => {
    const { rerender } = render(<Letters values={["a", "b", "c"]} />);
    await flush();
    act(() => radio("b")?.focus());
    act(() => radio("b")?.blur());
    expect(document.activeElement).toBe(document.body);
    rerender(<Letters values={["a", "c"]} />);
    await flush();
    rerender(<Letters values={["a", "c", "d"]} />);
    await flush();
    expect(document.activeElement).toBe(document.body);
  });
});

describe("FilterChips focus record: a hidden chip that focus leaves for another element", () => {
  test("hiding the focused chip and focusing elsewhere in the same task never focuses the entry target", async () => {
    const entryFocus = vi.fn();
    let hide: () => void = () => undefined;
    function Hiding() {
      const [hidden, setHidden] = React.useState(false);
      hide = () => setHidden(true);
      return (
        <>
          <FilterChips aria-label="Letters">
            <FilterChip data-v="a" onFocus={entryFocus} value="a">
              a
            </FilterChip>
            <FilterChip
              data-v="b"
              style={hidden ? { display: "none" } : undefined}
              value="b"
            >
              b
            </FilterChip>
          </FilterChips>
          <button data-testid="after" type="button">
            after
          </button>
        </>
      );
    }
    render(<Hiding />);
    await flush();
    act(() => radio("b")?.focus());
    await flush();
    act(() => {
      // The chip is hidden and the page moves focus on in the same task.
      flushSync(hide);
      expect(radio("b")?.style.display).toBe("none");
      screen.getByTestId("after").focus();
    });
    await flush();
    expect(entryFocus).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByTestId("after"));
  });
});
