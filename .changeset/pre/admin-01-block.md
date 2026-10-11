---
"@keystoneui/react": patch
---

Add the `admin-01` block: an admin panel.

A collapsible sidebar shell, a topbar with breadcrumb and search, an overview
with KPI tiles and a stacked signups chart, and a sortable, paginated users
table with row selection and a `SelectionBar` for bulk actions.

The sidebar is **shadcn's, not keystone's** — keystone deliberately ships no app
shell. The block's `registryDependencies` name `sidebar` as a bare item so it
resolves against shadcn's registry, and the new Interop guide covers the two
things that then need care: deleting the `--sidebar-*` block `shadcn add`
appends (keystone's aliases follow your theme; shadcn's hardcoded neutral values
land afterwards and win), and passing `min-w-0` to `SidebarInset`, without which
the wide users table gives the document a horizontal scrollbar.

Four chart-infrastructure files are duplicated verbatim from `dashboard-01`
rather than shared through a registry item. A block's installable copy is flat,
so two blocks shipping a `chart.tsx` write to the same consumer path and
installing both is last-writer-wins; hoisting them into their own item would put
chart code back on the installable component surface, which is what keeping
recharts a block dependency avoids. `apps/docs/tests/block-shared-files.test.ts`
enforces the copies stay byte-identical and fails if a new basename starts
colliding without being classified.
