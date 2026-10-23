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
  added: "bg-success/15 text-success",
  changed: "bg-primary/15 text-primary",
  fixed: "bg-warning/15 text-warning",
  removed: "bg-destructive/15 text-destructive",
  deprecated: "bg-muted text-muted-foreground",
  security: "bg-destructive/15 font-semibold text-destructive",
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
