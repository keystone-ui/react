"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import { X as XIcon } from "lucide-react";
import type * as React from "react";
import {
  Children,
  createContext,
  useCallback,
  useContext,
  useRef,
} from "react";

import { cn } from "./utils";

/** Spaces, tabs and line breaks: what CSS collapses. Not `\s`, which has NBSP. */
const COLLAPSIBLE_WHITESPACE = /^[ \t\n\r\f]+$/;

/**
 * Wraps bare text children in a span that can ellipsize. A flex row cannot
 * ellipsize its own text — it sits in an anonymous flex item — and a
 * fixed-height row has nowhere to wrap it to. Adjacent strings and numbers
 * (`{count} items`) share one span; elements pass through untouched.
 *
 * A run of only collapsible whitespace (the `{" "}` JSX puts between an icon
 * and a label) passes through bare: as an anonymous flex item layout ignores
 * it, whereas a span would be one more item and add a second gap. A
 * non-breaking space is content, so it is not in the pattern and stays wrapped.
 */
function wrapText(
  children: React.ReactNode,
  className: string
): React.ReactNode {
  const out: React.ReactNode[] = [];
  let text = "";
  const flush = () => {
    if (COLLAPSIBLE_WHITESPACE.test(text)) {
      out.push(text);
      text = "";
    } else if (text) {
      out.push(
        <span className={className} key={`text-${out.length}`}>
          {text}
        </span>
      );
      text = "";
    }
  };
  for (const child of Children.toArray(children)) {
    if (typeof child === "string" || typeof child === "number") {
      text += child;
    } else {
      flush();
      out.push(child);
    }
  }
  flush();
  return out;
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

const tagVariants = cva(
  "inline-flex h-6 min-w-0 max-w-full cursor-pointer touch-manipulation select-none items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full bg-secondary px-2.5 font-medium text-secondary-foreground text-xs transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 has-[[data-slot=avatar]]:pl-1 aria-pressed:bg-primary/10 aria-pressed:text-primary dark:aria-pressed:bg-primary/15 [&_svg:not([class*='size-'])]:size-3 [&_svg]:pointer-events-none [&_svg]:shrink-0"
);

/**
 * The chip when Tag is given `remove`: the toggle and the remove control sit
 * side by side inside it. Same look as `tagVariants`, keyed on `data-pressed`
 * and `data-disabled` (mirrored from the toggle) since the chip is a `span`.
 * It has the pill's padding (so a consumer `px-*` acts as it did), the
 * toggle fills the rest and the X keeps TagRemove's own margins, so the
 * geometry is the nested pill's, in spacing units. The toggle's `::before`
 * reaches back over the start padding, so a click anywhere before the X
 * toggles. `overflow-hidden` clips both enlarged hit areas to the pill, as
 * the toggle did when the X was inside it. The focus ring is drawn here,
 * around the whole pill, when the toggle has focus.
 */
const tagChipClassName =
  "inline-flex h-6 min-w-0 max-w-full touch-manipulation select-none items-center overflow-hidden whitespace-nowrap rounded-full bg-secondary px-2.5 font-medium text-secondary-foreground text-xs transition-colors hover:bg-secondary-hover has-[[data-slot=tag-toggle]:focus-visible]:outline-2 has-[[data-slot=tag-toggle]:focus-visible]:outline-ring/50 has-[[data-slot=tag-toggle]:focus-visible]:outline-offset-2 data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-pressed:bg-primary/10 data-pressed:text-primary dark:data-pressed:bg-primary/15 [&_svg:not([class*='size-'])]:size-3 [&_svg]:pointer-events-none [&_svg]:shrink-0 has-[[data-slot=avatar]]:ps-1";

const tagToggleClassName =
  "relative inline-flex min-w-0 flex-1 cursor-pointer items-center justify-center gap-1 self-stretch pe-1 outline-none before:absolute before:inset-y-0 before:-start-96 before:end-0 before:content-[''] disabled:cursor-not-allowed";

/** The toggle's effective disabled state, for a `TagRemove` given as `remove`. */
const TagRemoveDisabledContext = createContext(false);

/**
 * A ref that also keeps focus on the toggle when its DOM node is replaced,
 * which happens when `remove` is added or taken away (the button moves into
 * or out of the chip). The old node's ref cleanup runs before React removes
 * it, so it can still see that it has focus.
 */
function useToggleRef(
  ref: React.Ref<HTMLButtonElement> | undefined
): React.RefCallback<HTMLButtonElement> {
  const hadFocus = useRef<boolean>(false);
  return useCallback(
    // Never called with null: it always returns a cleanup (React 19).
    (node: HTMLButtonElement) => {
      if (hadFocus.current) {
        hadFocus.current = false;
        node.focus({ preventScroll: true });
      }
      let cleanup: (() => void) | undefined;
      if (typeof ref === "function") {
        const result = ref(node);
        cleanup = () => (typeof result === "function" ? result() : ref(null));
      } else if (ref) {
        ref.current = node;
        cleanup = () => {
          ref.current = null;
        };
      }
      return () => {
        hadFocus.current = node.ownerDocument.activeElement === node;
        cleanup?.();
      };
    },
    [ref]
  );
}

/** Renders the toggle inside the chip, applying a consumer's `render`. */
function TagToggle({
  render,
  props,
  state,
}: {
  render: TogglePrimitive.Props["render"];
  props: React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> };
  state: TogglePrimitive.State;
}) {
  const { ref, ...rest } = props;
  return useRender({
    defaultTagName: "button",
    props: rest,
    ref,
    render,
    state,
  });
}

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------

