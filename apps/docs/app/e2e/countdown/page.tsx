import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CountdownFixture } from "./fixture";

/**
 * Test-only: Countdowns with a literal target and a fixed clock, so the
 * server HTML (the placeholder) and the hydrated page (the digits) can be
 * compared box for box. Rendered only by a build made with
 * EXPOSE_TESTING_API=1 (the e2e build); every other build answers 404, so
 * the fixture is never a public page.
 */

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CountdownPage() {
  if (process.env.EXPOSE_TESTING_API !== "1") {
    notFound();
  }
  return <CountdownFixture />;
}
