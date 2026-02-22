"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@keystoneui/react/collapsible";
import { ChevronsUpDownIcon } from "lucide-react";

export default function CollapsibleDefault() {
  return (
    <Collapsible className="w-full max-w-sm">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-2 font-medium text-sm">
        3 items
        <ChevronsUpDownIcon className="size-4" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2">
          <div className="rounded-md border px-4 py-2 text-sm">Item 1</div>
          <div className="rounded-md border px-4 py-2 text-sm">Item 2</div>
          <div className="rounded-md border px-4 py-2 text-sm">Item 3</div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
