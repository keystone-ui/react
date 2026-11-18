"use client";

import { Button } from "@keystoneui/react/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@keystoneui/react/empty";
import { TableEmpty } from "@keystoneui/react/table";
import { SearchX as SearchXIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The table body when the filters leave nothing — shared by this block's two
 * tables, which differ only in the noun.
 *
 * It offers the one way out, `Clear filters`, rather than only reporting the
 * dead end: the toolbar's own `Clear all` is easy to miss on a wide row, and on
 * a phone it is inside the drawer. The button sits on the 32px `sm` tier like
 * everything else in the card.
 *
 * "No … match these filters" is the only state the fixture can reach. A real
 * table also needs the unfiltered version — "No payments yet" with no clear
 * button, because there is nothing to clear — which is why `filtered` is a
 * prop rather than assumed. `emptyTitle` says that in the caller's own words.
 */
export function FilteredEmpty({
  colSpan,
  emptyTitle,
  filtered,
  noun,
  onClear,
}: {
  colSpan: number;
  /** The title when nothing is filtered; "No … yet" without one. */
  emptyTitle?: ReactNode;
  filtered: boolean;
  noun: string;
  onClear: () => void;
}) {
  return (
    <TableEmpty colSpan={colSpan}>
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>
            {filtered
              ? `No ${noun} match these filters`
              : (emptyTitle ?? `No ${noun} yet`)}
          </EmptyTitle>
          {filtered ? (
            <EmptyDescription>
              Try a wider search, or remove a filter or two.
            </EmptyDescription>
          ) : null}
        </EmptyHeader>
        {filtered ? (
          <EmptyContent>
            <Button onClick={onClear} size="sm" variant="outline">
              Clear filters
            </Button>
          </EmptyContent>
        ) : null}
      </Empty>
    </TableEmpty>
  );
}
