import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Calendar } from "./calendar";

describe("Calendar week numbers", () => {
  // react-day-picker hands the WeekNumber slot `scope="row"` and
  // `role="rowheader"`, which are only valid on a <th>. Rendering a <td>
  // produced axe `scope-attr-valid` violations on every row.
  it("renders each week number as a row header cell", () => {
    const { container } = render(
      <Calendar
        defaultMonth={new Date(2026, 0, 12)}
        mode="single"
        showWeekNumber
      />
    );

    const cells = container.querySelectorAll('[role="rowheader"]');
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      expect(cell.tagName).toBe("TH");
      expect(cell).toHaveAttribute("scope", "row");
    }
  });
});
