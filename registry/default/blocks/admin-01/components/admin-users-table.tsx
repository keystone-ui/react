"use client";

import {
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  HashIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  defaultDirection,
  hasActiveFilters,
  PAGE_SIZES,
  STATUS_VARIANT,
  toUsersCsv,
  type UserSortKey,
} from "@/components/admin-filters";
import { AdminUsersToolbar } from "@/components/admin-users-toolbar";
import { downloadCsv } from "@/components/csv";
import { FilteredEmpty } from "@/components/filtered-empty";
import { statusLabels, type User, users } from "@/components/mock-admin";
import { ResultSummary } from "@/components/result-summary";
import { SkeletonRows } from "@/components/skeleton-rows";
import { SortableHead } from "@/components/sort-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SelectionBar,
  SelectionBarButton,
  SelectionBarClose,
  SelectionBarGroup,
  SelectionBarLabel,
} from "@/components/ui/selection-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TablePagination,
  TablePaginationButtons,
  TablePaginationControls,
  TablePaginationInfo,
  TablePaginationPageSize,
  TablePaginationStatus,
} from "@/components/ui/table-pagination";
import type {
  UserColumnId,
  UsersTableState,
} from "@/components/use-users-table";

interface UserColumn {
  cell: (row: User, onOpenUser: (id: string) => void) => ReactNode;
  /** Classes for the body cell. */
  className?: string;
  /** Classes for the header cell — a fixed width, say. */
  headClassName?: string;
  /** Hideable from the Columns menu. The name column is not: it is the row. */
  id: UserColumnId | "name";
  label: ReactNode;
  /** The name the Columns menu shows, when `label` is not plain text. */
  menuLabel: string;
  numeric?: boolean;
  /** Present on the columns that sort. */
  sortKey?: UserSortKey;
}

const COLUMNS: readonly UserColumn[] = [
  {
    cell: (row) => (
      <span className="font-mono text-muted-foreground text-xs">{row.id}</span>
    ),
    // Explicit width: the table distributes free space, and an id needs only
    // enough room for its own text — matching `tickets-01`'s ID column.
    headClassName: "w-[116px]",
    id: "id",
    label: (
      <>
        <HashIcon className="size-3.5 shrink-0" />
        ID
      </>
    ),
    menuLabel: "ID",
    sortKey: "id",
  },
  {
    cell: (row, onOpenUser) => (
      <div className="min-w-0">
        <button
          className="cursor-pointer rounded-sm text-left font-medium hover:underline focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2"
          onClick={() => onOpenUser(row.id)}
          type="button"
        >
          {row.name}
        </button>
        <div className="truncate text-muted-foreground text-xs">
          {row.email}
        </div>
      </div>
    ),
    id: "name",
    label: "User",
    menuLabel: "User",
    sortKey: "name",
  },
  {
    cell: (row) => row.role,
    className: "text-muted-foreground",
    id: "role",
    label: "Role",
    menuLabel: "Role",
    sortKey: "role",
  },
  {
    cell: (row) => row.seats,
    id: "seats",
    label: "Seats",
    menuLabel: "Seats",
    numeric: true,
    sortKey: "seats",
  },
  {
    cell: (row) => row.lastActive,
    className: "text-muted-foreground",
    id: "lastActive",
    label: "Last active",
    menuLabel: "Last active",
    sortKey: "lastActive",
  },
  {
    cell: (row) => (
      <Badge variant={STATUS_VARIANT[row.status]}>
        {statusLabels[row.status]}
      </Badge>
    ),
    id: "status",
    label: "Status",
    menuLabel: "Status",
  },
];

const USER_COLUMNS = COLUMNS.flatMap((column) =>
  column.id === "name" ? [] : [{ id: column.id, label: column.menuLabel }]
);

/**
 * The users table, on the payments table's design: the same toolbar, header,
 * skeleton, empty state, footer and selection bar, over different columns.
 * What is particular to users is the two-line name cell, and that a name opens
 * a full record page rather than a side panel — a user is a record you work
 * in, a payment one you glance at.
 */
