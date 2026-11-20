// @vitest-environment jsdom

/**
 * A page can hold two copies of the same date-picker example (a docs page, a
 * form with a start and an end date). Each labelled example must then wire
 * its label, its control and its hint or error to its own copy, so every id
 * comes from `useId` and none is written by hand.
 *
 * Every check runs against the SECOND copy: a hand-written id would resolve
 * to the first copy's element, so only the second copy can tell them apart.
 */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { createElement, Fragment, type FunctionComponent } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import DatePickerDateOfBirth from "@/demos/date-picker/date-of-birth";
import DatePickerForm from "@/demos/date-picker/form";
import DatePickerQuickPicks from "@/demos/date-picker/quick-picks";
import DatePickerRange from "@/demos/date-picker/range";
import DatePickerWithInput from "@/demos/date-picker/with-input";
import DatePickerWithTime from "@/demos/date-picker/with-time";

const INPUT_ERROR = "Enter a date such as June 1, 2025 or 2025-06-01.";
const FORM_HINT = "Your plan starts on this day.";
const FORM_ERROR = "Choose a start date.";
const START_DATE = /^Start date/;

type Copy = HTMLElement;

interface Example {
  Demo: FunctionComponent;
  dialog: string;
  /** Each label's text and the control it must name, found structurally. */
  labels: [string, (copy: Copy) => HTMLElement][];
  name: string;
  /** Puts one copy into the state that carries aria references. */
  prepare?: (copy: Copy) => void;
  /** The control that opens the popup, and the popup's accessible name. */
  trigger: (copy: Copy) => HTMLElement;
}

const firstButton = (copy: Copy) => within(copy).getAllByRole("button")[0];
const textbox = (copy: Copy) => within(copy).getByRole("textbox");

function enterInvalidDate(copy: Copy) {
  const input = textbox(copy);
  fireEvent.change(input, { target: { value: "not a date" } });
  fireEvent.blur(input);
}

const EXAMPLES: Example[] = [
  {
    name: "range",
    Demo: DatePickerRange,
    labels: [["Stay", firstButton]],
    trigger: firstButton,
    dialog: "Choose stay dates",
  },
  {
    name: "date-of-birth",
    Demo: DatePickerDateOfBirth,
    labels: [["Date of birth", firstButton]],
    trigger: firstButton,
    dialog: "Choose date of birth",
  },
  {
    name: "with-input",
    Demo: DatePickerWithInput,
    labels: [["Subscription date", textbox]],
    trigger: (copy) =>
      within(copy).getByRole("button", { name: "Choose date" }),
    dialog: "Choose subscription date",
    prepare: enterInvalidDate,
  },
  {
    name: "with-time",
    Demo: DatePickerWithTime,
    labels: [
      ["Date", firstButton],
      [
        "Time",
        (copy) =>
          copy.querySelector<HTMLElement>('input[type="time"]') as HTMLElement,
      ],
    ],
    trigger: firstButton,
    dialog: "Choose a date",
  },
  {
    name: "quick-picks",
    Demo: DatePickerQuickPicks,
    labels: [["Publish on", firstButton]],
    trigger: firstButton,
    dialog: "Choose publication date",
  },
  {
    name: "form",
    Demo: DatePickerForm,
    labels: [["Start date", firstButton]],
    trigger: firstButton,
    dialog: "Choose start date",
  },
];

