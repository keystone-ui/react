import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// PaginationContent
// ---------------------------------------------------------------------------

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// PaginationItem
// ---------------------------------------------------------------------------

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

// ---------------------------------------------------------------------------
// PaginationLink
// ---------------------------------------------------------------------------

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon-sm",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
      nativeButton={false}
      render={
        <a
          aria-current={isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        />
      }
    />
  );
}

// ---------------------------------------------------------------------------
// PaginationPrevious
// ---------------------------------------------------------------------------

function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="sm"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  );
}

// ---------------------------------------------------------------------------
// PaginationNext
// ---------------------------------------------------------------------------

function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="sm"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

// ---------------------------------------------------------------------------
// PaginationFirst
// ---------------------------------------------------------------------------

function PaginationFirst({
  className,
  ...props
}: Omit<React.ComponentProps<typeof PaginationLink>, "children">) {
  return (
    <PaginationLink
      aria-label="Go to first page"
      size="icon-sm"
      className={cn(className)}
      {...props}
    >
      <ChevronsLeftIcon />
    </PaginationLink>
  );
}

// ---------------------------------------------------------------------------
// PaginationLast
// ---------------------------------------------------------------------------

function PaginationLast({
  className,
  ...props
}: Omit<React.ComponentProps<typeof PaginationLink>, "children">) {
  return (
    <PaginationLink
      aria-label="Go to last page"
      size="icon-sm"
      className={cn(className)}
      {...props}
    >
      <ChevronsRightIcon />
    </PaginationLink>
  );
}

// ---------------------------------------------------------------------------
// PaginationEllipsis
// ---------------------------------------------------------------------------

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon />
      <span className="sr-only">More pages</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
