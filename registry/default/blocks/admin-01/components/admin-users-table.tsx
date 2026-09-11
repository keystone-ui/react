"use client";

import { HashIcon } from "lucide-react";
import {
  type RoleFilter,
  type SortOptionId,
  type SortState,
  STATUS_VARIANT,
  type StatusFilter,
  type UserSortKey,
} from "@/components/admin-filters";
import { AdminUsersToolbar } from "@/components/admin-users-toolbar";
import { statusLabels, type User } from "@/components/mock-admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SelectionBar,
  SelectionBarButton,
  SelectionBarClose,
  SelectionBarGroup,
  SelectionBarLabel,
  SelectionBarSeparator,
} from "@/components/ui/selection-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/table-pagination";

// Re-exported for the page, which composes this table. The types themselves
// live in `admin-filters.ts` so the dependency runs one way.
export type {
  SortDirection,
  SortState,
  UserSortKey,
} from "@/components/admin-filters";

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
  onClearSelection: () => void;
  onOpenUser: (id: string) => void;
  onPageIndexChange: (index: number) => void;
  onPageSizeChange: (size: number) => void;
  onRoleFilterChange: (role: RoleFilter) => void;
  onSearchChange: (value: string) => void;
  onSort: (key: UserSortKey) => void;
  onSortChange: (id: SortOptionId) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleRow: (id: string) => void;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  roleFilter: RoleFilter;
  rows: readonly User[];
  search: string;
  selected: ReadonlySet<string>;
  sort: SortState | null;
  statusFilter: StatusFilter;
  totalCount: number;
}

export function AdminUsersTable({
  onClearSelection,
  onPageIndexChange,
  onPageSizeChange,
  onRoleFilterChange,
  onSearchChange,
  onOpenUser,
  onSort,
  onSortChange,
  onStatusFilterChange,
  onToggleAll,
  onToggleRow,
  pageCount,
  pageIndex,
  pageSize,
  roleFilter,
  rows,
  search,
  selected,
  sort,
  statusFilter,
  totalCount,
}: AdminUsersTableProps) {
  // Binary rather than tri-state: keystone's Checkbox has no indeterminate
  // variant, and re-implementing tickets-01's custom mixed-state button here
  // would duplicate a workaround rather than share one.
  const allOnPageSelected =
    rows.length > 0 && rows.every((row) => selected.has(row.id));

  return (
    <>
      {/* The table goes in CardContent, so the title, the row separators and
          the cell text share the card's horizontal padding. A flush table
          under a padded title leaves the heading indented three times further
          than the columns. */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle className="font-semibold">Users</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <AdminUsersToolbar
            onRoleFilterChange={onRoleFilterChange}
            onSearchChange={onSearchChange}
            onSortChange={onSortChange}
            onStatusFilterChange={onStatusFilterChange}
            roleFilter={roleFilter}
            search={search}
            sort={sort}
            statusFilter={statusFilter}
          />

          <Table hoverable>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Select all users on this page"
                    checked={allOnPageSelected}
                    onCheckedChange={(checked) => onToggleAll(checked === true)}
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
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={columns.length + 2}>
                  <p className="py-10 text-center text-muted-foreground text-sm">
                    No users match these filters.
                  </p>
                </TableEmpty>
              ) : (
                rows.map((row) => (
                  <TableRow
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
                      <button
                        className="cursor-pointer rounded-sm text-left font-medium hover:underline focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2"
                        onClick={() => onOpenUser(row.id)}
                        type="button"
                      >
                        {row.name}
                      </button>
                      <div className="text-muted-foreground text-xs">
                        {row.email}
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            onPageIndexChange={onPageIndexChange}
            onPageSizeChange={onPageSizeChange}
            pageCount={pageCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 20, 50]}
            selectedCount={selected.size}
            totalCount={totalCount}
          />
        </CardContent>
      </Card>

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
