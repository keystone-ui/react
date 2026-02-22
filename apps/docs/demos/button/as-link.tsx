"use client";

import { Button } from "@keystoneui/react/button";

export default function ButtonAsLink() {
  return (
    <Button
      render={
        // biome-ignore lint/a11y/useAnchorContent: content provided by Button children
        <a href="https://example.com" rel="noopener" target="_blank" />
      }
    >
      Link Button
    </Button>
  );
}
