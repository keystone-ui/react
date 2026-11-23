import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BottomNavReaderFixture } from "./fixture";

/**
 * Test-only: a reading page with its own header pinned on scroll, whose root scroll
 * padding keeps a chapter link's heading below that header. The e2e test
 * visits the bottom-nav-01 bar on the next route by client navigation and
 * comes back, to check the bar's scroll-padding rule no longer applies once
 * no bar is mounted. Rendered only by a build made with EXPOSE_TESTING_API=1
 * (the e2e build); every other build answers 404, so the fixture is never a
 * public page.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function BottomNavReaderPage() {
  if (process.env.EXPOSE_TESTING_API !== "1") {
    notFound();
  }
  return <BottomNavReaderFixture />;
}
