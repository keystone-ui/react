import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReelPlainFixture } from "./fixture";

/**
 * Test-only: overflowing rows under Reel's plain arrows with each `arrows`
 * gate, beside a default Reel and a bare `ks-scroll-fade-x` row, for the
 * touch-primary and no-scroll-timeline e2e tests. Rendered only by a build
 * made with EXPOSE_TESTING_API=1 (the e2e build); every other build answers
 * 404, so the fixture is never a public page.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ReelPlainPage() {
  if (process.env.EXPOSE_TESTING_API !== "1") {
    notFound();
  }
  return <ReelPlainFixture />;
}
