"use client";

import { useState } from "react";
import { usersFromParams, usersToParams } from "./admin-filters";
import { AdminUserDetail } from "./admin-user-detail";
import { AdminUsersTable } from "./admin-users-table";
import { users } from "./mock-users";
import { useUrlState } from "./use-url-state";
import { useUsersTable } from "./use-users-table";

/**
 * The users view on its own: the table, and the record page a name opens.
 *
 * admin-01 does not render this — its `admin-page.tsx` owns the URL for every
 * section at once. It ships through the `users-01` registry item, which
 * installs these same files without the sidebar, overview or payments, and
 * it lives here so both items are built from one source.
 *
 * The URL carries the users query only (search, filters, sort, page), with no
 * `view` key: this view is the whole page.
 */
export function UsersView() {
  const table = useUsersTable();
  const [openUserId, setOpenUserId] = useState<string | null>(null);

  useUrlState(
    (params) => table.restore(usersFromParams(params)),
    usersToParams(table.query)
  );

  const openUser = openUserId
    ? (users.find((user) => user.id === openUserId) ?? null)
    : null;

  // `invitedBy` holds the inviter's id, so the record can link to them.
  const inviter = openUser?.invitedBy
    ? (users.find((user) => user.id === openUser.invitedBy) ?? null)
    : null;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
      {openUser ? (
        <AdminUserDetail
          inviter={inviter}
          onBack={() => setOpenUserId(null)}
          onOpenUser={setOpenUserId}
          user={openUser}
        />
      ) : (
        <AdminUsersTable
          onOpenUser={setOpenUserId}
          table={table}
          users={users}
        />
      )}
    </div>
  );
}
