/**
 * `users-01` is admin-01's users view on its own, and it is built from
 * admin-01's files rather than from copies of them, the way `filter-pills`
 * is. One source means an edit to the users table reaches both items, and an
 * app that installs both writes the same bytes to the same paths.
 *
 * This pins that shape, so the item cannot be quietly "fixed" into a second
 * set of files that then drift.
 */

import { describe, expect, it } from "vitest";

import { readRegistry } from "./registry-paths";

const ADMIN_COMPONENTS = "registry/default/blocks/admin-01/components/";
/** admin-01 files that belong to its other sections, not the users view. */
const NOT_USERS_VIEW =
  /\/(payment-[^/]*|mock-payments|mock-admin|use-payments-table|admin-page|admin-sidebar|admin-topbar|admin-overview|sidebar|chart[^/]*|series-legend)\.tsx?$/;

const registry = readRegistry();
const item = (name: string) => registry.items.find((i) => i.name === name);

describe("users-01", () => {
  it("is a block with a page entry point of its own", () => {
    const users = item("users-01");
    expect(users?.type).toBe("registry:block");
    const pages = (users?.files ?? []).filter(
      (file) => file.type === "registry:page"
    );
    expect(pages.map((file) => file.path)).toEqual([
      "registry/default/blocks/users-01/page.tsx",
    ]);
  });

  it("ships admin-01's generated files, not copies of them", () => {
    const components = (item("users-01")?.files ?? []).filter(
      (file) => file.type === "registry:component"
    );
    expect(components.length).toBeGreaterThan(0);
    expect(
      components.filter((file) => !file.path.startsWith(ADMIN_COMPONENTS))
    ).toEqual([]);
  });

  it("ships every shared file admin-01 also ships, except the view shell", () => {
    // users-view.tsx is the one file admin-01's own page does not render.
    const adminPaths = new Set(
      (item("admin-01")?.files ?? []).map((file) => file.path)
    );
    const usersOnly = (item("users-01")?.files ?? [])
      .filter((file) => file.type === "registry:component")
      .map((file) => file.path)
      .filter((path) => !adminPaths.has(path));
    expect(usersOnly).toEqual([`${ADMIN_COMPONENTS}users-view.tsx`]);
  });

  it("carries no payments, overview or sidebar files", () => {
    const paths = (item("users-01")?.files ?? []).map((file) => file.path);
    expect(paths.filter((path) => NOT_USERS_VIEW.test(path))).toEqual([]);
  });
});
