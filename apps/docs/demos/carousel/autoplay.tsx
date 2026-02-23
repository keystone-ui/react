"use client";

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from "@keystoneui/react/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function CarouselAutoplay() {
  return (
    <Carousel className="max-w-sm" plugins={[Autoplay({ delay: 3000 })]}>
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static demo list
          <CarouselItem key={`slide-${i}`}>
            <div className="flex aspect-video items-center justify-center rounded-lg border bg-muted">
              <span className="font-semibold text-3xl">{i + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselDots className="mt-4" />
    </Carousel>
  );
}
