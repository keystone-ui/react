"use client";

import { useState } from "react";
import { usersFromParams, usersToParams } from "@/components/admin-filters";
import { AdminOverview } from "@/components/admin-overview";
import { AdminPaymentsTable } from "@/components/admin-payments-table";
import { type AdminSection, AdminSidebar } from "@/components/admin-sidebar";
import { AdminTopbar } from "@/components/admin-topbar";
import { AdminUserDetail } from "@/components/admin-user-detail";
import { AdminUsersTable } from "@/components/admin-users-table";
import { adminMetrics, signupsByMonth, users } from "@/components/mock-admin";
import { payments } from "@/components/mock-payments";
import { PaymentDetailDrawer } from "@/components/payment-detail-drawer";
import {
  paymentsFromParams,
  paymentsToParams,
} from "@/components/payment-filters";
import { SidebarInset, SidebarProvider } from "@/components/sidebar";
import { oneOf } from "@/components/url-params";
import { usePaymentsTable } from "@/components/use-payments-table";
import { useReducedMotion } from "@/components/use-reduced-motion";
import { useUrlState } from "@/components/use-url-state";
import { useUsersTable } from "@/components/use-users-table";

const SECTIONS: readonly AdminSection[] = [
  "overview",
  "users",
  "payments",
  "billing",
  "settings",
];

/** All state lives here; the panels below are presentational. */
export function AdminPage() {
  const reducedMotion = useReducedMotion();

  const [section, setSection] = useState<AdminSection>("overview");
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const usersTable = useUsersTable();
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const paymentsTable = usePaymentsTable();
  const [openPaymentId, setOpenPaymentId] = useState<string | null>(null);

  // The URL carries the open section and that section's query, so a link
  // opens on the same rows. Only the open section's: a link to a filtered
  // payments view should not also carry a users filter nobody can see.
  useUrlState(
    (params) => {
      const view = oneOf(params.get("view"), SECTIONS, "overview");
      setSection(view);
      if (view === "users") {
        usersTable.restore(usersFromParams(params));
      }
      if (view === "payments") {
        paymentsTable.restore(paymentsFromParams(params));
      }
    },
    {
      view: section === "overview" ? "" : section,
      ...(section === "users" ? usersToParams(usersTable.query) : {}),
      ...(section === "payments" ? paymentsToParams(paymentsTable.query) : {}),
    }
  );

  const openUser = openUserId
    ? (users.find((user) => user.id === openUserId) ?? null)
    : null;

  // `invitedBy` holds the inviter's id, so the record can link to them.
  const inviter = openUser?.invitedBy
    ? (users.find((user) => user.id === openUser.invitedBy) ?? null)
    : null;

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

  return (
    <SidebarProvider>
      <AdminSidebar
        onSectionChange={(next) => {
          setSection(next);
          setOpenUserId(null);
          setOpenPaymentId(null);
        }}
        section={section}
      />
      {/* min-w-0 is required, not cosmetic. Without it a wide table pushes the
          inset open and the whole document gains a horizontal scrollbar — in
          the app this pattern came from, its absence cost +256px of overflow
          across eight pages. Keystone can bake this into components it owns;
          this one is shadcn's, so it lands at the call site. */}
      <SidebarInset className="min-w-0">
        <AdminTopbar
          detail={openUser?.name}
          onDetailExit={() => setOpenUserId(null)}
          section={section}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
          {section === "users" && openUser ? (
            <AdminUserDetail
              inviter={inviter}
              onBack={() => setOpenUserId(null)}
              onOpenUser={setOpenUserId}
              user={openUser}
            />
          ) : null}

          {section === "users" && !openUser ? (
            <AdminUsersTable onOpenUser={setOpenUserId} table={usersTable} />
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

          {section === "payments" ? (
            <AdminPaymentsTable
              onOpenPayment={setOpenPaymentId}
              table={paymentsTable}
            />
          ) : null}

          {/* Always mounted, open only while a payment is chosen, so the
              Drawer can play its exit animation rather than vanish with its
              row. Leaving the section clears the choice. */}
          <PaymentDetailDrawer
            onClose={() => setOpenPaymentId(null)}
            payment={
              section === "payments" && openPaymentId
                ? (payments.find((payment) => payment.id === openPaymentId) ??
                  null)
                : null
            }
          />

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
