import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";
import {
  TablePagination,
  TablePaginationButtons,
  TablePaginationControls,
  TablePaginationInfo,
  TablePaginationPageSize,
  TablePaginationStatus,
} from "@keystoneui/react/table-pagination";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useMemo, useState } from "react";
import { expect, within } from "storybook/test";

const meta = {
  title: "Components/TablePagination",
  component: TablePagination,
  parameters: {
    docs: {
      description: {
        component: `
The footer of a paginated data table: rows selected, rows per page, which page, and the four navigation buttons.

\`\`\`tsx
import { TablePagination } from "@keystoneui/react/table-pagination";
\`\`\`

Separate from \`Pagination\` on purpose. That one is a list of page *links*
(\`nav > ul > li > a\`, with \`aria-current="page"\`); this is a toolbar with an
opaque page index and no per-page URLs. It also needs \`aria-live\` rather than
\`aria-current\`, and it depends on \`Select\` and \`Label\` — merging them would
drag Base UI's Select into every bundle that only wanted page links.

Props-driven for the common case; pass \`children\` to compose the parts instead.
        `,
      },
    },
  },
} satisfies Meta<typeof TablePagination>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = Array.from({ length: 23 }, (_, index) => ({
  amount: 120 + index * 37,
  id: index + 1,
  invoice: `INV-${String(1001 + index)}`,
  status: index % 3 === 0 ? "Paid" : "Pending",
}));

export const Default: Story = {
  args: { pageCount: 3, pageIndex: 0 },
  render: () => {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = useMemo(
      () => rows.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
      [pageIndex, pageSize]
    );

    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <Table hoverable>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead numeric>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.invoice}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.status}
                </TableCell>
                <TableCell numeric>${row.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          onPageIndexChange={setPageIndex}
          onPageSizeChange={(size) => {
            setPageSize(size);
            // Page 3 of a 10-per-page list does not exist at 50 per page.
            setPageIndex(0);
          }}
          pageCount={pageCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          selectedCount={0}
          totalCount={rows.length}
        />
      </div>
    );
  },
};

export const Composed: Story = {
  args: { pageCount: 5, pageIndex: 1 },
  parameters: {
    docs: {
      description: {
        story:
          "Passing `children` replaces the default composition entirely, so you keep only the parts you want — here with no selection line and no page-size select.",
      },
    },
  },
  render: () => {
    const [pageIndex, setPageIndex] = useState(1);
    const pageCount = 5;

    return (
      <TablePagination
        className="mx-auto w-full max-w-md"
        pageCount={pageCount}
        pageIndex={pageIndex}
      >
        <TablePaginationStatus pageCount={pageCount} pageIndex={pageIndex} />
        <TablePaginationButtons
          onPageIndexChange={setPageIndex}
          pageCount={pageCount}
          pageIndex={pageIndex}
          showEdgeButtons={false}
        />
      </TablePagination>
    );
  },
};

// ---------------------------------------------------------------------------
// Phone layout: measured at 390px and 1024px
// ---------------------------------------------------------------------------

type BrowserPage = typeof import("vitest/browser").page;

/** Vitest's browser page; absent when Storybook runs the play. */
const browserPage = () =>
  (globalThis as { __browserPage?: BrowserPage }).__browserPage;

const nextFrame = () =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );

/** Resize the frame, run `check`, and put the frame back as it was. */
const atWidths = async (
  checks: Record<number, () => Promise<void>>
): Promise<void> => {
  const page = browserPage();
  if (!page) {
    return;
  }
  const restore = { height: window.innerHeight, width: window.innerWidth };
  try {
    for (const [width, check] of Object.entries(checks)) {
      // biome-ignore lint/performance/noAwaitInLoops: one viewport at a time
      await page.viewport(Number(width), 800);
      await nextFrame();
      await expect(window.innerWidth).toBe(Number(width));
      await check();
    }
  } finally {
    await page.viewport(restore.width, restore.height);
  }
};

const part = (footer: HTMLElement, slot: string) => {
  const el = footer.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  if (!el) {
    throw new Error(`no ${slot} in the footer`);
  }
  return el;
};

const lines = (el: HTMLElement) =>
  Math.round(
    el.getBoundingClientRect().height /
      Number.parseFloat(getComputedStyle(el).lineHeight)
  );

const midY = (el: HTMLElement) => {
  const rect = el.getBoundingClientRect();
  return rect.top + rect.height / 2;
};