export function AdminUsersTable({
  onOpenUser,
  table,
}: {
  onOpenUser: (id: string) => void;
  table: UsersTableState;
}) {
  const { loading, result, selected } = table;
  const visible = COLUMNS.filter(
    (column) => column.id === "name" || !table.hiddenColumns.has(column.id)
  );
  const allOnPageSelected =
    result.page.length > 0 && result.page.every((row) => selected.has(row.id));

  return (
    <>
      {/* A real `h1`, above the card rather than inside it. `CardTitle` renders
          a div, so this section had no heading outline at all, and a title in
          the card made the panel announce itself rather than the page. */}
      <div className="flex w-full flex-col gap-6">
        <h1 className="font-semibold text-2xl tracking-tight">Users</h1>

        <Card variant="outline">
          <CardContent className="flex flex-col gap-4">
            <AdminUsersToolbar columns={USER_COLUMNS} table={table} />

            <Table aria-busy={loading} hoverable>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Select all users on this page"
                      checked={allOnPageSelected}
                      disabled={loading}
                      onCheckedChange={(checked) =>
                        table.togglePage(checked === true)
                      }
                    />
                  </TableHead>
                  {visible.map((column) =>
                    column.sortKey ? (
                      <SortableHead
                        className={column.headClassName}
                        columnKey={column.sortKey}
                        defaultDirection={defaultDirection}
                        key={column.id}
                        numeric={column.numeric}
                        onSortChange={table.setSort}
                        sort={table.sort}
                      >
                        {column.label}
                      </SortableHead>
                    ) : (
                      // Not sortable, so no `sortDirection` at all — see
                      // `SortableHead`.
                      <TableHead
                        className={column.headClassName}
                        key={column.id}
                        numeric={column.numeric}
                      >
                        {column.label}
                      </TableHead>
                    )
                  )}
                  {/* One icon wide, so no visible label: "Actions" above it
                      would size the column from the header. */}
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <SkeletonRows
                    checkbox
                    columns={visible.length}
                    count={result.page.length || table.pageSize}
                    twoLine={visible.findIndex(
                      (column) => column.id === "name"
                    )}
                  />
                ) : null}
                {!loading && result.page.length === 0 ? (
                  <FilteredEmpty
                    colSpan={visible.length + 2}
                    filtered={hasActiveFilters(table.filters)}
                    noun="users"
                    onClear={table.clearFilters}
                  />
                ) : null}
                {loading
                  ? null
                  : result.page.map((row) => (
                      <TableRow
                        className="group/row"
                        data-state={
                          selected.has(row.id) ? "selected" : undefined
                        }
                        key={row.id}
                      >
                        <TableCell>
                          <Checkbox
                            aria-label={`Select ${row.name}`}
                            checked={selected.has(row.id)}
                            onCheckedChange={() => table.toggleRow(row.id)}
                          />
                        </TableCell>
                        {visible.map((column) => (
                          <TableCell
                            className={column.className}
                            data-column={column.id}
                            key={column.id}
                            numeric={column.numeric}
                          >
                            {column.cell(row, onOpenUser)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <UserRowActions
                            name={row.name}
                            onOpen={() => onOpenUser(row.id)}
                            userId={row.id}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>

            {/* Composed: the info slot's only props-driven content is a
                selection count, which the `SelectionBar` already states — and
                states at every width, where this slot is `hidden lg:block`. */}
            <TablePagination
              pageCount={result.pageCount}
              pageIndex={table.pageIndex}
            >
              <TablePaginationInfo>
                <ResultSummary
                  noun={["user", "users"]}
                  pageIndex={table.pageIndex}
                  pageSize={table.pageSize}
                  rowCount={result.page.length}
                  totalCount={result.total}
                />
              </TablePaginationInfo>
              <TablePaginationControls>
                <TablePaginationPageSize
                  onValueChange={table.setPageSize}
                  options={PAGE_SIZES}
                  value={table.pageSize}
                />
                <TablePaginationStatus
                  pageCount={result.pageCount}
                  pageIndex={table.pageIndex}
                />
                <TablePaginationButtons
                  onPageIndexChange={table.setPageIndex}
                  pageCount={result.pageCount}
                  pageIndex={table.pageIndex}
                />
              </TablePaginationControls>
            </TablePagination>
          </CardContent>
        </Card>
      </div>

      <UserSelectionBar onClear={table.clearSelection} selected={selected} />
    </>
  );
}

/**
 * The same two actions as the payments bar, for the same reason: this block
 * can perform them. Role changes, invites and suspensions need a backend, and
 * buttons that do nothing were what this bar used to carry.
 */
function UserSelectionBar({
  onClear,
  selected,
}: {
  onClear: () => void;
  selected: ReadonlySet<string>;
}) {
  const [copied, setCopied] = useState(false);
  const rows = users.filter((user) => selected.has(user.id));

  return (
    <SelectionBar open={selected.size > 0}>
      <SelectionBarClose onClick={onClear} />
      <SelectionBarGroup>
        <SelectionBarLabel>
          {selected.size} {selected.size === 1 ? "user" : "users"} selected
        </SelectionBarLabel>
      </SelectionBarGroup>
      <SelectionBarButton
        onClick={() => downloadCsv("users-selected.csv", toUsersCsv(rows))}
      >
        <DownloadIcon />
        Export
      </SelectionBarButton>
      <SelectionBarButton
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(
              rows.map((row) => row.id).join("\n")
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // Insecure context or permission denied; nothing to undo.
          }
        }}
      >
        <CopyIcon />
        {copied ? "Copied" : "Copy IDs"}
      </SelectionBarButton>
    </SelectionBar>
  );
}

/**
 * Row actions, in a trailing menu rather than a hover-revealed button.
 *
 * The button it replaces was unreachable on touch — `focus-visible` rescues a
 * keyboard, not a finger. The name stays clickable, so opening a record keeps
 * its one-click path.
 */
function UserRowActions({
  name,
  onOpen,
  userId,
}: {
  name: string;
  onOpen: () => void;
  userId: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" />}>
        <MoreHorizontalIcon />
        <span className="sr-only">Actions for {name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onOpen}>
            <EyeIcon />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(userId);
              } catch {
                // Insecure context or permission denied; nothing to undo.
              }
            }}
          >
            <CopyIcon />
            Copy user ID
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
