import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RollingNumberFixture } from "./fixture";

/**
 * Test-only: RollingNumbers with literal values and fixed locales, so the
 * server HTML and the hydrated page can be compared box for box. Rendered
 * only by a build made with EXPOSE_TESTING_API=1 (the e2e build); every
 * other build answers 404, so the fixture is never a public page.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RollingNumberPage() {
  if (process.env.EXPOSE_TESTING_API !== "1") {
    notFound();
  }
  return <RollingNumberFixture />;
}
