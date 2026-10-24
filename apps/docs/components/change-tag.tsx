import type { ReactNode } from "react";

import {
  type ChangeTagVariant,
  variantClasses,
  variantLabels,
} from "@/components/change-tag-variants";
import { cn } from "@/lib/cn";

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
