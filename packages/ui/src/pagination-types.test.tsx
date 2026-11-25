/**
 * Type contracts. `vitest run` does not typecheck, so these assertions are
 * checked by `tsc6 -p tsconfig.type-tests.json`, which the package's `test`
 * script runs before vitest (run it from `packages/ui`). Under vitest the
 * blocks below only keep the file from being an empty suite.
 *
 * The ref follows `href`: with `href` the control is an `<a>` and its ref is
 * an anchor; without `href` it is a `<button>` and a button ref is accepted.
 */

import type { ComponentProps, ComponentRef, Ref } from "react";
import { createRef } from "react";
import { describe, expectTypeOf, it } from "vitest";

import {
  PaginationFirst,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

const anchorRef = createRef<HTMLAnchorElement>();
const buttonRef = createRef<HTMLButtonElement>();
const noop = () => undefined;

describe("pagination types", () => {
  it("with href, the ref is an anchor", () => {
    const links = new Map<number, HTMLAnchorElement>();
    const uses = [
      <PaginationLink href="?p=2" key="object" ref={anchorRef}>
        2
      </PaginationLink>,
      <PaginationLink
        href="?p=2"
        key="callback"
        ref={(el) => {
          expectTypeOf(el).toEqualTypeOf<HTMLAnchorElement | null>();
          if (el) {
            links.set(2, el);
            expectTypeOf(el.href).toBeString();
          }
        }}
      >
        2
      </PaginationLink>,
      <PaginationFirst href="#" key="first" ref={anchorRef} />,
      <PaginationPrevious href="#" key="previous" ref={anchorRef} text="P" />,
      <PaginationNext href="#" key="next" ref={anchorRef} />,
      <PaginationLast href="#" key="last" ref={anchorRef} />,
      // The anchor `type` attribute (a MIME type) is still accepted.
      <PaginationLink href="#" key="type" type="text/html">
        1
      </PaginationLink>,
    ];
    expectTypeOf(uses).toBeArray();
  });

  it("with href, a button ref does not compile", () => {
    const uses = [
      // @ts-expect-error the element is an anchor
      <PaginationLink href="?p=2" key="link" ref={buttonRef}>
        2
      </PaginationLink>,
      // @ts-expect-error the element is an anchor
      <PaginationNext href="#" key="next" ref={buttonRef} />,
    ];
    expectTypeOf(uses).toBeArray();
  });

  it("without href, the ref is a button", () => {
    const uses = [
      <PaginationLink key="link" onClick={noop} ref={buttonRef}>
        2
      </PaginationLink>,
      <PaginationPrevious key="previous" onClick={noop} ref={buttonRef} />,
      <PaginationFirst key="first" onClick={noop} ref={buttonRef} />,
      <PaginationNext
        key="callback"
        onClick={noop}
        ref={(el) => {
          expectTypeOf(el).toEqualTypeOf<HTMLButtonElement | null>();
        }}
      />,
    ];
    expectTypeOf(uses).toBeArray();
  });

  it("a conditional href still compiles, with or without an anchor ref", () => {
    const href = Math.random() > 0.5 ? "?p=3" : undefined;
    const uses = [
      <PaginationNext href={href} key="plain" />,
      <PaginationNext href={href} key="ref" ref={anchorRef} />,
    ];
    expectTypeOf(uses).toBeArray();
  });

  it("ComponentProps and ComponentRef describe the link", () => {
    expectTypeOf<
      ComponentRef<typeof PaginationLink>
    >().toEqualTypeOf<HTMLAnchorElement>();
    expectTypeOf<ComponentProps<typeof PaginationLink>["ref"]>().toEqualTypeOf<
      Ref<HTMLAnchorElement> | undefined
    >();
    // The props spread onto a plain anchor.
    const spread = ({
      isActive: _active,
      size: _size,
      ...rest
    }: ComponentProps<typeof PaginationLink>) => <a {...rest} />;
    expectTypeOf(spread).toBeFunction();
  });

  it("adds no button-only prop", () => {
    // @ts-expect-error `disabled` is not a prop of the pagination controls
    const use = <PaginationNext disabled onClick={noop} />;
    expectTypeOf(use).not.toBeNull();
  });
});
