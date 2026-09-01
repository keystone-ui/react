import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";

const SLIDES = ["one", "two", "three"];

function renderCarousel(props?: { withDots?: boolean }) {
  return render(
    <Carousel>
      <CarouselContent>
        {SLIDES.map((slide) => (
          <CarouselItem key={slide}>{slide}</CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      {props?.withDots ? <CarouselDots /> : null}
    </Carousel>
  );
}

// =============================================================================
// Carousel
// =============================================================================
describe("Carousel", () => {
  it("renders a region with the carousel role description", () => {
    renderCarousel();
    const root = screen.getByRole("region");
    expect(root).toHaveAttribute("aria-roledescription", "carousel");
    expect(root).toHaveAttribute("data-slot", "carousel");
  });

  it("applies custom className", () => {
    render(
      <Carousel className="custom-class">
        <CarouselContent>
          <CarouselItem>one</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    expect(screen.getByRole("region")).toHaveClass("custom-class");
  });

  // The root is a single-column grid so the arrows can take the first row —
  // CarouselContent — as their containing block. `grid-cols-1` resolves to
  // `minmax(0, 1fr)`, which pins the track to the container width instead of
  // letting the slide strip's max-content size widen it.
  it("lays the root out as a single-column grid", () => {
    renderCarousel();
    expect(screen.getByRole("region")).toHaveClass("grid", "grid-cols-1");
  });

  it("renders each slide as a group", () => {
    renderCarousel();
    const slides = screen.getAllByRole("group");
    expect(slides).toHaveLength(SLIDES.length);
    expect(slides[0]).toHaveAttribute("aria-roledescription", "slide");
  });
});

// =============================================================================
// CarouselPrevious / CarouselNext
// =============================================================================
describe("CarouselPrevious / CarouselNext", () => {
  it("renders both arrows with accessible names", () => {
    renderCarousel();
    expect(
      screen.getByRole("button", { name: "Previous slide" })
    ).toHaveAttribute("data-slot", "carousel-previous");
    expect(screen.getByRole("button", { name: "Next slide" })).toHaveAttribute(
      "data-slot",
      "carousel-next"
    );
  });

  // Arrows were centered on the whole root, so CarouselDots/CarouselCounter
  // below the slides dragged them off the slide's midline. Anchoring them to
  // the first grid row makes CarouselContent their containing block. All four
  // grid lines are required: an `auto` end line on an absolutely positioned
  // grid child resolves to the container's padding edge, not to one track.
  it("anchors both arrows to the first grid row", () => {
    renderCarousel({ withDots: true });
    for (const name of ["Previous slide", "Next slide"]) {
      expect(screen.getByRole("button", { name })).toHaveClass(
        "absolute",
        "[grid-area:1/1/2/2]"
      );
    }
  });

  it("merges a custom className onto an arrow", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>one</CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="left-2" />
      </Carousel>
    );
    expect(screen.getByRole("button", { name: "Previous slide" })).toHaveClass(
      "left-2",
      "[grid-area:1/1/2/2]"
    );
  });

  it("disables the previous arrow on the first slide", () => {
    renderCarousel();
    expect(
      screen.getByRole("button", { name: "Previous slide" })
    ).toBeDisabled();
  });
});
