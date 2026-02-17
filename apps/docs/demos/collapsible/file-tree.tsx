"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "keystoneui/collapsible";
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";

function File({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md py-1 pr-2 pl-6 text-muted-foreground text-sm hover:bg-muted hover:text-foreground">
      <FileIcon className="size-4 shrink-0" />
      {name}
    </div>
  );
}

function Folder({
  children,
  defaultOpen,
  name,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  name: string;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md py-1 pr-2 pl-2 font-medium text-sm hover:bg-muted">
        <ChevronRightIcon className="size-4 shrink-0 transition-transform group-data-[panel-open]:rotate-90" />
        <FolderIcon className="size-4 shrink-0" />
        {name}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 border-l pl-2">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function CollapsibleFileTree() {
  return (
    <div className="w-full max-w-sm rounded-md border p-2">
      <Folder defaultOpen name="src">
        <Folder defaultOpen name="components">
          <File name="button.tsx" />
          <File name="input.tsx" />
          <File name="dialog.tsx" />
        </Folder>
        <Folder name="utils">
          <File name="cn.ts" />
          <File name="helpers.ts" />
        </Folder>
        <File name="app.tsx" />
        <File name="index.ts" />
      </Folder>
    </div>
  );
}
