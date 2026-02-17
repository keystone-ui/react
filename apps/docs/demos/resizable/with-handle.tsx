"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "keystoneui/resizable";

export default function ResizableWithHandle() {
  return (
    <ResizablePanelGroup
      className="max-w-md rounded-lg border"
      orientation="horizontal"
    >
      <ResizablePanel defaultSize={30}>
        <div className="flex h-32 items-center justify-center p-4">
          <span className="font-semibold text-sm">Sidebar</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={70}>
        <div className="flex h-32 items-center justify-center p-4">
          <span className="font-semibold text-sm">Content</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
