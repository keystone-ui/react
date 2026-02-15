import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "./slider";

// =============================================================================
// Slider
// =============================================================================
describe("Slider", () => {
  it("renders with all parts", () => {
    render(
      <Slider defaultValue={[50]}>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    );

    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("has data-slot attributes", () => {
    render(
      <Slider data-testid="slider-root" defaultValue={[50]}>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    );

    expect(screen.getByTestId("slider-root")).toHaveAttribute(
      "data-slot",
      "slider"
    );
  });

  it("renders with the correct default value", () => {
    render(
      <Slider defaultValue={[75]}>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    );

    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAttribute("aria-valuenow", "75");
  });

  it("respects min and max props", () => {
    render(
      <Slider defaultValue={[5]} max={10} min={0}>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    );

    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAttribute("aria-valuenow", "5");
  });

  it("respects disabled prop", () => {
    render(
      <Slider data-testid="disabled-slider" defaultValue={[50]} disabled>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    );

    const root = screen.getByTestId("disabled-slider");
    expect(root).toHaveAttribute("data-disabled", "");
  });

  it("applies custom className to root", () => {
    render(
      <Slider
        className="custom-slider"
        data-testid="slider-root"
        defaultValue={[50]}
      >
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    );

    expect(screen.getByTestId("slider-root")).toHaveClass("custom-slider");
  });

  it("renders SliderValue component", () => {
    render(
      <Slider defaultValue={[50]}>
        <SliderValue data-testid="slider-value" />
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    );

    expect(screen.getByTestId("slider-value")).toBeInTheDocument();
    expect(screen.getByTestId("slider-value")).toHaveAttribute(
      "data-slot",
      "slider-value"
    );
  });

  it("renders range slider with two thumbs", () => {
    render(
      <Slider defaultValue={[25, 75]}>
        <SliderControl>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb />
            <SliderThumb />
          </SliderTrack>
        </SliderControl>
      </Slider>
    );

    const thumbs = screen.getAllByRole("slider");
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]).toHaveAttribute("aria-valuenow", "25");
    expect(thumbs[1]).toHaveAttribute("aria-valuenow", "75");
  });
});
