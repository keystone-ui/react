"use client";

import { buttonVariants } from "@keystoneui/react/button";
import { Reel } from "@keystoneui/react/reel";
import { cn } from "@keystoneui/react/utils";

const sections = [
  "Overview",
  "Activity",
  "Members",
  "Projects",
  "Billing",
  "Invoices",
  "Integrations",
  "Audit log",
  "Settings",
];

export default function ReelPlainArrows() {
  const current = "Overview";
  return (
    <nav aria-label="Sections" className="w-full max-w-md">
      <Reel arrowVariant="plain" arrows="always">
        <ul className="flex w-max gap-1 rounded-lg bg-muted p-1">
          {sections.map((section) => {
            const isCurrent = section === current;
            return (
              <li key={section}>
                <a
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    isCurrent
                      ? "bg-background text-foreground shadow-sm hover:bg-background"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  href={`#${section.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                >
                  {section}
                </a>
              </li>
            );
          })}
        </ul>
      </Reel>
    </nav>
  );
}
