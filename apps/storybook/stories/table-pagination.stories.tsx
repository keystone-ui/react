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
  TablePaginationStatus,
} from "@keystoneui/react/table-pagination";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";

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
