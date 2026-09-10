"use client";

import { useMemo, useState } from "react";
import { AdminOverview } from "@/components/admin-overview";
import { type AdminSection, AdminSidebar } from "@/components/admin-sidebar";
import { AdminTopbar } from "@/components/admin-topbar";
import {
  AdminUsersTable,
  type SortDirection,
  type UserSortKey,
} from "@/components/admin-users-table";
import { adminMetrics, signupsByMonth, users } from "@/components/mock-admin";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useReducedMotion } from "@/components/use-reduced-motion";

/** All state lives here; the panels below are presentational. */
export function AdminPage() {
  const reducedMotion = useReducedMotion();

  const [section, setSection] = useState<AdminSection>("overview");
  const [search, setSearch] = useState("");
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [sort, setSort] = useState<{
    direction: SortDirection;
    key: UserSortKey;
  } | null>({ direction: "asc", key: "name" });
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return users;
    }
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [search]);

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
        <AdminTopbar
          onSearchChange={(value) => {
            setSearch(value);
            setPageIndex(0);
          }}
          search={search}
          section={section}
        />

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
              onSort={cycleSort}
              onToggleAll={toggleAllOnPage}
              onToggleRow={toggleRow}
              pageCount={pageCount}
              pageIndex={pageIndex}
              pageSize={pageSize}
              rows={pageRows}
              selected={selected}
              sort={sort}
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
