"use client";

import {
  ArrowUpDownIcon,
  SearchIcon,
  ShieldUserIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import {
  ROLES,
  type RoleFilter,
  roleLabel,
  SORT_OPTIONS,
  type SortOptionId,
  type SortState,
  STATUSES,
  type StatusFilter,
  sortLabel,
  statusLabel,
  toSortOptionId,
} from "@/components/admin-filters";
import { AdminFiltersDrawer } from "@/components/admin-filters-drawer";
import { statusLabels } from "@/components/mock-admin";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface AdminUsersToolbarProps {
  onRoleFilterChange: (role: RoleFilter) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (id: SortOptionId) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  roleFilter: RoleFilter;
  search: string;
  sort: SortState | null;
  statusFilter: StatusFilter;
}

/**
 * The filter row for the users table.
 *
 * Forks at `sm:` exactly as `tickets-01` does — search is shared and always
 * visible, the desktop cluster is `hidden sm:flex`, and below that a single
 * Filters button opens a drawer. The fork is CSS-only, so both trees are always
 * mounted and there is no `useMediaQuery` to get wrong on the server.
 *
 * No `size` prop on anything: every control sits on the `default` 40px tier, so
 * the row lines up. This block previously paired `size="sm"` buttons with a
 * default-height `InputGroup` — an 8px mismatch, and the reason
 * `apps/docs/e2e/control-heights.spec.ts` exists.
 *
 * One deliberate difference from `tickets-01`: no column-visibility menu. Six
 * columns do not earn one, and that block already demonstrates the pattern.
 */
export function AdminUsersToolbar({
  onRoleFilterChange,
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
  roleFilter,
  search,
  sort,
  statusFilter,
}: AdminUsersToolbarProps) {
  // Sort is deliberately not counted. It is not a filter, and `Clear` must not
  // silently reorder the table.
  const activeCount =
    (search.trim() ? 1 : 0) +
    (roleFilter === "all" ? 0 : 1) +
    (statusFilter === "all" ? 0 : 1);

  const clearAll = () => {
    onSearchChange("");
    onRoleFilterChange("all");
    onStatusFilterChange("all");
  };

  return (
    <div className="flex flex-row items-center gap-2 sm:justify-between sm:gap-3">
      <InputGroup className="min-w-0 flex-1 sm:max-w-xs">
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search users"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name or email…"
          type="search"
          value={search}
        />
      </InputGroup>

      <div className="shrink-0 sm:hidden">
        <AdminFiltersDrawer
          activeCount={activeCount}
          onClearAll={clearAll}
          onRoleFilterChange={onRoleFilterChange}
          onSortChange={onSortChange}
          onStatusFilterChange={onStatusFilterChange}
          roleFilter={roleFilter}
          sort={sort}
          statusFilter={statusFilter}
        />
      </div>

      <div className="hidden flex-wrap items-center gap-2 sm:flex">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <ShieldUserIcon />
            {roleLabel(roleFilter)}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  onRoleFilterChange(value as RoleFilter)
                }
                value={roleFilter}
              >
                <DropdownMenuRadioItem value="all">
                  All roles
                </DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                {ROLES.map((role) => (
                  <DropdownMenuRadioItem key={role} value={role}>
                    {role}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <SlidersHorizontalIcon />
            {statusLabel(statusFilter)}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  onStatusFilterChange(value as StatusFilter)
                }
                value={statusFilter}
              >
                <DropdownMenuRadioItem value="all">
                  All statuses
                </DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                {STATUSES.map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    {statusLabels[status]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Drives the same `sort` state the column headers write, so picking
            here moves the header arrow and vice versa. One system, no sync. */}
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            <ArrowUpDownIcon />
            {sortLabel(sort)}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) => onSortChange(value as SortOptionId)}
                value={toSortOptionId(sort)}
              >
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option.id} value={option.id}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Only rendered when something is actually filtered — a permanently
            visible "Clear" on an unfiltered table is a control that does
            nothing, and it hides the one signal that a filter is on. */}
        {activeCount > 0 && (
          <Button onClick={clearAll} variant="ghost">
            Clear {activeCount}
          </Button>
        )}
      </div>
    </div>
  );
}
