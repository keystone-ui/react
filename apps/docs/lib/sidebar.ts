import type * as PageTree from "fumadocs-core/page-tree";

/**
 * The docs sidebar shows one level at a time (components/docs-sidebar.tsx):
 * the tab's top-level rows, where each section is a row that opens it, or
 * one section's pages with a way back. These pure helpers turn a tab's page
 * tree into those two views.
 */

type Name = PageTree.Node["name"];

/** A row in one of the views: a page, a link out of the docs, or a group's name. */
export type Row =
  | { type: "page"; name: Name; url: string; external: boolean }
  | { type: "label"; name: Name };

/** A section, shown as its own view. */
export interface Section {
  id: string;
  name: Name;
  rows: Row[];
}

/** A top-level row that opens a section. */
export interface SectionRow {
  id: string;
  name: Name;
  type: "section";
}

export interface Views {
  main: (Row | SectionRow)[];
  sections: Section[];
}

const page = (node: PageTree.Item, name: Name = node.name): Row => ({
  type: "page",
  name,
  url: node.url,
  external: node.external ?? false,
});

// Fumadocs moves a folder's overview page out of its children and into
// `index`, so the folder's name could link to it. In a section the name no
// longer links anywhere, so the overview goes back in as the first row.
const folderRows = (folder: PageTree.Folder): Row[] => [
  ...(folder.index ? [page(folder.index, "Overview")] : []),
  ...flatten(folder.children),
];

// Inside a section nothing opens again: a nested folder's name heads its
// pages, the way a separator does.
const flatten = (nodes: PageTree.Node[]): Row[] =>
  nodes.flatMap((node): Row[] => {
    if (node.type === "page") {
      return [page(node)];
    }
    if (node.type === "separator") {
      return node.name ? [{ type: "label", name: node.name }] : [];
    }
    return [{ type: "label", name: node.name }, ...folderRows(node)];
  });

/**
 * Splits a tab's top-level nodes into views. Pages before the first
 * separator stay top-level rows. A named separator starts a section that
 * holds every node up to the next separator: the docs group their pages
 * with `---Name---` in meta.json. A top-level folder is a section of its own.
 */
export function sidebarViews(root: { children: PageTree.Node[] }): Views {
  const main: Views["main"] = [];
  const sections: Section[] = [];
  let open: Section | undefined;

  for (const [i, node] of root.children.entries()) {
    if (node.type === "separator") {
      open = node.name
        ? { id: node.$id ?? `section-${i}`, name: node.name, rows: [] }
        : undefined;
      if (open) {
        sections.push(open);
        main.push({ type: "section", id: open.id, name: open.name });
      }
    } else if (open) {
      open.rows.push(...flatten([node]));
    } else if (node.type === "page") {
      main.push(page(node));
    } else {
      const section = {
        id: node.$id ?? `section-${i}`,
        name: node.name,
        rows: folderRows(node),
      };
      sections.push(section);
      main.push({ type: "section", id: section.id, name: section.name });
    }
  }

  return { main, sections };
}

const trim = (url: string) =>
  url.length > 1 && url.endsWith("/") ? url.slice(0, -1) : url;

/** True when a row's URL is the page at `pathname`. */
export const isCurrent = (url: string, pathname: string) =>
  trim(url) === trim(pathname);

/** The section holding the page at `pathname`, or undefined for a top-level page or no page. */
export function sectionFor(views: Views, pathname: string): string | undefined {
  return views.sections.find((section) =>
    section.rows.some(
      (row) =>
        row.type === "page" && !row.external && isCurrent(row.url, pathname)
    )
  )?.id;
}
