import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BottomNavBarFixture } from "./fixture";

/**
 * Test-only: the bottom-nav-01 preview on its own route, with a client link
 * back to the reading page beside it. Rendered only by a build made with
 * EXPOSE_TESTING_API=1 (the e2e build); every other build answers 404, so the
 * fixture is never a public page.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BottomNavBarPage() {
  if (process.env.EXPOSE_TESTING_API !== "1") {
    notFound();
  }
  return <BottomNavBarFixture />;
}
