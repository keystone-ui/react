import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

// ---------------------------------------------------------------------------
// BreadcrumbList
// ---------------------------------------------------------------------------

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-1.5 break-words text-muted-foreground text-sm sm:gap-2.5",
        className
      )}
      data-slot="breadcrumb-list"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// BreadcrumbItem
// ---------------------------------------------------------------------------

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      className={cn("inline-flex items-center gap-1.5", className)}
      data-slot="breadcrumb-item"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// BreadcrumbLink
// ---------------------------------------------------------------------------

interface BreadcrumbLinkProps extends useRender.ComponentProps<"a"> {}

function BreadcrumbLink({ className, render, ...props }: BreadcrumbLinkProps) {
  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(
      {
        "data-slot": "breadcrumb-link",
        className: cn("transition-colors hover:text-foreground", className),
      },
      props
    ),
    state: {},
  });
}

// ---------------------------------------------------------------------------
// BreadcrumbPage
// ---------------------------------------------------------------------------

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-current="page"
      aria-disabled="true"
      className={cn("font-normal text-foreground", className)}
      data-slot="breadcrumb-page"
      role="link"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// BreadcrumbSeparator
// ---------------------------------------------------------------------------

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      data-slot="breadcrumb-separator"
      role="presentation"
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  );
}

// ---------------------------------------------------------------------------
// BreadcrumbEllipsis
// ---------------------------------------------------------------------------

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
export type { BreadcrumbLinkProps };
