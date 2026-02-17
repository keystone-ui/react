"use client";

import { Kbd, KbdGroup } from "keystoneui/kbd";

export default function KbdGroupDemo() {
  return (
    <div className="flex flex-wrap gap-4">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>⌥</Kbd>
        <Kbd>⌃</Kbd>
      </KbdGroup>
    </div>
  );
}
