"use client";

import { buttonVariants } from "@keystoneui/react/button";
import { Reel } from "@keystoneui/react/reel";
import { cn } from "@keystoneui/react/utils";

const categories = [
  "All",
  "Featured",
  "Games",
  "Music",
  "Film & TV",
  "Books",
  "Sport",
  "Art & Design",
  "News",
];

export default function ReelDefault() {
  const current = "All";
  return (
    <nav aria-label="Categories" className="w-full max-w-md">
      <Reel>
        <ul className="mx-auto flex w-max gap-1">
          {categories.map((category) => {
            const isCurrent = category === current;
            return (
              <li key={category}>
                <a
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    buttonVariants({
                      variant: isCurrent ? "secondary" : "ghost",
                    }),
                    "rounded-full",
                    !isCurrent && "text-muted-foreground hover:text-foreground"
                  )}
                  href={`#${category.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                >
                  {category}
                </a>
              </li>
            );
          })}
        </ul>
      </Reel>
    </nav>
  );
}
