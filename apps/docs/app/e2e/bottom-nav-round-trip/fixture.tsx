"use client";

import Link from "next/link";
import { useEffect } from "react";

import "./header.css";

export function BottomNavReaderFixture() {
  useEffect(() => {
    document.documentElement.dataset.fixtureHydrated = "bottom-nav-reader";
  }, []);
  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 flex h-[72px] items-center gap-4 border-border border-b bg-background px-4 print:static">
        {/* An ordinary fragment link: the browser scrolls, not the router. */}
        <a href="#chapter">Go to the chapter</a>
        <Link href="/e2e/bottom-nav-round-trip/bar">Open the bar</Link>
      </header>
      <main id="reader">
        <div className="h-[1100px]" />
        <h2 className="h-7 font-semibold text-lg" id="chapter">
          Chapter
        </h2>
        <div className="h-[1100px]" />
      </main>
    </div>
  );
}
