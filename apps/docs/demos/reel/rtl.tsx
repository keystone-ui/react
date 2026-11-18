"use client";

import { buttonVariants } from "@keystoneui/react/button";
import { Reel } from "@keystoneui/react/reel";
import { cn } from "@keystoneui/react/utils";

const categories = [
  "الكل",
  "مميز",
  "ألعاب",
  "موسيقى",
  "أفلام",
  "كتب",
  "رياضة",
  "فنون وتصميم",
  "أخبار",
];

export default function ReelRtl() {
  const current = categories[0];
  return (
    <nav aria-label="الفئات" className="w-full max-w-md" dir="rtl">
      <Reel>
        <ul className="mx-auto flex w-max gap-1">
          {categories.map((category, index) => {
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
                  href={`#category-${index}`}
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
