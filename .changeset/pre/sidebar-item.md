---
"@keystoneui/react": patch
---

Install the sidebar on its own

The collapsible sidebar from `admin-01` is now its own registry item, installed with `npx shadcn@latest add https://keystoneui.io/r/sidebar.json`. It writes the same `components/sidebar.tsx` the block ships. The docs now say that `SidebarInset` already sets `min-w-0`, and that passing `open` and `onOpenChange` does not stop the `sidebar_state` cookie from being written.
