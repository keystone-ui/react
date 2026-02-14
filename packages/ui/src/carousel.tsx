"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  /** Callback fired with the selected snap index when the active slide changes */
  onSlideChange?: (index: number) => void;
  /**
   * When true, prev/next buttons are hidden by default and revealed on hover.
   * Arrow components read this from context and apply the appropriate classes.
   */
  autoHideArrows?: boolean;
  /**
   * Gap between slides. Accepts any CSS length value.
   * Set as `--carousel-gap` custom property on the root element.
   * @default "1rem"
   */
  gap?: string;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  selectedIndex: number;
  slideCount: number;
  autoHideArrows: boolean;
} & Pick<CarouselProps, "orientation">;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

// ---------------------------------------------------------------------------
// Carousel (root)
// ---------------------------------------------------------------------------

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  onSlideChange,
  autoHideArrows = false,
  gap = "1rem",
  className,
  children,
  style,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );

  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [slideCount, setSlideCount] = React.useState(0);

  const onSelect = React.useCallback(
    (emblaApi: CarouselApi) => {
      if (!emblaApi) return;
      const index = emblaApi.selectedScrollSnap();
      setSelectedIndex(index);
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      onSlideChange?.(index);
    },
    [onSlideChange]
  );

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;

    setSlideCount(api.scrollSnapList().length);
    onSelect(api);

    api.on("reInit", onSelect);
    api.on("select", onSelect);
    api.on("reInit", () => setSlideCount(api.scrollSnapList().length));

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        selectedIndex,
        slideCount,
        autoHideArrows,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("group/carousel relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        style={
          { "--carousel-gap": gap, ...style } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// CarouselContent
// ---------------------------------------------------------------------------

function CarouselContent({
  className,
  mask = false,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * When true, applies a CSS `mask-image` fade on edges that have
   * more content to scroll to. The fade width is controlled by the
   * `--carousel-mask-width` CSS variable (default `4rem`).
   */
  mask?: boolean;
}) {
  const { carouselRef, orientation, canScrollPrev, canScrollNext } =
    useCarousel();

  const maskStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    if (!mask) return undefined;
    const w = "var(--carousel-mask-width, 4rem)";
    const dir = orientation === "horizontal" ? "to right" : "to bottom";
    let value: string | undefined;

    if (canScrollPrev && canScrollNext) {
      value = `linear-gradient(${dir}, transparent, black ${w}, black calc(100% - ${w}), transparent)`;
    } else if (canScrollPrev) {
      value = `linear-gradient(${dir}, transparent, black ${w})`;
    } else if (canScrollNext) {
      value = `linear-gradient(${dir}, black calc(100% - ${w}), transparent)`;
    }

    if (!value) return undefined;
    return {
      maskImage: value,
      WebkitMaskImage: value,
    };
  }, [mask, orientation, canScrollPrev, canScrollNext]);

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content"
      style={{ ...maskStyle, ...style }}
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal"
            ? "[margin-inline-start:calc(var(--carousel-gap)*-1)]"
            : "[margin-top:calc(var(--carousel-gap)*-1)] flex-col",
          className
        )}
        {...props}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CarouselItem
// ---------------------------------------------------------------------------

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal"
          ? "[padding-inline-start:var(--carousel-gap)]"
          : "[padding-top:var(--carousel-gap)]",
        className
      )}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// CarouselPrevious
// ---------------------------------------------------------------------------

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon-xs",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev, autoHideArrows } =
    useCarousel();

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute z-10 touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-8 -translate-y-1/2"
          : "-top-8 left-1/2 -translate-x-1/2 rotate-90",
        autoHideArrows &&
          "opacity-0 transition-opacity group-hover/carousel:opacity-100",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

// ---------------------------------------------------------------------------
// CarouselNext
// ---------------------------------------------------------------------------

function CarouselNext({
  className,
  variant = "outline",
  size = "icon-xs",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext, autoHideArrows } =
    useCarousel();

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute z-10 touch-manipulation rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-8 -translate-y-1/2"
          : "-bottom-8 left-1/2 -translate-x-1/2 rotate-90",
        autoHideArrows &&
          "opacity-0 transition-opacity group-hover/carousel:opacity-100",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRightIcon />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

// ---------------------------------------------------------------------------
// CarouselDots
// ---------------------------------------------------------------------------

function CarouselDots({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { api, selectedIndex, slideCount } = useCarousel();

  if (slideCount <= 1) return null;

  return (
    <div
      data-slot="carousel-dots"
      className={cn("mt-3 flex items-center justify-center gap-1.5", className)}
      {...props}
    >
      {Array.from({ length: slideCount }).map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          data-active={index === selectedIndex || undefined}
          className={cn(
            "h-2 cursor-pointer rounded-full transition-all duration-300",
            index === selectedIndex
              ? "w-4 bg-foreground"
              : "w-2 bg-foreground/25 hover:bg-foreground/50"
          )}
          onClick={() => api?.scrollTo(index)}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CarouselCounter
// ---------------------------------------------------------------------------

function CarouselCounter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { selectedIndex, slideCount } = useCarousel();

  if (slideCount <= 1) return null;

  return (
    <div
      data-slot="carousel-counter"
      className={cn(
        "text-muted-foreground mt-3 text-center text-sm tabular-nums",
        className
      )}
      {...props}
    >
      {selectedIndex + 1} / {slideCount}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  type CarouselApi,
  type CarouselOptions,
  type CarouselPlugin,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselCounter,
  useCarousel,
};
