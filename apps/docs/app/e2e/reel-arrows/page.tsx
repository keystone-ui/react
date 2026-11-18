import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReelArrowsFixture } from "./fixture";

/**
 * Test-only: `<Reel>` and `<Reel arrows="always">` side by side, for the
 * touch-primary e2e test. Rendered only by a build made with
 * EXPOSE_TESTING_API=1 (the e2e build); every other build answers 404, so
 * the fixture is never a public page.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReelArrowsPage() {
  if (process.env.EXPOSE_TESTING_API !== "1") {
    notFound();
  }
  return <ReelArrowsFixture />;
}
