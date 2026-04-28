import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type ChangeTagVariant =
  | "added"
  | "changed"
  | "fixed"
  | "removed"
  | "deprecated"
  | "security";

const variantClasses: Record<ChangeTagVariant, string> = {
  added: "bg-green-500/15 text-green-700 dark:text-green-400",
  changed: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  fixed: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  removed: "bg-red-500/15 text-red-700 dark:text-red-400",
  deprecated: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  security: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
};

const variantLabels: Record<ChangeTagVariant, string> = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
  deprecated: "Deprecated",
  security: "Security",
};

interface ChangeTagProps {
  children?: ReactNode;
  className?: string;
  variant: ChangeTagVariant;
}

export function ChangeTag({ variant, children, className }: ChangeTagProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 font-medium text-xs",
        variantClasses[variant],
        className
      )}
    >
      {children ?? variantLabels[variant]}
    </span>
  );
}
