"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "keystoneui/resizable";

export default function ResizableDefault() {
  return (
    <ResizablePanelGroup className="max-w-md rounded-lg border">
      <ResizablePanel defaultSize={50}>
        <div className="flex h-32 items-center justify-center p-4">
          <span className="font-semibold text-sm">Panel A</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={50}>
        <div className="flex h-32 items-center justify-center p-4">
          <span className="font-semibold text-sm">Panel B</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
