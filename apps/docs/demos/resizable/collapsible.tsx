"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@keystoneui/react/resizable";

export default function ResizableCollapsible() {
  return (
    <ResizablePanelGroup
      className="max-w-md rounded-lg border"
      orientation="horizontal"
    >
      <ResizablePanel
        collapsedSize={0}
        collapsible
        defaultSize={25}
        minSize={15}
      >
        <div className="flex h-32 items-center justify-center p-4">
          <span className="font-semibold text-sm">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={75}>
        <div className="flex h-32 items-center justify-center p-4">
          <span className="font-semibold text-sm">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
