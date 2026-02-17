"use client";

import { Button } from "keystoneui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

export default function PaginationDataTable() {
  return (
    <div className="flex items-center justify-end space-x-4 md:space-x-6 lg:space-x-8">
      <div className="flex items-center justify-center font-medium text-sm">
        Page 1 of 3
      </div>
      <div className="flex items-center space-x-2">
        <Button aria-label="Go to first page" size="icon-sm" variant="outline">
          <ChevronsLeftIcon />
        </Button>
        <Button
          aria-label="Go to previous page"
          size="icon-sm"
          variant="outline"
        >
          <ChevronLeftIcon />
        </Button>
        <Button aria-label="Go to next page" size="icon-sm" variant="outline">
          <ChevronRightIcon />
        </Button>
        <Button aria-label="Go to last page" size="icon-sm" variant="outline">
          <ChevronsRightIcon />
        </Button>
      </div>
    </div>
  );
}
