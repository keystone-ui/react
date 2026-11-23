"use client";

import Link from "next/link";
import { useEffect } from "react";

import BottomNav01 from "@/demos/blocks/bottom-nav-01";

import "../header.css";

export function BottomNavBarFixture() {
  useEffect(() => {
    document.documentElement.dataset.fixtureHydrated = "bottom-nav-bar";
  }, []);
  return (
    <div className="bg-background text-foreground" id="bar-page">
      {/* Outside the preview: it turns every link inside it into a no-op. */}
      <header className="sticky top-0 z-(--z-sticky) flex h-[72px] items-center gap-4 border-border border-b bg-background px-4 print:static">
        <a href="#section">Go to the section</a>
        <Link href="/e2e/bottom-nav-round-trip">Back to the reader</Link>
      </header>
      <div className="h-[1100px]" />
      <h2 className="h-7 font-semibold text-lg" id="section">
        Section
      </h2>
      <BottomNav01 />
    </div>
  );
}