beforeEach(() => {
  // Only `Date` is faked: Base UI's own timers keep running. Local noon keeps
  // every example's "today" on June 15 whatever the machine's time zone.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function renderTwice(Demo: FunctionComponent) {
  const { container } = render(
    createElement(
      Fragment,
      null,
      createElement("section", { "data-copy": "1" }, createElement(Demo)),
      createElement("section", { "data-copy": "2" }, createElement(Demo))
    )
  );
  const [first, second] = [
    ...container.querySelectorAll<HTMLElement>("section[data-copy]"),
  ];
  return { container, first, second };
}

function labelIn(copy: Copy, text: string) {
  const label = [...copy.querySelectorAll("label")].find(
    (el) => el.textContent?.trim() === text
  );
  expect(label, `label "${text}"`).toBeDefined();
  return label as HTMLLabelElement;
}

describe.each(EXAMPLES)("date picker $name, rendered twice", (example) => {
  it("gives every element a unique id", () => {
    expect.hasAssertions();
    const { container, first, second } = renderTwice(example.Demo);
    example.prepare?.(first);
    example.prepare?.(second);
    const ids = [...container.querySelectorAll("[id]")].map((el) => el.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each label names its intended control in the second copy and passes its click there", () => {
    expect.hasAssertions();
    const { first, second } = renderTwice(example.Demo);
    // Every label in the copy is accounted for in the table.
    expect(second.querySelectorAll("label")).toHaveLength(
      example.labels.length
    );
    for (const [text, find] of example.labels) {
      const label = labelIn(second, text);
      const intended = find(second);
      const twin = find(first);
      expect(intended).not.toBe(twin);
      expect(label.control, text).toBe(intended);

      const clicks: EventTarget[] = [];
      const record = (event: Event) =>
        clicks.push(event.currentTarget as EventTarget);
      intended.addEventListener("click", record);
      twin.addEventListener("click", record);
      fireEvent.click(label);
      intended.removeEventListener("click", record);
      twin.removeEventListener("click", record);
      expect(clicks, `click on label "${text}"`).toEqual([intended]);
      // A trigger the click opened is closed again for the next label.
      fireEvent.keyDown(document.activeElement ?? document.body, {
        key: "Escape",
      });
    }
  });

  it("every aria reference resolves inside its own copy", () => {
    expect.hasAssertions();
    const { first, second } = renderTwice(example.Demo);
    example.prepare?.(first);
    example.prepare?.(second);
    const referencing = second.querySelectorAll(
      "[aria-labelledby], [aria-describedby]"
    );
    expect(referencing.length).toBeGreaterThan(0);
    for (const el of referencing) {
      const refs = [
        ...(el.getAttribute("aria-labelledby") ?? "").split(" "),
        ...(el.getAttribute("aria-describedby") ?? "").split(" "),
      ].filter(Boolean);
      expect(refs.length).toBeGreaterThan(0);
      for (const ref of refs) {
        const target = second.ownerDocument.getElementById(ref);
        expect(target, ref).not.toBeNull();
        expect(second.contains(target)).toBe(true);
      }
    }
  });

  it("the second copy's trigger opens its own named dialog and the first stays closed", () => {
    expect.hasAssertions();
    const { first, second } = renderTwice(example.Demo);
    const firstTrigger = example.trigger(first);
    const secondTrigger = example.trigger(second);
    expect(screen.queryAllByRole("dialog")).toHaveLength(0);

    fireEvent.click(secondTrigger);

    const dialogs = screen.getAllByRole("dialog");
    expect(dialogs).toHaveLength(1);
    expect(screen.getByRole("dialog", { name: example.dialog })).toBe(
      dialogs[0]
    );
    expect(secondTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(firstTrigger.getAttribute("aria-expanded")).toBe("false");
    const controls = secondTrigger.getAttribute("aria-controls");
    if (controls) {
      expect(dialogs[0].id).toBe(controls);
    }
  });
});

describe("date picker with-input, both copies in error", () => {
  it("describes the second control by the second copy's own error", () => {
    expect.hasAssertions();
    const { first, second } = renderTwice(DatePickerWithInput);
    enterInvalidDate(first);
    enterInvalidDate(second);

    const errors = screen.getAllByText(INPUT_ERROR);
    expect(errors).toHaveLength(2);
    const [firstError, secondError] = errors;
    expect(first.contains(firstError)).toBe(true);
    expect(second.contains(secondError)).toBe(true);

    const input = within(second).getByRole("textbox", {
      name: "Subscription date",
      description: INPUT_ERROR,
    });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(secondError.id).not.toBe("");
    expect(input.getAttribute("aria-describedby")).toBe(secondError.id);
    expect(input.getAttribute("aria-describedby")).not.toBe(firstError.id);
  });
});

describe("date picker form, rendered twice", () => {
  it("describes the second trigger by its own hint, then by its own error after submission", () => {
    expect.hasAssertions();
    const { first, second } = renderTwice(DatePickerForm);
    const trigger = (copy: Copy) =>
      within(copy).getByRole("button", { name: START_DATE });

    // Before submission: the hint.
    const hint = within(second).getByText(FORM_HINT);
    expect(
      within(second).getByRole("button", {
        name: START_DATE,
        description: FORM_HINT,
      })
    ).toBe(trigger(second));
    expect(trigger(second).getAttribute("aria-describedby")).toBe(hint.id);
    expect(hint.id).not.toBe(within(first).getByText(FORM_HINT).id);

    // Submitting only the second copy errors only the second copy.
    fireEvent.submit(second.querySelector("form") as HTMLFormElement);
    const error = within(second).getByText(FORM_ERROR);
    expect(
      within(second).getByRole("button", {
        name: START_DATE,
        description: FORM_ERROR,
      })
    ).toBe(trigger(second));
    expect(trigger(second).getAttribute("aria-describedby")).toBe(error.id);
    expect(within(first).queryByText(FORM_ERROR)).toBeNull();
    expect(
      within(first).getByRole("button", {
        name: START_DATE,
        description: FORM_HINT,
      })
    ).toBe(trigger(first));
  });
});
