"use client";

import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import { Card, CardContent } from "@keystoneui/react/card";
import { Checkbox } from "@keystoneui/react/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  SelectionBar,
  SelectionBarButton,
  SelectionBarClose,
  SelectionBarGroup,
  SelectionBarLabel,
  SelectionBarSeparator,
} from "@keystoneui/react/selection-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
} from "@keystoneui/react/table";
import {
  TablePagination,
  TablePaginationButtons,
  TablePaginationControls,
  TablePaginationInfo,
  TablePaginationPageSize,
  TablePaginationStatus,
} from "@keystoneui/react/table-pagination";
import {
  Copy as CopyIcon,
  Eye as EyeIcon,
  Hash as HashIcon,
  Ellipsis as MoreHorizontalIcon,
} from "lucide-react";
import {
  type SortOptionId,
  type SortState,
  STATUS_VARIANT,
  type UserFilters,
  type UserSortKey,
} from "./admin-filters";
import { AdminUsersToolbar } from "./admin-users-toolbar";
import { statusLabels, type User } from "./mock-admin";
import { ResultSummary } from "./result-summary";

// Re-exported for the page, which composes this table. The types themselves
// live in `admin-filters.ts` so the dependency runs one way.
export type { SortDirection, SortState, UserSortKey } from "./admin-filters";

const columns = [
  // Explicit width: the table distributes free space, and an id needs only
  // enough room for its own text — matching `tickets-01`'s ID column.
  {
    icon: HashIcon,
    key: "id",
    label: "ID",
    numeric: false,
    width: "w-[116px]",
  },
  { key: "name", label: "User", numeric: false },
  { key: "role", label: "Role", numeric: false },
  { key: "seats", label: "Seats", numeric: true },
  { key: "lastActive", label: "Last active", numeric: false },
] as const;

interface AdminUsersTableProps {
  filters: UserFilters;
  onClearSelection: () => void;
  onFiltersChange: (patch: Partial<UserFilters>) => void;
  onFiltersClear: () => void;
  onOpenUser: (id: string) => void;
  onPageIndexChange: (index: number) => void;
  onPageSizeChange: (size: number) => void;
  onSort: (key: UserSortKey) => void;
  onSortChange: (id: SortOptionId) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleRow: (id: string) => void;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  rows: readonly User[];
  selected: ReadonlySet<string>;
  sort: SortState | null;
  totalCount: number;
}

export function AdminUsersTable({
  onClearSelection,
  onPageIndexChange,
  onPageSizeChange,
  filters,
  onFiltersChange,
  onFiltersClear,
  onOpenUser,
  onSort,
  onSortChange,
  onToggleAll,
  onToggleRow,
  pageCount,
  pageIndex,
  pageSize,
  rows,
  selected,
  sort,
  totalCount,
}: AdminUsersTableProps) {
  // Binary rather than tri-state: keystone's Checkbox has no indeterminate
  // variant, and re-implementing tickets-01's custom mixed-state button here
  // would duplicate a workaround rather than share one.
  const allOnPageSelected =
    rows.length > 0 && rows.every((row) => selected.has(row.id));

  return (
    <>
      {/* A real `h1`, above the card rather than inside it. `CardTitle` renders
          a div, so this section had no heading outline at all, and a title in
          the card made the panel announce itself rather than the page. */}
      <div className="flex w-full flex-col gap-6">
        <h1 className="font-semibold text-2xl tracking-tight">Users</h1>

        <Card variant="outline">
          <CardContent className="flex flex-col gap-4">
            <AdminUsersToolbar
              filters={filters}
              onChange={onFiltersChange}
              onClear={onFiltersClear}
              onSortChange={onSortChange}
              sort={sort}
            />

            <Table hoverable>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Select all users on this page"
                      checked={allOnPageSelected}
                      onCheckedChange={(checked) =>
                        onToggleAll(checked === true)
                      }
                    />
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead
                      className={"width" in column ? column.width : undefined}
                      key={column.key}
                      numeric={column.numeric}
                      sortDirection={
                        sort?.key === column.key ? sort.direction : null
                      }
                    >
                      <TableSortButton
                        direction={
                          sort?.key === column.key ? sort.direction : null
                        }
                        onClick={() => onSort(column.key)}
                      >
                        {"icon" in column ? (
                          <column.icon className="size-3.5 shrink-0" />
                        ) : null}
                        {column.label}
                      </TableSortButton>
                    </TableHead>
                  ))}
                  {/* Not sortable, so no sortDirection at all — omitting it means
                      no aria-sort, where `null` would claim the column sorts. */}
                  <TableHead>Status</TableHead>
                  {/* One icon wide, so no visible label: "Actions" above it
                      would size the column from the header. */}
                  <TableHead className="w-12">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.length === 0 ? (
                  <TableEmpty colSpan={columns.length + 3}>
                    <p className="py-10 text-center text-muted-foreground text-sm">
                      No users match these filters.
                    </p>
                  </TableEmpty>
                ) : (
                  rows.map((row) => (
                    <TableRow
                      className="group/row"
                      data-state={selected.has(row.id) ? "selected" : undefined}
                      key={row.id}
                    >
                      <TableCell>
                        <Checkbox
                          aria-label={`Select ${row.name}`}
                          checked={selected.has(row.id)}
                          onCheckedChange={() => onToggleRow(row.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-muted-foreground text-xs">
                          {row.id}
                        </span>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.role}
                      </TableCell>
                      <TableCell numeric>{row.seats}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.lastActive}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[row.status]}>
                          {statusLabels[row.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <UserRowActions
                          name={row.name}
                          onOpen={() => onOpenUser(row.id)}
                          userId={row.id}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Composed: the info slot's only props-driven content is a
                selection count, which the `SelectionBar` already states — and
                states at every width, where this slot is `hidden lg:block`. */}
            <TablePagination pageCount={pageCount} pageIndex={pageIndex}>
              <TablePaginationInfo>
                <ResultSummary
                  noun={["user", "users"]}
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  rowCount={rows.length}
                  totalCount={totalCount}
                />
              </TablePaginationInfo>
              <TablePaginationControls>
                <TablePaginationPageSize
                  onValueChange={onPageSizeChange}
                  options={[5, 10, 20, 50]}
                  value={pageSize}
                />
                <TablePaginationStatus
                  pageCount={pageCount}
                  pageIndex={pageIndex}
                />
                <TablePaginationButtons
                  onPageIndexChange={onPageIndexChange}
                  pageCount={pageCount}
                  pageIndex={pageIndex}
                />
              </TablePaginationControls>
            </TablePagination>
          </CardContent>
        </Card>
      </div>

      <SelectionBar open={selected.size > 0}>
        <SelectionBarClose onClick={onClearSelection} />
        <SelectionBarGroup>
          <SelectionBarLabel>
            {selected.size} {selected.size === 1 ? "user" : "users"} selected
          </SelectionBarLabel>
        </SelectionBarGroup>
        <SelectionBarButton>Change role</SelectionBarButton>
        <SelectionBarButton>Resend invite</SelectionBarButton>
        <SelectionBarSeparator />
        <SelectionBarButton tone="destructive">Suspend</SelectionBarButton>
      </SelectionBar>
    </>
  );
}

/** How much of the result set is on screen. */
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
