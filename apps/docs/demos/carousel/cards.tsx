"use client";

import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "keystoneui/carousel";
import { CodeIcon, ImageIcon, LayoutIcon, TypeIcon } from "lucide-react";

const cards = [
  {
    title: "Design",
    description: "Create beautiful interfaces with ease.",
    icon: LayoutIcon,
  },
  {
    title: "Typography",
    description: "Choose from a wide range of fonts.",
    icon: TypeIcon,
  },
  {
    title: "Media",
    description: "Embed images and videos seamlessly.",
    icon: ImageIcon,
  },
  {
    title: "Code",
    description: "Add syntax-highlighted code blocks.",
    icon: CodeIcon,
  },
];

export default function CarouselCards() {
  return (
    <Carousel className="mx-12 max-w-sm">
      <CarouselContent>
        {cards.map((card) => (
          <CarouselItem key={card.title}>
            <div className="flex flex-col gap-2 rounded-lg border p-6">
              <card.icon className="size-8 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{card.title}</h3>
              <p className="text-muted-foreground text-sm">
                {card.description}
              </p>
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
