import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import type * as React from "react";
import { Button } from "./button";
import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      data-slot="pagination"
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
      className={cn("flex items-center gap-0.5", className)}
      data-slot="pagination-content"
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
      className={cn(className)}
      nativeButton={false}
      render={
        <a
          aria-current={isActive ? "page" : undefined}
          data-active={isActive}
          data-slot="pagination-link"
          {...props}
        />
      }
      size={size}
      variant={isActive ? "outline" : "ghost"}
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
      className={cn("pl-1.5!", className)}
      size="sm"
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
      className={cn("pr-1.5!", className)}
      size="sm"
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
      className={cn(className)}
      size="icon-sm"
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
      className={cn(className)}
      size="icon-sm"
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
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="pagination-ellipsis"
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
