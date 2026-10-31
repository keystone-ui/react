"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

/**
 * Placeholder rows while the table's request is in flight.
 *
 * Built to the real rows' height so nothing moves when the data lands: the
 * actions cell holds a 32px box — the `icon-sm` trigger the real row has — and
 * a two-line column (a name over an email) gets two bars at the real lines'
 * heights. The count is the previous page's, so a refetch does not
 * collapse the table to a single row and spring back.
 *
 * Hidden from assistive tech: the table's `aria-busy` is what says "loading".
 * Grey bars announced cell by cell would be noise.
 */
export function SkeletonRows({
  checkbox = false,
  columns,
  count,
  twoLine,
}: {
  checkbox?: boolean;
  /** Data columns between the checkbox and the actions. */
  columns: number;
  count: number;
  /** The data column, by index, that holds two lines of text. */
  twoLine?: number;
}) {
  // Placeholders have no identity of their own; position is the only key.
  return Array.from({ length: count }, (_row, row) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: placeholders, keyed by slot
    <TableRow aria-hidden data-skeleton-row="" key={row}>
      {checkbox ? (
        <TableCell>
          <Skeleton className="size-4" />
        </TableCell>
      ) : null}
      {Array.from({ length: columns }, (_column, column) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: placeholders, keyed by slot
        <TableCell key={column}>
          {column === twoLine ? (
            <div className="flex flex-col">
              <div className="flex h-5 items-center">
                <Skeleton className="h-3.5 w-28" />
              </div>
              <div className="flex h-4 items-center">
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ) : (
            <div className="flex h-5 items-center">
              {/* Varied widths so the column does not read as a grid of
                  identical bricks. */}
              <Skeleton className={WIDTHS[(row + column) % WIDTHS.length]} />
            </div>
          )}
        </TableCell>
      ))}
      <TableCell>
        <div className="size-8" />
      </TableCell>
    </TableRow>
  ));
}

const WIDTHS = ["h-3.5 w-24", "h-3.5 w-16", "h-3.5 w-20", "h-3.5 w-12"];
