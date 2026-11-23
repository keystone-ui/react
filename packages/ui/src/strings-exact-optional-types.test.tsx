/**
 * Type contracts under `exactOptionalPropertyTypes`. Checked by
 * `tsc6 -p tsconfig.type-tests-exact.json` (part of the package's `test`
 * script); the ordinary type-test pass checks it too, without the flag.
 * Under vitest the block below only keeps the file from being an empty suite.
 *
 * A consumer composing `{ modal: { close: maybeClose } }` from a
 * `string | undefined` must compile under the flag: an `undefined` entry
 * inherits, which is the documented merge rule.
 */

import { describe, expectTypeOf, it } from "vitest";

import type { StringsOverrides } from "./strings";

/** A translation that may be missing, as a lookup returns it. */
const lookup = (key: string): string | undefined =>
  key === "close" ? undefined : key;
const maybeClose = lookup("close");

describe("strings types under exactOptionalPropertyTypes", () => {
  it("accepts undefined at both levels and refuses null", () => {
    const namespaceUndefined: StringsOverrides = { modal: undefined };
    const keyUndefined: StringsOverrides = { modal: { close: undefined } };
    const composed: StringsOverrides = { modal: { close: maybeClose } };
    // @ts-expect-error `modal.close` is not nullable
    const nulled: StringsOverrides = { modal: { close: null } };
    expectTypeOf(namespaceUndefined).toExtend<StringsOverrides>();
    expectTypeOf(keyUndefined).toExtend<StringsOverrides>();
    expectTypeOf(composed).toExtend<StringsOverrides>();
    expectTypeOf(nulled).toExtend<StringsOverrides>();
  });
});
