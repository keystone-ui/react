import { cva } from "class-variance-authority";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronsLeft as ChevronsLeftIcon,
  ChevronsRight as ChevronsRightIcon,
  Ellipsis as MoreHorizontalIcon,
} from "lucide-react";
import type * as React from "react";
import { Button } from "./button";
import { cn } from "./utils";

// Module-scoped, so the package needs no Node types.
declare const process: { env: { NODE_ENV?: string } };

// Outside production. The literal `process.env.NODE_ENV` stays written out
// so bundlers replace it, as they do for Base UI's own checks. Where nothing
// replaces it and there is no global `process`, reading it throws, and this
// returns `false`, so nothing is logged.
function isDevelopment(): boolean {
  try {
    return process.env.NODE_ENV !== "production";
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Link classes
// ---------------------------------------------------------------------------

// Button's own classes for the variants and sizes a page control takes, kept
// here instead of calling `buttonVariants`: `button.tsx` is a "use client"
// module, so a Server Component that renders a page link could not run it.
// `pagination.test.tsx` pins these equal to `buttonVariants`.
const paginationLinkVariants = cva(
  "relative z-0 inline-flex shrink-0 cursor-pointer touch-manipulation select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-md font-medium text-sm transition-[scale,background-color,color,border-color,box-shadow,outline-color] duration-(--duration-fast,125ms) ease-(--ease-ks-out,cubic-bezier(0.23,1,0.32,1)) [-webkit-tap-highlight-color:transparent] focus:ring-0 focus:ring-offset-0 focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-loading:cursor-not-allowed data-loading:active:scale-100 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        ghost:
          "bg-transparent hover:bg-accent active:bg-accent disabled:bg-transparent disabled:text-foreground/50 data-loading:bg-transparent data-loading:text-foreground/50",
        outline:
          "border border-input bg-background text-foreground shadow-xs hover:bg-accent hover:text-foreground active:bg-accent active:text-foreground disabled:border-border/50 disabled:bg-transparent disabled:text-foreground/50 aria-expanded:bg-accent aria-expanded:text-foreground aria-expanded:disabled:text-foreground/50 data-loading:border-border/50 data-loading:bg-transparent data-disabled:text-foreground/50 data-loading:text-foreground/50 dark:border-input dark:bg-input-bg dark:active:bg-input/50 dark:hover:bg-input/50",
      },
      size: {
        default: "h-(--ks-control-md,2.5rem) px-4 py-2",
        xs: "h-(--ks-control-xs,1.5rem) rounded-sm px-2.5 py-1 text-xs",
        sm: "h-(--ks-control-sm,2rem) px-3 py-1.5",
        lg: "h-(--ks-control-lg,3rem) px-5 py-3.5 text-base",
        icon: "size-(--ks-control-md,2.5rem) p-2",
        "icon-xs": "size-(--ks-control-xs,1.5rem) rounded-sm p-0.5",
        "icon-sm": "size-(--ks-control-sm,2rem) p-1.5",
        "icon-lg": "size-(--ks-control-lg,3rem) p-2.5",
      },
    },
  }
);

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

type PaginationLinkBaseProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size">;

/** With `href`: a real `<a>`, so the ref is an anchor. */
type PaginationLinkAnchorProps = PaginationLinkBaseProps &
  React.ComponentProps<"a">;

/**
 * Without `href`: a native `<button>`, so the ref is a button. The other
 * attributes keep their anchor types, so no prop is added. An HTML label
 * (`dangerouslySetInnerHTML`) is not rendered without `href`.
 */
type PaginationLinkButtonProps = PaginationLinkBaseProps &
  Omit<React.ComponentProps<"a">, "href" | "ref"> & {
    href?: undefined;
    ref?: React.Ref<HTMLButtonElement> | undefined;
  };

type PaginationLinkProps =
  | PaginationLinkAnchorProps
  | PaginationLinkButtonProps;

