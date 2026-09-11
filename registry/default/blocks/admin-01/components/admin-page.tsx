"use client";

import { useMemo, useState } from "react";
import {
  fromSortOptionId,
  type RoleFilter,
  type SortOptionId,
  type SortState,
  type StatusFilter,
  type UserSortKey,
} from "@/components/admin-filters";
import { AdminOverview } from "@/components/admin-overview";
import { type AdminSection, AdminSidebar } from "@/components/admin-sidebar";
import { AdminTopbar } from "@/components/admin-topbar";
import { AdminUsersTable } from "@/components/admin-users-table";
import { adminMetrics, signupsByMonth, users } from "@/components/mock-admin";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useReducedMotion } from "@/components/use-reduced-motion";

/** All state lives here; the panels below are presentational. */
export function AdminPage() {
  const reducedMotion = useReducedMotion();

  const [section, setSection] = useState<AdminSection>("overview");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [sort, setSort] = useState<SortState | null>({
    direction: "asc",
    key: "name",
  });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) {
        return false;
      }
      if (statusFilter !== "all" && user.status !== statusFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });
  }, [roleFilter, search, statusFilter]);

  const sorted = useMemo(() => {
    if (!sort) {
      return filtered;
    }
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      if (typeof left === "string" && typeof right === "string") {
        return left.localeCompare(right) * factor;
      }
      return ((left as number) - (right as number)) * factor;
    });
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize
  );

  const toggleSeries = (key: string) => {
    setHidden((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleRow = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllOnPage = (checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      for (const row of pageRows) {
        if (checked) {
          next.add(row.id);
        } else {
          next.delete(row.id);
        }
      }
      return next;
    });
  };

  const filterAndReset =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      // Page 2 of the unfiltered list usually does not exist once a filter is
      // applied, and a table showing "Page 2 of 1" with no rows looks broken.
      setPageIndex(0);
    };

  // The toolbar and the drawer set the sort directly; the headers cycle it.
  // Both land on the one `sort` state, so the two stay in step with no syncing.
  const setSortFromOption = (id: SortOptionId) => {
    setPageIndex(0);
    setSort(fromSortOptionId(id));
  };

  const cycleSort = (key: UserSortKey) => {
    setPageIndex(0);
    setSort((current) => {
      if (current?.key !== key) {
        return { direction: "asc", key };
      }
      if (current.direction === "asc") {
        return { direction: "desc", key };
      }
      return null;
    });
  };

  return (
    <SidebarProvider>
      <AdminSidebar onSectionChange={setSection} section={section} />
      {/* min-w-0 is required, not cosmetic. Without it a wide table pushes the
          inset open and the whole document gains a horizontal scrollbar — in
          the app this pattern came from, its absence cost +256px of overflow
          across eight pages. Keystone can bake this into components it owns;
          this one is shadcn's, so it lands at the call site. */}
      <SidebarInset className="min-w-0">
        <AdminTopbar section={section} />

        <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
          {section === "users" ? (
            <AdminUsersTable
              onClearSelection={() => setSelected(new Set())}
              onPageIndexChange={setPageIndex}
              onPageSizeChange={(size) => {
                setPageSize(size);
                // Page 3 of a 5-per-page list does not exist at 50 per page.
                setPageIndex(0);
              }}
              onRoleFilterChange={filterAndReset(setRoleFilter)}
              onSearchChange={filterAndReset(setSearch)}
              onSort={cycleSort}
              onSortChange={setSortFromOption}
              onStatusFilterChange={filterAndReset(setStatusFilter)}
              onToggleAll={toggleAllOnPage}
              onToggleRow={toggleRow}
              pageCount={pageCount}
              pageIndex={pageIndex}
              pageSize={pageSize}
              roleFilter={roleFilter}
              rows={pageRows}
              search={search}
              selected={selected}
              sort={sort}
              statusFilter={statusFilter}
              totalCount={sorted.length}
            />
          ) : null}

          {section === "overview" ? (
            <AdminOverview
              hidden={hidden}
              metrics={adminMetrics}
              onToggle={toggleSeries}
              reducedMotion={reducedMotion}
              signups={signupsByMonth}
            />
          ) : null}

          {section === "billing" || section === "settings" ? (
            <div className="flex h-[420px] items-center justify-center rounded-xl border border-border border-dashed bg-muted/20 text-muted-foreground text-sm">
              {section === "billing" ? "Billing" : "Settings"} lives here.
            </div>
          ) : null}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
