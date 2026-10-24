import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "./carousel";

/**
 * `useEmblaCarousel` is the one seam between the component and embla's
 * engine, and it is the only thing mocked here. The real engine needs layout
 * measurements jsdom cannot produce, and what this file checks is purely the
 * component's own bookkeeping: that every listener it registers on the API
 * is removed again on unmount, with the same function, and that the context
 * value is stable across renders. `carousel.test.tsx` keeps exercising the
 * real hook for everything else.
 *
 * `vi.mock` factories are hoisted above module-scope declarations, so the
 * fake is built inside `vi.hoisted`.
 */
type Listener = (...args: unknown[]) => void;

const embla = vi.hoisted(() => {
  const onCalls: [string, Listener][] = [];
  const offCalls: [string, Listener][] = [];
  const api = {
    on(event: string, cb: Listener) {
      onCalls.push([event, cb]);
      return api;
    },
    off(event: string, cb: Listener) {
      offCalls.push([event, cb]);
      return api;
    },
    scrollSnapList: () => [0, 0.5, 1],
    selectedScrollSnap: () => 0,
    canScrollPrev: () => false,
    canScrollNext: () => true,
    scrollPrev: () => {},
    scrollNext: () => {},
    scrollTo: () => {},
  };
  // A stable ref callback: a fresh function per render would defeat the
  // memoisation this file asserts, for reasons unrelated to the component.
  const emblaRef = () => {};
  return { api, emblaRef, onCalls, offCalls };
});

vi.mock("embla-carousel-react", () => ({
  default: () => [embla.emblaRef, embla.api],
}));

function Slides() {
  return (
    <CarouselContent>
      <CarouselItem>one</CarouselItem>
      <CarouselItem>two</CarouselItem>
      <CarouselItem>three</CarouselItem>
    </CarouselContent>
  );
}

describe("Carousel embla listeners", () => {
  it("removes every listener it added, with the same function, on unmount", () => {
    embla.onCalls.length = 0;
    embla.offCalls.length = 0;

    const { unmount } = render(
      <Carousel>
        <Slides />
      </Carousel>
    );
    expect(embla.onCalls.length).toBeGreaterThan(0);

    unmount();

    // Pair each `on` with an `off` for the same event and the same function.
    // Counting alone would not catch an inline arrow that is registered and
    // then "removed" with a different closure.
    const unmatched = embla.onCalls.filter(
      ([event, cb]) => !embla.offCalls.some(([e, c]) => e === event && c === cb)
    );
    expect(unmatched.map(([event]) => event)).toEqual([]);
    expect(embla.offCalls).toHaveLength(embla.onCalls.length);
  });
});

describe("Carousel context", () => {
  it("keeps the same context object when nothing it carries has changed", () => {
    const seen: unknown[] = [];
    function Probe() {
      seen.push(useCarousel());
      return null;
    }

    // A fresh element each time: React skips the re-render outright when it
    // is handed the very same element object, which would leave nothing to
    // compare. `render` flushes the mount effects (and the state they set)
    // before returning, so the two renders compared here differ in nothing
    // the context carries.
    const tree = () => (
      <Carousel>
        <Slides />
        <Probe />
      </Carousel>
    );
    const { rerender } = render(tree());
    const beforeRerender = seen.length;
    rerender(tree());

    expect(seen.length).toBe(beforeRerender + 1);
    expect(seen.at(-1)).toBe(seen.at(-2));
  });
});
