"use client";

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@keystoneui/react/carousel";
import { useCallback, useState } from "react";

const slides = [
  "bg-rose-100 dark:bg-rose-900/30",
  "bg-sky-100 dark:bg-sky-900/30",
  "bg-amber-100 dark:bg-amber-900/30",
  "bg-emerald-100 dark:bg-emerald-900/30",
  "bg-violet-100 dark:bg-violet-900/30",
];

export default function CarouselThumbnails() {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onThumbClick = useCallback(
    (index: number) => mainApi?.scrollTo(index),
    [mainApi]
  );

  const onMainSelect = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      thumbApi?.scrollTo(index);
    },
    [thumbApi]
  );

  return (
    <div className="mx-auto max-w-sm space-y-2">
      <Carousel onSlideChange={onMainSelect} setApi={setMainApi}>
        <CarouselContent>
          {slides.map((bg, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            <CarouselItem key={`main-${i}`}>
              <div
                className={`flex aspect-video items-center justify-center rounded-xl font-semibold text-4xl text-muted-foreground ${bg}`}
              >
                {i + 1}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <Carousel gap="0.5rem" setApi={setThumbApi}>
        <CarouselContent>
          {slides.map((bg, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static list
            <CarouselItem className="basis-1/5" key={`thumb-${i}`}>
              <button
                className={`flex aspect-video w-full cursor-pointer items-center justify-center rounded-lg font-medium text-muted-foreground text-sm transition-opacity ${bg} ${
                  i === selectedIndex
                    ? "opacity-100 ring-2 ring-ring"
                    : "opacity-50"
                }`}
                onClick={() => onThumbClick(i)}
                type="button"
              >
                {i + 1}
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