/** The edge the controls end at: right in LTR, left in RTL. */
const endsAtContentEdge = async (footer: HTMLElement) => {
  const style = getComputedStyle(footer);
  const box = footer.getBoundingClientRect();
  const buttons = part(
    footer,
    "table-pagination-buttons"
  ).getBoundingClientRect();
  if (style.direction === "rtl") {
    await expect(buttons.left).toBeCloseTo(
      box.left + Number.parseFloat(style.paddingLeft),
      0
    );
  } else {
    await expect(buttons.right).toBeCloseTo(
      box.right - Number.parseFloat(style.paddingRight),
      0
    );
  }
};

const noSidewaysScroll = async (footer: HTMLElement) => {
  await expect(footer.scrollWidth).toBeLessThanOrEqual(footer.clientWidth);
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
    document.documentElement.clientWidth
  );
};

const PhoneFooter = ({ children }: { children?: ReactNode }) => (
  <TablePagination pageCount={12} pageIndex={0}>
    <TablePaginationInfo>{children}</TablePaginationInfo>
    <TablePaginationControls>
      <TablePaginationPageSize options={[25, 50, 100]} value={25} />
      <TablePaginationStatus pageCount={12} pageIndex={0} />
      <TablePaginationButtons pageCount={12} pageIndex={0} />
    </TablePaginationControls>
  </TablePagination>
);

/**
 * The count shows at every width. Below `lg` it takes its own row above the
 * controls, so it reads on one line instead of being squeezed beside them;
 * from `lg` up the footer is one row, as before.
 */
export const PhoneLayout: Story = {
  args: { pageCount: 12, pageIndex: 0 },
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex flex-col gap-8 p-4">
      <div data-testid="ltr">
        <PhoneFooter>Showing 1–25 of 300 results</PhoneFooter>
      </div>
      <div data-testid="rtl" dir="rtl">
        <PhoneFooter>عرض ١–٢٥ من ٣٠٠ نتيجة</PhoneFooter>
      </div>
      {/* A props-driven footer has no info element to take a class, so the
          way back to the count hidden below `lg` goes on the root. */}
      <div data-testid="root-opt-out">
        <TablePagination
          className="[&_[data-slot=table-pagination-info]]:max-lg:hidden"
          pageCount={12}
          pageIndex={0}
          pageSize={25}
          pageSizeOptions={[25, 50, 100]}
          selectedCount={3}
          totalCount={300}
        />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const footers = ["ltr", "rtl"].map((id) =>
      part(canvas.getByTestId(id), "table-pagination")
    );
    const optOut = part(canvas.getByTestId("root-opt-out"), "table-pagination");

    await atWidths({
      390: async () => {
        for (const footer of footers) {
          const info = part(footer, "table-pagination-info");
          const controls = part(footer, "table-pagination-controls");
          // biome-ignore lint/performance/noAwaitInLoops: one footer at a time
          await expect(getComputedStyle(info).display).not.toBe("none");
          await expect(lines(info)).toBe(1);
          await expect(info.getBoundingClientRect().bottom).toBeLessThanOrEqual(
            controls.getBoundingClientRect().top
          );
          await noSidewaysScroll(footer);
          for (const name of [/previous page/i, /next page/i]) {
            const button = within(footer)
              .getByRole("button", { name })
              .getBoundingClientRect();
            // biome-ignore lint/performance/noAwaitInLoops: one button at a time
            await expect([button.width, button.height]).toEqual([32, 32]);
          }
        }
        await expect([
          getComputedStyle(part(optOut, "table-pagination-info")).display,
          optOut.getBoundingClientRect().height,
        ]).toEqual(["none", 32]);
      },
      1024: async () => {
        for (const footer of footers) {
          const info = part(footer, "table-pagination-info");
          const pageSize = part(footer, "table-pagination-page-size");
          // biome-ignore lint/performance/noAwaitInLoops: one footer at a time
          await expect(lines(info)).toBe(1);
          await expect(midY(info)).toBeCloseTo(midY(pageSize), 0);
          await endsAtContentEdge(footer);
          await noSidewaysScroll(footer);
        }
      },
    });
  },
};

/**
 * With nothing in the count slot the footer stays one 32px row on a phone,
 * and from `lg` up the empty slot still pushes the controls to the end.
 */
export const PhoneLayoutEmptySlot: Story = {
  args: { pageCount: 12, pageIndex: 0 },
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="p-4" data-testid="empty">
      <PhoneFooter />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const footer = part(
      within(canvasElement).getByTestId("empty"),
      "table-pagination"
    );

    await atWidths({
      390: async () => {
        await expect(footer.getBoundingClientRect().height).toBe(32);
        await noSidewaysScroll(footer);
      },
      1024: async () => {
        await expect(footer.getBoundingClientRect().height).toBe(32);
        await endsAtContentEdge(footer);
      },
    });
  },
};
