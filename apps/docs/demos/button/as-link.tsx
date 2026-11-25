"use client";

import { buttonVariants } from "@keystoneui/react/button";

export default function ButtonAsLink() {
  return (
    <a
      className={buttonVariants()}
      href="https://example.com"
      rel="noopener"
      target="_blank"
    >
      Link Button
    </a>
  );
}
