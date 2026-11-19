/**
 * Type contracts. `vitest run` does not typecheck, so these assertions are
 * checked by `tsc6 -p tsconfig.type-tests.json`, which the package's `test`
 * script runs before vitest (run it from `packages/ui`). Under vitest the
 * blocks below only keep the file from being an empty suite.
 */

import { describe, expectTypeOf, it } from "vitest";

import type { CountdownSnapshot } from "./countdown";

describe("countdown types", () => {
  it("a snapshot's fields are read-only in both arms", () => {
    const write = (snapshot: CountdownSnapshot) => {
      if (snapshot.isPending) {
        // @ts-expect-error a pending snapshot is read-only
        snapshot.seconds = null;
        // @ts-expect-error a pending snapshot is read-only
        snapshot.isPending = true;
      } else {
        // @ts-expect-error a live snapshot is read-only
        snapshot.seconds = 1;
        // @ts-expect-error a live snapshot is read-only
        snapshot.totalSeconds = 1;
        // @ts-expect-error a live snapshot is read-only
        snapshot.isComplete = true;
      }
    };
    expectTypeOf(write).toBeFunction();
  });
});
