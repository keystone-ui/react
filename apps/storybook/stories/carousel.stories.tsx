import { Button } from "@keystone/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@keystone/ui/card";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselCounter,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from "@keystone/ui/carousel";
import type { Meta, StoryObj } from "@storybook/react-vite";
import Autoplay from "embla-carousel-autoplay";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SlideBox({ index, className }: { index: number; className?: string }) {
  return (
    <div
      className={`flex aspect-video items-center justify-center rounded-xl bg-muted font-semibold text-4xl text-muted-foreground ${className ?? ""}`}
    >
      {index + 1}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Components/Carousel",
  component: Carousel,
  parameters: {
    docs: {
      description: {
        component: `
A composable carousel component built on [Embla Carousel](https://www.embla-carousel.com/). Supports horizontal/vertical orientation, dot pagination, a slide counter, CSS mask edge fading, auto-hide arrows, and extensibility via Embla plugins.

\`\`\`tsx
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselCounter,
} from "@keystone/ui/carousel";

// Basic usage
<Carousel>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
    <CarouselItem>Slide 3</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>

// With dots
<Carousel>
  <CarouselContent>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
  </CarouselContent>
  <CarouselDots />
</Carousel>

// With CSS mask fade
<Carousel>
  <CarouselContent mask>
    <CarouselItem>Slide 1</CarouselItem>
    <CarouselItem>Slide 2</CarouselItem>
  </CarouselContent>
</Carousel>
\`\`\`

## Sizes

Set the size of items with the \`basis\` utility class on \`CarouselItem\`. Use responsive classes like \`basis-1/2 lg:basis-1/3\` for different breakpoints.

## Spacing

Control the gap between slides with the \`gap\` prop on \`Carousel\`. Defaults to \`"1rem"\`.

The value is set as the \`--carousel-gap\` CSS custom property on the root element, which \`CarouselContent\` and \`CarouselItem\` reference internally.

**Recommended values:**
- **Tight** (image grids): \`gap="0.25rem"\` or \`gap="0.5rem"\`
- **Default** (card carousels): \`gap="1rem"\`
- **Spacious** (feature sections): \`gap="1.5rem"\` or \`gap="2rem"\`

**Responsive gap:** The gap is typically the same across breakpoints — the responsive lever is the number of visible slides (via \`basis-*\` classes), not the gap. If you need a responsive gap, override the CSS variable with a media query:

\`\`\`css
.my-carousel { --carousel-gap: 0.5rem; }
@media (min-width: 768px) { .my-carousel { --carousel-gap: 1rem; } }
\`\`\`

## Options

Pass Embla Carousel options via the \`opts\` prop (e.g. \`opts={{ align: "start", loop: true }}\`). See the [Embla Carousel docs](https://www.embla-carousel.com/api/options/) for all options.

## Events

Use \`setApi\` to get the Embla API instance, then listen to events with \`api.on("select", ...)\`. See the [Embla Carousel events docs](https://www.embla-carousel.com/api/events/) for all events.

## Plugins

Pass plugins via the \`plugins\` prop (e.g. \`plugins={[Autoplay({ delay: 2000 })]}\`). See the [Embla Carousel plugins docs](https://www.embla-carousel.com/plugins/) for available plugins.

## Features

- Composable compound components for full layout control
- Horizontal and vertical orientation
- Dot pagination (\`CarouselDots\`) and slide counter (\`CarouselCounter\`)
- CSS \`mask-image\` edge fading (no gradient overlay elements)
- Auto-hide arrows on hover via \`autoHideArrows\` prop
- Configurable gap via \`gap\` prop (CSS custom property \`--carousel-gap\`)
- Configurable mask width via \`--carousel-mask-width\` CSS variable
- \`onSlideChange\` callback for external state sync
- Plugin support (autoplay, wheel gestures, etc.)
- Keyboard navigation with arrow keys
- Accessible via WAI-ARIA carousel pattern
`,
      },
    },
  },
  subcomponents: {
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    CarouselDots,
    CarouselCounter,
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <div className="mx-auto max-w-lg">
      <Carousel>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <SlideBox index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// WithDots
// ---------------------------------------------------------------------------

export const WithDots: Story = {
  name: "With Dots",
  render: () => (
    <div className="mx-auto max-w-lg">
      <Carousel>
        <CarouselContent>
          {Array.from({ length: 8 }).map((_, i) => (
            <CarouselItem key={i}>
              <SlideBox index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use `CarouselDots` for dot-style pagination. The active dot becomes a wider pill shape. Clicking a dot navigates to that slide.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// WithCounter
// ---------------------------------------------------------------------------

export const WithCounter: Story = {
  name: "With Counter",
  render: () => (
    <div className="mx-auto max-w-lg">
      <Carousel>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <SlideBox index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselCounter />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          '`CarouselCounter` displays the current position as "1 / 5" text. A lightweight alternative to dots for compact UIs.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// WithMask
// ---------------------------------------------------------------------------

export const WithMask: Story = {
  name: "With Mask",
  render: () => (
    <div className="mx-auto max-w-2xl">
      <Carousel>
        <CarouselContent mask>
          {Array.from({ length: 8 }).map((_, i) => (
            <CarouselItem className="basis-1/3" key={i}>
              <SlideBox index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The `mask` prop on `CarouselContent` applies a CSS `mask-image` fade on edges that have more content. Works with any background — no gradient color matching needed. Customize the fade width with `--carousel-mask-width`.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// WithIconButtons
// ---------------------------------------------------------------------------

export const WithIconButtons: Story = {
  name: "With Icon Buttons",
  render: () => (
    <div className="mx-auto max-w-lg">
      <Carousel>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <SlideBox index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className="top-1/2 left-2 -translate-y-1/2"
          size="icon-xs"
          variant="secondary"
        />
        <CarouselNext
          className="top-1/2 right-2 -translate-y-1/2"
          size="icon-xs"
          variant="secondary"
        />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Override `size` and `variant` on `CarouselPrevious`/`CarouselNext` for different button styles. Here we use `size="icon-xs"` with `variant="secondary"` positioned inside the carousel.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// AutoHideArrows
// ---------------------------------------------------------------------------

export const AutoHideArrows: Story = {
  name: "Auto-Hide Arrows",
  render: () => (
    <div className="mx-auto max-w-lg">
      <Carousel autoHideArrows>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <SlideBox index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="top-1/2 left-2 -translate-y-1/2" />
        <CarouselNext className="top-1/2 right-2 -translate-y-1/2" />
        <CarouselDots />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The `autoHideArrows` prop hides prev/next buttons by default and reveals them when the carousel is hovered. Uses the `group/carousel` pattern for CSS-only show/hide.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// MultipleSlides
// ---------------------------------------------------------------------------

export const MultipleSlides: Story = {
  name: "Multiple Slides",
  render: () => (
    <div className="mx-auto max-w-2xl">
      <Carousel>
        <CarouselContent>
          {Array.from({ length: 9 }).map((_, i) => (
            <CarouselItem className="basis-1/3" key={i}>
              <SlideBox index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Show multiple slides at once by setting a `basis-*` class on `CarouselItem`. Here `basis-1/3` shows 3 items per view.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// MultipleSlidesWithMaskAndDots
// ---------------------------------------------------------------------------

const unsplashImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1465795344919-7dc04cfd5cc4?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=300&fit=crop",
  "https://images.unsplash.com/photo-1518173946687-a243cf1d464a?w=600&h=300&fit=crop",
];

export const MultipleSlidesWithMaskAndDots: Story = {
  name: "Multiple Slides + Mask + Dots",
  render: () => (
    <div className="mx-auto max-w-2xl">
      <Carousel opts={{ align: "start" }}>
        <CarouselContent mask>
          {unsplashImages.map((src, i) => (
            <CarouselItem className="basis-1/3" key={i}>
              <img
                alt={`Landscape ${i + 1}`}
                className="aspect-2/1 w-full rounded-lg object-cover"
                src={src}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Combining multiple visible slides (`basis-1/3`), CSS mask edge fading, and dot pagination with real images. Uses `align: "start"` to align slides to the left edge.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Sizes (responsive)
// ---------------------------------------------------------------------------

export const Sizes: Story = {
  render: () => (
    <div className="mx-auto w-full max-w-48 sm:max-w-xs md:max-w-sm">
      <Carousel opts={{ align: "start" }}>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem className="basis-1/2 lg:basis-1/3" key={i}>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-semibold text-3xl">{i + 1}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use responsive `basis-*` classes on `CarouselItem` to control slide sizes at different breakpoints. Here `basis-1/2 lg:basis-1/3` shows 2 slides on small screens and 3 on large screens.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

export const Spacing: Story = {
  render: () => (
    <div className="mx-auto w-full max-w-48 sm:max-w-xs md:max-w-sm">
      <Carousel gap="0.25rem">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem className="basis-1/2 lg:basis-1/3" key={i}>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-semibold text-2xl">{i + 1}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use the `gap` prop on `Carousel` to control spacing between slides. Defaults to `"1rem"`. Here we use `"0.25rem"` for tighter spacing. The gap is set as a `--carousel-gap` CSS variable and applied automatically to content and items.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export const Options: Story = {
  render: () => (
    <div className="mx-auto max-w-lg">
      <Carousel opts={{ align: "start", loop: true }}>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem className="basis-1/2" key={i}>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-semibold text-3xl">{i + 1}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Pass Embla Carousel options via the `opts` prop. Here `align: "start"` aligns slides to the start edge and `loop: true` enables infinite looping. See the [Embla Carousel docs](https://www.embla-carousel.com/api/options/) for all available options.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Vertical
// ---------------------------------------------------------------------------

export const Vertical: Story = {
  render: () => (
    <div className="mx-auto max-w-xs">
      <Carousel gap="0.5rem" orientation="vertical">
        <CarouselContent className="h-[270px]">
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem className="basis-1/2" key={i}>
              <Card>
                <CardContent className="flex items-center justify-center p-6">
                  <span className="font-semibold text-3xl">{i + 1}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use `orientation="vertical"` for a vertical carousel. Set a fixed height on `CarouselContent` to constrain the visible area. Arrow buttons automatically rotate 90 degrees.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Autoplay
// ---------------------------------------------------------------------------

function AutoplayExample() {
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));

  return (
    <div className="mx-auto max-w-lg">
      <Carousel
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        plugins={[plugin.current]}
      >
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <Card>
                <CardContent className="flex aspect-video items-center justify-center p-6">
                  <span className="font-semibold text-4xl">{i + 1}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots />
      </Carousel>
    </div>
  );
}

export const WithAutoplay: Story = {
  name: "Autoplay",
  render: () => <AutoplayExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Pass `Autoplay()` via the `plugins` prop for auto-advancing slides. This example pauses on mouse enter and resumes on mouse leave using `plugin.current.stop` and `plugin.current.reset`. Requires `embla-carousel-autoplay`.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// WheelGestures
// ---------------------------------------------------------------------------

export const WithWheelGestures: Story = {
  name: "Wheel Gestures",
  render: () => (
    <div className="mx-auto max-w-2xl">
      <Carousel plugins={[WheelGesturesPlugin()]}>
        <CarouselContent mask>
          {Array.from({ length: 8 }).map((_, i) => (
            <CarouselItem className="basis-1/3" key={i}>
              <SlideBox index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The `WheelGesturesPlugin` from `embla-carousel-wheel-gestures` enables trackpad/scroll-wheel navigation. Pass it via the `plugins` prop.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

function EventsExample() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className="mx-auto max-w-xs">
      <Carousel setApi={setApi}>
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, i) => (
            <CarouselItem key={i}>
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="font-semibold text-4xl">{i + 1}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="py-2 text-center text-muted-foreground text-sm">
        Slide {current} of {count}
      </div>
    </div>
  );
}

export const Events: Story = {
  render: () => <EventsExample />,
  parameters: {
    docs: {
      description: {
        story:
          'Use `setApi` to get the Embla API instance and listen to events directly with `api.on("select", ...)`. This gives you full access to all [Embla Carousel events](https://www.embla-carousel.com/api/events/) for advanced use cases.',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Controlled
// ---------------------------------------------------------------------------

export const Controlled: Story = {
  render: () => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Carousel onSlideChange={setCurrent} setApi={setApi}>
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, i) => (
              <CarouselItem key={i}>
                <SlideBox index={i} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Button
              key={i}
              onClick={() => api?.scrollTo(i)}
              size="sm"
              variant={i === current ? "default" : "outline"}
            >
              Slide {i + 1}
            </Button>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use `setApi` and `onSlideChange` to control the carousel externally. `setApi` gives you the Embla API instance; `onSlideChange` fires with the selected index.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Thumbnails
// ---------------------------------------------------------------------------

function ThumbnailsExample() {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi) {
        return;
      }
      mainApi.scrollTo(index);
    },
    [mainApi]
  );

  const onMainSelect = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      if (!thumbApi) {
        return;
      }
      thumbApi.scrollTo(index);
    },
    [thumbApi]
  );

  const slides = [
    "bg-rose-100 dark:bg-rose-900/30",
    "bg-sky-100 dark:bg-sky-900/30",
    "bg-amber-100 dark:bg-amber-900/30",
    "bg-emerald-100 dark:bg-emerald-900/30",
    "bg-violet-100 dark:bg-violet-900/30",
    "bg-orange-100 dark:bg-orange-900/30",
    "bg-teal-100 dark:bg-teal-900/30",
  ];

  return (
    <div className="mx-auto max-w-lg space-y-2">
      {/* Main carousel */}
      <Carousel onSlideChange={onMainSelect} setApi={setMainApi}>
        <CarouselContent>
          {slides.map((bg, i) => (
            <CarouselItem key={i}>
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

      {/* Thumbnail strip */}
      <Carousel gap="0.5rem" setApi={setThumbApi}>
        <CarouselContent>
          {slides.map((bg, i) => (
            <CarouselItem className="basis-1/5" key={i}>
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

export const Thumbnails: Story = {
  render: () => <ThumbnailsExample />,
  parameters: {
    docs: {
      description: {
        story:
          "Two synced carousels: a main carousel and a thumbnail strip. Clicking a thumbnail navigates the main carousel, and the main carousel syncs the thumbnail selection via `onSlideChange` and `setApi`.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export const Cards: Story = {
  render: () => (
    <div className="mx-auto max-w-2xl">
      <Carousel gap="1.5rem">
        <CarouselContent mask>
          {[
            {
              title: "Analytics",
              desc: "Track user engagement and performance metrics across your projects.",
            },
            {
              title: "Automation",
              desc: "Set up automated workflows to streamline repetitive tasks.",
            },
            {
              title: "Security",
              desc: "Monitor and manage access controls, audit logs, and compliance.",
            },
            {
              title: "Integrations",
              desc: "Connect with third-party services and extend your platform.",
            },
            {
              title: "Billing",
              desc: "Manage subscriptions, invoices, and payment methods.",
            },
          ].map((card, i) => (
            <CarouselItem className="basis-[280px]" key={i}>
              <Card>
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                  <CardDescription>{card.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex h-24 items-center justify-center rounded-lg bg-muted text-muted-foreground text-sm">
                    {card.title} preview
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A practical example using Card components as carousel slides. Uses `basis-[280px]` for fixed-width cards, `mask` for edge fading, and a custom `gap` of `1.5rem`.",
      },
    },
  },
};
