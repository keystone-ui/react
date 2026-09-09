"use client";

import {
  TablePagination,
  TablePaginationButtons,
  TablePaginationStatus,
} from "@keystoneui/react/table-pagination";
import { useState } from "react";

export default function TablePaginationComposed() {
  const [pageIndex, setPageIndex] = useState(1);
  const pageCount = 5;

  return (
    // Passing children replaces the default composition entirely, so you keep
    // only the parts you want — here: no selection line, no page-size select.
    <TablePagination
      className="w-full"
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
}
