"use client";

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@keystoneui/react/carousel";

export default function CarouselWithDots() {
  return (
    <Carousel className="mx-12 max-w-sm">
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
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots className="mt-4" />
    </Carousel>
  );
}