export interface TagProps extends TogglePrimitive.Props {
  /**
   * The remove control, usually `<TagRemove onClick={…} />`. When given, Tag
   * renders it beside the toggle inside the pill, not inside the toggle.
   */
  remove?: React.ReactNode;
}

function Tag({ className, children, remove, ref, ...props }: TagProps) {
  const toggleRef = useToggleRef(ref);

  if (remove == null || remove === false) {
    return (
      <TogglePrimitive
        className={cn(tagVariants(), className)}
        data-slot="tag"
        {...props}
        ref={toggleRef}
      >
        {wrapText(children, "min-w-0 truncate")}
      </TogglePrimitive>
    );
  }

  // Same element at the same place as above, so the toggle's own state (an
  // uncontrolled `pressed`) survives `remove` coming and going. Its `render`
  // builds the chip around the toggle from the toggle's effective state,
  // which includes a disabled TagGroup, ToggleGroup or Toolbar.
  const {
    "data-slot": slot = "tag",
    dir,
    hidden,
    render,
    style,
    ...toggleProps
  } = props as TogglePrimitive.Props & { "data-slot"?: string };
  return (
    <TogglePrimitive
      {...toggleProps}
      className={tagToggleClassName}
      data-slot="tag-toggle"
      ref={toggleRef}
      render={(renderProps, state) => (
        <span
          className={cn(
            tagChipClassName,
            typeof className === "function" ? className(state) : className
          )}
          data-disabled={state.disabled ? "" : undefined}
          data-pressed={state.pressed ? "" : undefined}
          data-slot={slot}
          dir={dir}
          hidden={hidden}
          style={typeof style === "function" ? style(state) : style}
        >
          <TagToggle props={renderProps} render={render} state={state} />
          <TagRemoveDisabledContext.Provider value={state.disabled}>
            {remove}
          </TagRemoveDisabledContext.Provider>
        </span>
      )}
    >
      {wrapText(children, "min-w-0 truncate")}
    </TogglePrimitive>
  );
}

// ---------------------------------------------------------------------------
// TagRemove
// ---------------------------------------------------------------------------

export interface TagRemoveProps extends React.ComponentPropsWithRef<"button"> {}

function TagRemove({
  className,
  children,
  "aria-label": ariaLabel,
  disabled,
  ...props
}: TagRemoveProps) {
  // Given as Tag's `remove`, a disabled toggle disables its X too.
  const toggleDisabled = useContext(TagRemoveDisabledContext);
  const hasCustomChildren = !!children;
  return (
    <button
      aria-label={ariaLabel ?? (hasCustomChildren ? undefined : "Remove")}
      className={cn(
        "relative -my-px -ms-0.5 -me-1.5 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-current/60 transition-[color] before:absolute before:-inset-3.5 before:content-[''] hover:text-current focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2",
        className
      )}
      data-slot="tag-remove"
      disabled={toggleDisabled || disabled}
      type="button"
      {...props}
    >
      {children || <XIcon aria-hidden="true" size={10} />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { Tag, TagRemove, tagVariants };
