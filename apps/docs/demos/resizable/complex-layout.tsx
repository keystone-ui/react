"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@keystoneui/react/resizable";

export default function ResizableComplexLayout() {
  return (
    <ResizablePanelGroup
      className="min-h-[300px] max-w-lg rounded-lg border"
      orientation="horizontal"
    >
      <ResizablePanel defaultSize={20} minSize={15}>
        <div className="flex h-full items-center justify-center p-4">
          <span className="font-semibold text-sm">Nav</span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={55}>
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize={70}>
            <div className="flex h-full items-center justify-center p-4">
              <span className="font-semibold text-sm">Main</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={30}>
            <div className="flex h-full items-center justify-center p-4">
              <span className="font-semibold text-sm">Terminal</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={25} minSize={15}>
        <div className="flex h-full items-center justify-center p-4">
          <span className="font-semibold text-sm">Panel</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
