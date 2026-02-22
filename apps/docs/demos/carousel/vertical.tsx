"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@keystoneui/react/carousel";

export default function CarouselVertical() {
  return (
    <Carousel className="max-w-xs" orientation="vertical">
      <CarouselContent className="h-[240px]">
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static demo list
          <CarouselItem key={`slide-${i}`}>
            <div className="flex h-full items-center justify-center rounded-lg border bg-muted">
              <span className="font-semibold text-3xl">{i + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
