import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DateInput } from "./date-input";

/**
 * The calendar button calls `showPicker()` on the input. jsdom does not
 * implement it (and in a browser it opens native chrome outside the DOM), so
 * the observable fact is the call itself: a spy on the prototype records
 * which element it ran against.
 *
 * Three ref shapes, because the bug was shape-specific: the component used
 * the forwarded ref *instead of* its own, so a callback ref -- what
 * `register()` from react-hook-form returns -- left `.current` undefined and
 * the button did nothing.
 */
const PICKER_BUTTON = /open date picker/i;

const proto = HTMLInputElement.prototype as HTMLInputElement & {
  showPicker?: () => void;
};
const hadShowPicker = "showPicker" in proto;
const original = proto.showPicker;
let showPicker: ReturnType<typeof vi.fn>;

beforeEach(() => {
  showPicker = vi.fn();
  proto.showPicker = showPicker as unknown as () => void;
});

afterEach(() => {
  if (hadShowPicker) {
    proto.showPicker = original;
  } else {
    Reflect.deleteProperty(proto, "showPicker");
  }
});

function pickerButton() {
  return screen.getByRole("button", { name: PICKER_BUTTON });
}

describe("DateInput picker button", () => {
  it("opens the picker when no ref is forwarded", async () => {
    render(<DateInput />);
    await userEvent.click(pickerButton());

    expect(showPicker).toHaveBeenCalledTimes(1);
    expect(showPicker.mock.instances[0]).toBe(
      document.querySelector('input[type="date"]')
    );
  });

  it("opens the picker and fills an object ref", async () => {
    const ref = createRef<HTMLInputElement>();
    render(<DateInput ref={ref} />);

    expect(ref.current).toBe(document.querySelector('input[type="date"]'));

    await userEvent.click(pickerButton());
    expect(showPicker).toHaveBeenCalledTimes(1);
    expect(showPicker.mock.instances[0]).toBe(ref.current);
  });

  it("opens the picker and calls a callback ref with the input", async () => {
    const callbackRef = vi.fn();
    render(<DateInput ref={callbackRef} />);

    const input = document.querySelector('input[type="date"]');
    expect(callbackRef).toHaveBeenCalledWith(input);

    await userEvent.click(pickerButton());
    expect(showPicker).toHaveBeenCalledTimes(1);
    expect(showPicker.mock.instances[0]).toBe(input);
  });
});
