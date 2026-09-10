"use client";

import { Badge } from "@keystoneui/react/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import { Checkbox } from "@keystoneui/react/checkbox";
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
import { TablePagination } from "@keystoneui/react/table-pagination";
import {
  AdminUsersToolbar,
  type RoleFilter,
  type StatusFilter,
} from "./admin-users-toolbar";
import { type Status, statusLabels, type User } from "./mock-admin";

export type UserSortKey = "lastActive" | "name" | "role" | "seats";
export type SortDirection = "asc" | "desc";

const columns = [
  { key: "name", label: "User", numeric: false },
  { key: "role", label: "Role", numeric: false },
  { key: "seats", label: "Seats", numeric: true },
  { key: "lastActive", label: "Last active", numeric: false },
] as const;

const STATUS_VARIANT: Record<Status, "default" | "outline" | "secondary"> = {
  active: "secondary",
  invited: "outline",
  suspended: "outline",
};

interface AdminUsersTableProps {
  onClearSelection: () => void;
  onPageIndexChange: (index: number) => void;
  onPageSizeChange: (size: number) => void;
  onRoleFilterChange: (role: RoleFilter) => void;
  onSearchChange: (value: string) => void;
  onSort: (key: UserSortKey) => void;
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
  sort: { direction: SortDirection; key: UserSortKey } | null;
  statusFilter: StatusFilter;
  totalCount: number;
}

export function AdminUsersTable({
  onClearSelection,
  onPageIndexChange,
  onPageSizeChange,
  onRoleFilterChange,
  onSearchChange,
  onSort,
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
            onStatusFilterChange={onStatusFilterChange}
            roleFilter={roleFilter}
            search={search}
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
                      <div className="font-medium">{row.name}</div>
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