// The anchor signature is last on purpose: `ComponentProps<typeof
// PaginationLink>` and `ComponentRef` read the last one, so they keep
// describing the link, as they always have.
// biome-ignore lint/style/useUnifiedTypeSignatures: a single union signature loses the type of an inferred callback ref without `href`, and `ComponentProps` / `ComponentRef` describing the link
function PaginationLink(props: PaginationLinkButtonProps): React.JSX.Element;
function PaginationLink(props: PaginationLinkAnchorProps): React.JSX.Element;
function PaginationLink({
  className,
  isActive,
  size,
  ref,
  ...props
}: PaginationLinkProps): React.JSX.Element {
  // A page number is not an icon: `icon-sm` pins a 32px square, which a
  // label like "1,284" overflows. Without an explicit size the link is a
  // `sm` button that is at least square and grows with its label.
  const fit = size === undefined && "min-w-(--ks-control-sm,2rem) px-2";
  const variant = isActive ? "outline" : "ghost";
  const state = {
    "aria-current": isActive ? ("page" as const) : undefined,
    "data-active": isActive,
    "data-slot": "pagination-link",
  };

  // A page with a URL is a link: a plain `<a>` with Button's classes, so it
  // keeps the link role and follows on Enter only. Rendering it through
  // `Button` would make it `role="button"` and follow on Space as well.
  if (props.href != null) {
    return (
      <a
        className={cn(
          paginationLinkVariants({ variant, size: size ?? "sm" }),
          "tabular-nums",
          fit,
          className
        )}
        ref={ref as React.Ref<HTMLAnchorElement>}
        {...state}
        {...props}
      />
    );
  }

  // Without a URL (paging by `onClick`) it is a `Button`: a native
  // `<button>` unless a caller's untyped `render` gives another element, so
  // Enter and Space both run the handler and, when enabled, it is in the tab
  // order by default (a caller's `tabIndex` wins). The caller's props go to
  // `Button` (`className` merged, `type` kept `button`), so Base UI handles
  // `disabled`, `focusableWhenDisabled`, `nativeButton`, `render` and the
  // event handlers. Button renders the children as the label. Pagination
  // drops `dangerouslySetInnerHTML` before it reaches `Button`. Each render
  // given a non-nullish value logs one error if `isDevelopment()` returns
  // true. An unreplaced check with no global `process` returns false.
  const { dangerouslySetInnerHTML, ...rest } =
    props as React.ComponentProps<"button">;
  if (dangerouslySetInnerHTML != null && isDevelopment()) {
    console.error(
      "Pagination: a page control without `href` does not take `dangerouslySetInnerHTML`. Pass the label as children, or give the control an `href`."
    );
  }
  return (
    <Button
      className={cn("tabular-nums", fit, className)}
      ref={ref as React.Ref<HTMLButtonElement>}
      size={size ?? "sm"}
      variant={variant}
      {...state}
      {...rest}
      type="button"
    />
  );
}

// ---------------------------------------------------------------------------
// PaginationPrevious
// ---------------------------------------------------------------------------

// biome-ignore lint/style/useUnifiedTypeSignatures: a single union signature loses the type of an inferred callback ref without `href`, and `ComponentProps` / `ComponentRef` describing the link
function PaginationPrevious(
  props: PaginationLinkButtonProps & { text?: string }
): React.JSX.Element;
function PaginationPrevious(
  props: PaginationLinkAnchorProps & { text?: string }
): React.JSX.Element;
function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: PaginationLinkProps & { text?: string }): React.JSX.Element {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("pl-2!", className)}
      size="sm"
      {...(props as PaginationLinkAnchorProps)}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  );
}

// ---------------------------------------------------------------------------
// PaginationNext
// ---------------------------------------------------------------------------

// biome-ignore lint/style/useUnifiedTypeSignatures: a single union signature loses the type of an inferred callback ref without `href`, and `ComponentProps` / `ComponentRef` describing the link
function PaginationNext(
  props: PaginationLinkButtonProps & { text?: string }
): React.JSX.Element;
function PaginationNext(
  props: PaginationLinkAnchorProps & { text?: string }
): React.JSX.Element;
function PaginationNext({
  className,
  text = "Next",
  ...props
}: PaginationLinkProps & { text?: string }): React.JSX.Element {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("pr-2!", className)}
      size="sm"
      {...(props as PaginationLinkAnchorProps)}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

// ---------------------------------------------------------------------------
// PaginationFirst
// ---------------------------------------------------------------------------

// biome-ignore lint/style/useUnifiedTypeSignatures: a single union signature loses the type of an inferred callback ref without `href`, and `ComponentProps` / `ComponentRef` describing the link
function PaginationFirst(
  props: Omit<PaginationLinkButtonProps, "children">
): React.JSX.Element;
function PaginationFirst(
  props: Omit<PaginationLinkAnchorProps, "children">
): React.JSX.Element;
function PaginationFirst({
  className,
  ...props
}: Omit<PaginationLinkProps, "children">): React.JSX.Element {
  return (
    <PaginationLink
      aria-label="Go to first page"
      className={cn(className)}
      size="icon-sm"
      {...(props as PaginationLinkAnchorProps)}
    >
      <ChevronsLeftIcon />
    </PaginationLink>
  );
}

// ---------------------------------------------------------------------------
// PaginationLast
// ---------------------------------------------------------------------------

// biome-ignore lint/style/useUnifiedTypeSignatures: a single union signature loses the type of an inferred callback ref without `href`, and `ComponentProps` / `ComponentRef` describing the link
function PaginationLast(
  props: Omit<PaginationLinkButtonProps, "children">
): React.JSX.Element;
function PaginationLast(
  props: Omit<PaginationLinkAnchorProps, "children">
): React.JSX.Element;
function PaginationLast({
  className,
  ...props
}: Omit<PaginationLinkProps, "children">): React.JSX.Element {
  return (
    <PaginationLink
      aria-label="Go to last page"
      className={cn(className)}
      size="icon-sm"
      {...(props as PaginationLinkAnchorProps)}
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
