"use client";

import { Button } from "@keystoneui/react/button";
import { Label } from "@keystoneui/react/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useId } from "react";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface TicketsPaginationProps {
  onPageIndexChange: (next: number) => void;
  onPageSizeChange: (next: number) => void;
  pageIndex: number;
  pageSize: number;
  selectedCount: number;
  totalCount: number;
}

export function TicketsPagination({
  totalCount,
  selectedCount,
  pageIndex,
  pageSize,
  onPageIndexChange,
  onPageSizeChange,
}: TicketsPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < pageCount - 1;
  const pageSizeId = useId();

  return (
    <div className="flex items-center justify-between gap-4 px-2">
      <div className="hidden flex-1 text-muted-foreground text-sm lg:block">
        {selectedCount} of {totalCount} row(s) selected.
      </div>

      <div className="flex w-full items-center gap-6 lg:w-fit lg:gap-8">
        <div className="hidden items-center gap-2 lg:flex">
          <Label className="font-medium text-sm" htmlFor={pageSizeId}>
            Rows per page
          </Label>
          <Select
            onValueChange={(value) => {
              if (value) {
                onPageSizeChange(Number(value));
              }
            }}
            value={String(pageSize)}
          >
            <SelectTrigger className="w-20" id={pageSizeId} size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex w-fit items-center justify-center font-medium text-sm">
          Page {pageIndex + 1} of {pageCount}
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Button
            aria-label="Go to first page"
            className="hidden lg:flex"
            disabled={!canGoPrev}
            onClick={() => onPageIndexChange(0)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronsLeftIcon />
          </Button>
          <Button
            aria-label="Go to previous page"
            disabled={!canGoPrev}
            onClick={() => onPageIndexChange(pageIndex - 1)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            aria-label="Go to next page"
            disabled={!canGoNext}
            onClick={() => onPageIndexChange(pageIndex + 1)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronRightIcon />
          </Button>
          <Button
            aria-label="Go to last page"
            className="hidden lg:flex"
            disabled={!canGoNext}
            onClick={() => onPageIndexChange(pageCount - 1)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronsRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
