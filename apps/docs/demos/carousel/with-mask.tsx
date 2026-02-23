"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@keystoneui/react/carousel";

export default function CarouselWithMask() {
  return (
    <Carousel className="mx-12 max-w-lg">
      <CarouselContent mask>
        {Array.from({ length: 8 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list
          <CarouselItem className="basis-1/3" key={`slide-${i}`}>
            <div className="flex aspect-video items-center justify-center rounded-lg border bg-muted">
              <span className="font-semibold text-2xl">{i + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
