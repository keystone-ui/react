"use client";

import { buttonVariants } from "@keystoneui/react/button";
import { Reel } from "@keystoneui/react/reel";
import { useEffect } from "react";

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

/** Two identical overflowing rows: the default arrows and `"always"`. */
export function ReelArrowsFixture() {
  // A tap before hydration is not replayed; the test waits for this.
  useEffect(() => {
    document.documentElement.dataset.fixtureHydrated = "reel-arrows";
  }, []);
  return (
    <main className="flex min-h-screen flex-col gap-6 bg-background p-4 text-foreground">
      {(["pointer", "always"] as const).map((arrows) => (
        <nav
          aria-label={`arrows ${arrows}`}
          className="w-full max-w-md"
          data-testid={arrows}
          key={arrows}
        >
          {/* The default (no prop) beside an explicit "always". */}
          <Reel arrows={arrows === "always" ? "always" : undefined}>
            <ul className="mx-auto flex w-max gap-1">
              {categories.map((category) => (
                <li key={category}>
                  <a
                    className={buttonVariants({ variant: "ghost" })}
                    href={`#${category}`}
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </Reel>
        </nav>
      ))}
    </main>
  );
}
