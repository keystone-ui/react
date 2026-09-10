"use client";

import {
  SearchIcon,
  ShieldUserIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { type Role, type Status, statusLabels } from "@/components/mock-admin";
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

export type RoleFilter = "all" | Role;
export type StatusFilter = "all" | Status;

// The "all" entry is rendered explicitly above the separator in each menu, so
// these hold only the real values — which is also what keeps the `.map()`
// bodies free of casts back to `Role`/`Status`.
const ROLES: readonly Role[] = ["Admin", "Billing", "Member", "Viewer"];
const STATUSES: readonly Status[] = ["active", "invited", "suspended"];

interface AdminUsersToolbarProps {
  onRoleFilterChange: (role: RoleFilter) => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  roleFilter: RoleFilter;
  search: string;
  statusFilter: StatusFilter;
}

/**
 * The filter row for the users table, following `tickets-01`'s toolbar.
 *
 * Two deliberate differences from that block rather than a copy of it:
 *
 *  - No mobile filters drawer. `tickets-01` forks at `sm:` into a single
 *    drawer trigger, which is the right answer for its nine controls;
 *    with three, `flex-wrap` degrades fine and duplicating the drawer would
 *    add ~100 lines to demonstrate a pattern that block already shows.
 *  - No column-visibility menu. Six columns do not earn one, and
 *    `tickets-01` covers it.
 */
export function AdminUsersToolbar({
  onRoleFilterChange,
  onSearchChange,
  onStatusFilterChange,
  roleFilter,
  search,
  statusFilter,
}: AdminUsersToolbarProps) {
  // Hoisted rather than inlined as ternaries in the triggers: the narrowing
  // makes `statusLabels[statusFilter]` type-check without a cast, and it keeps
  // the trigger markup down to the label it renders.
  const roleLabel = roleFilter === "all" ? "All roles" : roleFilter;
  const statusLabel =
    statusFilter === "all" ? "All statuses" : statusLabels[statusFilter];

  const activeCount =
    (search.trim() ? 1 : 0) +
    (roleFilter === "all" ? 0 : 1) +
    (statusFilter === "all" ? 0 : 1);

  return (
    <div className="flex flex-wrap items-center gap-2">
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

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
          <ShieldUserIcon />
          {roleLabel}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuGroup>
            <DropdownMenuRadioGroup
              onValueChange={(value) => onRoleFilterChange(value as RoleFilter)}
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
        <DropdownMenuTrigger render={<Button size="sm" variant="outline" />}>
          <SlidersHorizontalIcon />
          {statusLabel}
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

      {/* Only rendered when something is actually filtered — a permanently
          visible "Clear" on an unfiltered table is a control that does
          nothing, and it hides the one signal that a filter is on. */}
      {activeCount > 0 && (
        <Button
          onClick={() => {
            onSearchChange("");
            onRoleFilterChange("all");
            onStatusFilterChange("all");
          }}
          size="sm"
          variant="ghost"
        >
          Clear {activeCount}
        </Button>
      )}
    </div>
  );
}
