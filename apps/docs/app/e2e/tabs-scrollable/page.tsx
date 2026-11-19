import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TabsScrollableFixture } from "./fixture";

/**
 * Test-only: scrollable Tabs in the shapes the e2e tests read pixels from
 * (both variants, a narrow row with a deep fade, right-to-left by `dir` and
 * by CSS alone, zero and deep fades). Rendered only by a build made with
 * EXPOSE_TESTING_API=1 (the e2e build); every other build answers 404, so
 * the fixture is never a public page.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TabsScrollablePage() {
  if (process.env.EXPOSE_TESTING_API !== "1") {
    notFound();
  }
  return <TabsScrollableFixture />;
}
