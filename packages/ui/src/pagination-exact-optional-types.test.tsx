/**
 * Type contracts under `exactOptionalPropertyTypes`. Checked by
 * `tsc6 -p tsconfig.type-tests-exact.json` (part of the package's `test`
 * script); the ordinary type-test pass checks it too, without the flag.
 * Under vitest the blocks below only keep the file from being an empty
 * suite.
 *
 * A button ref that may be absent (`cond ? ref : undefined`) compiles on a
 * control without `href`, on all five parts.
 *
 * A consumer's wrapper that spreads props which may hold an HTML label, and
 * passes no `href` (with a button ref or none), compiles on all five parts:
 * an HTML label without `href` is dropped at runtime, not refused by the
 * types. `ComponentProps` and `ComponentRef` of every part describe the link.
 */

import type { ComponentProps, ComponentRef, HTMLAttributes, Ref } from "react";
import { createRef } from "react";
import { describe, expectTypeOf, it } from "vitest";

import {
  PaginationFirst,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

const buttonRef = createRef<HTMLButtonElement>();
const cond = Math.random() > 0.5;
const noop = () => undefined;

describe("pagination types under exactOptionalPropertyTypes", () => {
  it("accepts an optional button ref without href", () => {
    const uses = [
      <PaginationLink
        key="link"
        onClick={noop}
        ref={cond ? buttonRef : undefined}
      >
        2
      </PaginationLink>,
      <PaginationPrevious
        key="previous"
        onClick={noop}
        ref={cond ? buttonRef : undefined}
      />,
      <PaginationNext
        key="next"
        onClick={noop}
        ref={cond ? buttonRef : undefined}
      />,
      <PaginationFirst
        key="first"
        onClick={noop}
        ref={cond ? buttonRef : undefined}
      />,
      <PaginationLast
        key="last"
        onClick={noop}
        ref={cond ? buttonRef : undefined}
      />,
    ];
    expectTypeOf(uses).toBeArray();
  });

  it("compiles a wrapper that spreads link props without href", () => {
    // PaginationLink
    const PaginationLinkOmit = (
      props: Omit<ComponentProps<typeof PaginationLink>, "href">
    ) => <PaginationLink {...props} onClick={noop} />;
    const PaginationLinkRest = ({
      href: _href,
      ...rest
    }: ComponentProps<typeof PaginationLink>) => <PaginationLink {...rest} />;
    const PaginationLinkForced = (
      props: ComponentProps<typeof PaginationLink>
    ) => <PaginationLink {...props} href={undefined} />;
    const PaginationLinkAttrs = (props: HTMLAttributes<HTMLElement>) => (
      <PaginationLink {...props} />
    );
    const PaginationLinkButtonRef = (
      props: Omit<ComponentProps<typeof PaginationLink>, "href" | "ref">
    ) => <PaginationLink {...props} ref={buttonRef} />;
    // PaginationPrevious
    const PaginationPreviousOmit = (
      props: Omit<ComponentProps<typeof PaginationPrevious>, "href">
    ) => <PaginationPrevious {...props} onClick={noop} />;
    const PaginationPreviousRest = ({
      href: _href,
      ...rest
    }: ComponentProps<typeof PaginationPrevious>) => (
      <PaginationPrevious {...rest} />
    );
    const PaginationPreviousForced = (
      props: ComponentProps<typeof PaginationPrevious>
    ) => <PaginationPrevious {...props} href={undefined} />;
    const PaginationPreviousAttrs = (props: HTMLAttributes<HTMLElement>) => (
      <PaginationPrevious {...props} />
    );
    const PaginationPreviousButtonRef = (
      props: Omit<ComponentProps<typeof PaginationPrevious>, "href" | "ref">
    ) => <PaginationPrevious {...props} ref={buttonRef} />;
    // PaginationNext
    const PaginationNextOmit = (
      props: Omit<ComponentProps<typeof PaginationNext>, "href">
    ) => <PaginationNext {...props} onClick={noop} />;
    const PaginationNextRest = ({
      href: _href,
      ...rest
    }: ComponentProps<typeof PaginationNext>) => <PaginationNext {...rest} />;
    const PaginationNextForced = (
      props: ComponentProps<typeof PaginationNext>
    ) => <PaginationNext {...props} href={undefined} />;
    const PaginationNextAttrs = (props: HTMLAttributes<HTMLElement>) => (
      <PaginationNext {...props} />
    );
    const PaginationNextButtonRef = (
      props: Omit<ComponentProps<typeof PaginationNext>, "href" | "ref">
    ) => <PaginationNext {...props} ref={buttonRef} />;
    // PaginationFirst
    const PaginationFirstOmit = (
      props: Omit<ComponentProps<typeof PaginationFirst>, "href">
    ) => <PaginationFirst {...props} onClick={noop} />;
    const PaginationFirstRest = ({
      href: _href,
      ...rest
    }: ComponentProps<typeof PaginationFirst>) => <PaginationFirst {...rest} />;
    const PaginationFirstForced = (
      props: ComponentProps<typeof PaginationFirst>
    ) => <PaginationFirst {...props} href={undefined} />;
    const PaginationFirstAttrs = (props: HTMLAttributes<HTMLElement>) => (
      <PaginationFirst {...props} />
    );
    const PaginationFirstButtonRef = (
      props: Omit<ComponentProps<typeof PaginationFirst>, "href" | "ref">
    ) => <PaginationFirst {...props} ref={buttonRef} />;
    // PaginationLast
    const PaginationLastOmit = (
      props: Omit<ComponentProps<typeof PaginationLast>, "href">
    ) => <PaginationLast {...props} onClick={noop} />;
    const PaginationLastRest = ({
      href: _href,
      ...rest
    }: ComponentProps<typeof PaginationLast>) => <PaginationLast {...rest} />;
    const PaginationLastForced = (
      props: ComponentProps<typeof PaginationLast>
    ) => <PaginationLast {...props} href={undefined} />;
    const PaginationLastAttrs = (props: HTMLAttributes<HTMLElement>) => (
      <PaginationLast {...props} />
    );
    const PaginationLastButtonRef = (
      props: Omit<ComponentProps<typeof PaginationLast>, "href" | "ref">
    ) => <PaginationLast {...props} ref={buttonRef} />;
    const wrappers = [
      PaginationLinkOmit,
      PaginationLinkRest,
      PaginationLinkForced,
      PaginationLinkAttrs,
      PaginationLinkButtonRef,
      PaginationPreviousOmit,
      PaginationPreviousRest,
      PaginationPreviousForced,
      PaginationPreviousAttrs,
      PaginationPreviousButtonRef,
      PaginationNextOmit,
      PaginationNextRest,
      PaginationNextForced,
      PaginationNextAttrs,
      PaginationNextButtonRef,
      PaginationFirstOmit,
      PaginationFirstRest,
      PaginationFirstForced,
      PaginationFirstAttrs,
      PaginationFirstButtonRef,
      PaginationLastOmit,
      PaginationLastRest,
      PaginationLastForced,
      PaginationLastAttrs,
      PaginationLastButtonRef,
    ];
    expectTypeOf(wrappers).toBeArray();
  });

  it("ComponentProps and ComponentRef describe the link on every part", () => {
    expectTypeOf<
      ComponentRef<typeof PaginationLink>
    >().toEqualTypeOf<HTMLAnchorElement>();
    expectTypeOf<ComponentProps<typeof PaginationLink>["ref"]>().toEqualTypeOf<
      Ref<HTMLAnchorElement> | undefined
    >();
    expectTypeOf<ComponentProps<typeof PaginationLink>["href"]>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<
      ComponentRef<typeof PaginationPrevious>
    >().toEqualTypeOf<HTMLAnchorElement>();
    expectTypeOf<
      ComponentProps<typeof PaginationPrevious>["ref"]
    >().toEqualTypeOf<Ref<HTMLAnchorElement> | undefined>();
    expectTypeOf<
      ComponentProps<typeof PaginationPrevious>["href"]
    >().toEqualTypeOf<string | undefined>();
    expectTypeOf<
      ComponentRef<typeof PaginationNext>
    >().toEqualTypeOf<HTMLAnchorElement>();
    expectTypeOf<ComponentProps<typeof PaginationNext>["ref"]>().toEqualTypeOf<
      Ref<HTMLAnchorElement> | undefined
    >();
    expectTypeOf<ComponentProps<typeof PaginationNext>["href"]>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<
      ComponentRef<typeof PaginationFirst>
    >().toEqualTypeOf<HTMLAnchorElement>();
    expectTypeOf<ComponentProps<typeof PaginationFirst>["ref"]>().toEqualTypeOf<
      Ref<HTMLAnchorElement> | undefined
    >();
    expectTypeOf<
      ComponentProps<typeof PaginationFirst>["href"]
    >().toEqualTypeOf<string | undefined>();
    expectTypeOf<
      ComponentRef<typeof PaginationLast>
    >().toEqualTypeOf<HTMLAnchorElement>();
    expectTypeOf<ComponentProps<typeof PaginationLast>["ref"]>().toEqualTypeOf<
      Ref<HTMLAnchorElement> | undefined
    >();
    expectTypeOf<ComponentProps<typeof PaginationLast>["href"]>().toEqualTypeOf<
      string | undefined
    >();
  });
});
