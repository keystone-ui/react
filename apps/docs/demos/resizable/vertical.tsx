"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "keystoneui/resizable";

export default function ResizableVertical() {
  return (
    <ResizablePanelGroup
      className="max-w-md rounded-lg border"
      orientation="vertical"
    >
      <ResizablePanel defaultSize={40}>
        <div className="flex h-24 items-center justify-center p-4">
          <span className="font-semibold text-sm">Top</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={60}>
        <div className="flex h-24 items-center justify-center p-4">
          <span className="font-semibold text-sm">Bottom</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
