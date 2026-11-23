/**
 * Type contracts. `vitest run` does not typecheck, so these assertions are
 * checked by `tsc6 -p tsconfig.type-tests.json`, which the package's `test`
 * script runs before vitest (run it from `packages/ui`). Under vitest the
 * blocks below only keep the file from being an empty suite.
 */

import { describe, expectTypeOf, it } from "vitest";

import {
  defaultStrings,
  type KeystoneStrings,
  type StringsOverrides,
  StringsProvider,
} from "./strings";

describe("strings types", () => {
  it("accepts a partial override", () => {
    const partial: StringsOverrides = { modal: { close: "Fermer" } };
    const element = <StringsProvider strings={partial} />;
    expectTypeOf(partial).toExtend<StringsOverrides>();
    expectTypeOf(element).not.toBeAny();
  });

  it("refuses a misspelt key", () => {
    // @ts-expect-error `clsoe` is not a key of `modal`
    const misspelt: StringsOverrides = { modal: { clsoe: "Fermer" } };
    // @ts-expect-error `modl` is not a namespace
    const wrongNamespace: StringsOverrides = { modl: { close: "Fermer" } };
    expectTypeOf(misspelt).toExtend<StringsOverrides>();
    expectTypeOf(wrongNamespace).toExtend<StringsOverrides>();
  });

  it("refuses null on modal", () => {
    // @ts-expect-error `modal.close` is not nullable
    const nulled: StringsOverrides = { modal: { close: null } };
    expectTypeOf(nulled).toExtend<StringsOverrides>();
  });

  it("refuses an English dictionary that omits an entry", () => {
    // @ts-expect-error `footerClose` is missing
    const english = { modal: { close: "Close" } } satisfies KeystoneStrings;
    expectTypeOf(english).toBeObject();
  });

  it("types the English read-only at both levels", () => {
    const write = () => {
      // @ts-expect-error a namespace is read-only
      defaultStrings.modal = { close: "x", footerClose: "x" };
      // @ts-expect-error a string is read-only
      defaultStrings.modal.close = "x";
    };
    expectTypeOf(write).toBeFunction();
  });
});
