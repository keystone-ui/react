"use client";

import { Kbd } from "@keystoneui/react/kbd";

export default function KbdSpecialKeys() {
  return (
    <div className="flex flex-wrap gap-2">
      <Kbd>Enter</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>Space</Kbd>
      <Kbd>Backspace</Kbd>
      <Kbd>Delete</Kbd>
      <Kbd>↑</Kbd>
      <Kbd>↓</Kbd>
      <Kbd>←</Kbd>
      <Kbd>→</Kbd>
    </div>
  );
}
