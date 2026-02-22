"use client";

import { Kbd, KbdGroup } from "@keystoneui/react/kbd";

export default function KbdCommonShortcuts() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="w-24 text-muted-foreground text-sm">Save</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>S</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-muted-foreground text-sm">Search</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-24 text-muted-foreground text-sm">Terminal</span>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>`</Kbd>
        </KbdGroup>
      </div>
    </div>
  );
}
