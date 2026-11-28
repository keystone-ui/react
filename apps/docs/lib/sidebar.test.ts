import type * as PageTree from "fumadocs-core/page-tree";
import { describe, expect, it } from "vitest";

import { type Row, type SectionRow, sectionFor, sidebarViews } from "./sidebar";

// A tab's page tree as Fumadocs builds it from meta.json: pages, `---Name---`
// separators, and a folder whose overview sits in `index`.
const p = (name: string, url: string): PageTree.Item => ({
  type: "page",
  name,
  url,
});
const sep = (name: string): PageTree.Separator => ({ type: "separator", name });

const tab = {
  children: [
    p("Button", "/docs/components/button"),
    p("Input", "/docs/components/input"),
    sep("Layout"),
    p("Card", "/docs/components/card"),
    p("Separator", "/docs/components/separator"),
    sep("Forms"),
    p("Checkbox", "/docs/components/checkbox"),
    {
      type: "folder",
      name: "Pickers",
      index: p("Pickers", "/docs/components/pickers"),
      children: [p("Date picker", "/docs/components/date-picker")],
    },
  ] satisfies PageTree.Node[],
};

const urls = (rows: (Row | SectionRow)[]) =>
  rows.flatMap((row) => (row.type === "page" ? [row.url] : []));

describe("sidebarViews", () => {
  const views = sidebarViews(tab);

  it("keeps pages before the first separator as top-level rows, then a row per section", () => {
    expect(views.main.map((row) => [row.type, row.name])).toEqual([
      ["page", "Button"],
      ["page", "Input"],
      ["section", "Layout"],
      ["section", "Forms"],
    ]);
  });

  it("puts every page up to the next separator in the separator's section", () => {
    expect(views.sections.map((s) => [s.name, urls(s.rows)])).toEqual([
      ["Layout", ["/docs/components/card", "/docs/components/separator"]],
      [
        "Forms",
        [
          "/docs/components/checkbox",
          "/docs/components/pickers",
          "/docs/components/date-picker",
        ],
      ],
    ]);
  });

  it("heads a folder inside a section with its name, overview first", () => {
    const forms = views.sections.find((s) => s.name === "Forms");
    expect(forms?.rows.map((row) => row.name)).toEqual([
      "Checkbox",
      "Pickers",
      "Overview",
      "Date picker",
    ]);
  });

  it("makes a top-level folder its own section", () => {
    const folderTab = {
      children: [
        p("Introduction", "/docs"),
        {
          type: "folder",
          $id: "theming",
          name: "Theming",
          index: p("Theming", "/docs/theming"),
          children: [p("Colors", "/docs/theming/colors")],
        },
      ] satisfies PageTree.Node[],
    };
    const { main, sections } = sidebarViews(folderTab);
    expect(main.map((row) => row.type)).toEqual(["page", "section"]);
    expect(sections[0]).toMatchObject({ id: "theming", name: "Theming" });
    expect(urls(sections[0].rows)).toEqual([
      "/docs/theming",
      "/docs/theming/colors",
    ]);
  });

  it("ends a section at an unnamed separator", () => {
    const { main } = sidebarViews({
      children: [
        sep("Layout"),
        p("Card", "/docs/card"),
        sep(""),
        p("FAQ", "/docs/faq"),
      ],
    });
    expect(main.map((row) => row.name)).toEqual(["Layout", "FAQ"]);
  });

  it("shows every page in exactly one view", () => {
    const all = [
      ...urls(views.main),
      ...views.sections.flatMap((s) => urls(s.rows)),
    ];
    expect(all).toHaveLength(new Set(all).size);
    expect(all).toHaveLength(7);
  });

  it("gives every section a distinct id", () => {
    const ids = views.sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("sectionFor", () => {
  const views = sidebarViews(tab);
  const layout = views.sections[0].id;
  const forms = views.sections[1].id;

  it("is undefined for a top-level page", () => {
    expect(sectionFor(views, "/docs/components/button")).toBeUndefined();
  });

  it("is the page's section, with or without a trailing slash", () => {
    expect(sectionFor(views, "/docs/components/card")).toBe(layout);
    expect(sectionFor(views, "/docs/components/date-picker/")).toBe(forms);
  });

  it("is undefined for a path that is no page", () => {
    expect(sectionFor(views, "/docs/components/nowhere")).toBeUndefined();
  });
});
