"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@keystoneui/react/carousel";

export default function CarouselSizes() {
  return (
    <Carousel className="mx-12 max-w-sm" opts={{ align: "start" }}>
      <CarouselContent>
        {Array.from({ length: 8 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static list
          <CarouselItem className="basis-1/2 lg:basis-1/3" key={`slide-${i}`}>
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
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
