"use client";

import { Button } from "@keystoneui/react/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@keystoneui/react/carousel";
import { useState } from "react";

export default function CarouselControlled() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <Carousel onSlideChange={setCurrent} setApi={setApi}>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            <CarouselItem key={`slide-${i}`}>
              <div className="flex aspect-video items-center justify-center rounded-lg border bg-muted">
                <span className="font-semibold text-3xl">{i + 1}</span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Button
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            key={`btn-${i}`}
            onClick={() => api?.scrollTo(i)}
            size="sm"
            variant={i === current ? "default" : "outline"}
          >
            {i + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}
