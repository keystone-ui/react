"use client";

import {
  BookOpen,
  Clapperboard,
  Gamepad2,
  LayoutGrid,
  type LucideIcon,
  Music,
  Newspaper,
  Palette,
  Sparkles,
  Trophy,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reel } from "@/components/ui/reel";
import { cn } from "@/lib/utils";

interface Category {
  href: string;
  icon: LucideIcon;
  label: string;
}

const categories: Category[] = [
  { href: "/browse", icon: LayoutGrid, label: "All" },
  { href: "/browse/featured", icon: Sparkles, label: "Featured" },
  { href: "/browse/games", icon: Gamepad2, label: "Games" },
  { href: "/browse/music", icon: Music, label: "Music" },
  { href: "/browse/film", icon: Clapperboard, label: "Film & TV" },
  { href: "/browse/books", icon: BookOpen, label: "Books" },
  { href: "/browse/sport", icon: Trophy, label: "Sport" },
  { href: "/browse/art", icon: Palette, label: "Art & Design" },
  { href: "/browse/news", icon: Newspaper, label: "News" },
];

/**
 * A bar of category links that scrolls sideways when it does not fit. The
 * links are real links (`<a href>`), styled with `buttonVariants`, and the
 * current one carries `aria-current="page"`; the Reel scrolls it into view.
 * Swap the `<a>` for your router's link component if it renders an `<a>`.
 */
export function CategoryNav({
  currentHref,
  items = categories,
  label = "Categories",
}: {
  currentHref: string;
  items?: Category[];
  label?: string;
}) {
  return (
    <nav aria-label={label}>
      <Reel>
        {/* `w-max` keeps the row's natural width; `mx-auto` centres it when
            everything fits. */}
        <ul className="mx-auto flex w-max gap-1">
          {items.map((item) => {
            const isCurrent = item.href === currentHref;
            return (
              <li key={item.href}>
                <a
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    buttonVariants({
                      variant: isCurrent ? "secondary" : "ghost",
                    }),
                    "rounded-full",
                    !isCurrent && "text-muted-foreground hover:text-foreground"
                  )}
                  href={item.href}
                >
                  <item.icon aria-hidden="true" />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </Reel>
    </nav>
  );
}
