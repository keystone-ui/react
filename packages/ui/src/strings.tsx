"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

// =============================================================================
// Dictionary
// =============================================================================

/**
 * Every piece of built-in English, one namespace per component. A string is
 * either text or a function of one named-argument object. Read-only at both
 * levels.
 *
 * Type your own translations as `StringsOverrides`, not as this type: a key
 * added in a later release would make a dictionary typed as the full
 * `KeystoneStrings` fail to compile, while an override object keeps working.
 */
export interface KeystoneStrings {
  readonly modal: {
    /** Accessible name of ModalContent's corner close button. */
    readonly close: string;
    /** Text of ModalFooter's close button (`showCloseButton`). */
    readonly footerClose: string;
  };
}

/**
 * What a `StringsProvider` accepts: every namespace and key optional. An
 * `undefined` entry, omitted or explicit, inherits from the nearest provider
 * above, or the English; `""` is kept.
 */
export type StringsOverrides = {
  readonly [Namespace in keyof KeystoneStrings]?:
    | {
        readonly [Key in keyof KeystoneStrings[Namespace]]?:
          | KeystoneStrings[Namespace][Key]
          | undefined;
      }
    | undefined;
};

/** A dictionary of any shape: namespaces of entries. */
type Dictionary = Readonly<Record<string, Readonly<Record<string, unknown>>>>;

function freeze<T extends Dictionary>(dictionary: T): T {
  for (const namespace of Object.values(dictionary)) {
    Object.freeze(namespace);
  }
  return Object.freeze(dictionary);
}

/**
 * The built-in English, frozen. Do not read its fields in a Server
 * Component. Pass `defaultStrings` whole to a provider, or read it in a
 * `"use client"` file.
 */
export const defaultStrings: KeystoneStrings = freeze({
  modal: {
    close: "Close",
    footerClose: "Close",
  },
} satisfies KeystoneStrings);

// =============================================================================
// Merge
// =============================================================================

/**
 * The built-in keys whose entry may be `null` (FileUpload's callbacks, from
 * the release that adds them). Not exported.
 */
const NULLABLE_KEYS: {
  readonly [Namespace in keyof KeystoneStrings]?: readonly (keyof KeystoneStrings[Namespace])[];
} = {};

/**
 * Whether `null` may replace this entry: on a key the English knows, only
 * when it is nullable; on a namespace or key the English does not know,
 * always, since unknown entries are passed through untouched.
 */
function acceptsNull(namespace: string, key: string): boolean {
  const english = defaultStrings as unknown as Dictionary;
  if (
    !(
      Object.hasOwn(english, namespace) &&
      Object.hasOwn(english[namespace] ?? {}, key)
    )
  ) {
    return true;
  }
  const nullable = (
    NULLABLE_KEYS as Readonly<Record<string, readonly string[]>>
  )[namespace];
  return nullable?.includes(key) ?? false;
}

/**
 * `overrides` laid over `parent`, per namespace and per key: `undefined` is
 * skipped, and so is `null` on a built-in key that is not nullable, so the
 * parent's entry survives; anything else (`""` included) replaces it, and a
 * namespace or key the English does not know is passed through.
 * Each namespace that changes is a fresh frozen object; the others, and
 * `parent` itself when nothing changes, keep their identity. Nothing passed
 * in is mutated.
 */
function mergeStrings<T extends object>(parent: T, overrides: unknown): T {
  if (typeof overrides !== "object" || overrides === null) {
    return parent;
  }
  const source = parent as unknown as Dictionary;
  let merged: Record<string, Readonly<Record<string, unknown>>> | undefined;
  for (const [name, entries] of Object.entries(overrides)) {
    if (typeof entries !== "object" || entries === null) {
      continue;
    }
    const base: Readonly<Record<string, unknown>> = source[name] ?? {};
    let namespace: Record<string, unknown> | undefined;
    for (const [key, value] of Object.entries(entries)) {
      if (
        value === undefined ||
        (value === null && !acceptsNull(name, key)) ||
        (key in base && base[key] === value)
      ) {
        continue;
      }
      namespace ??= { ...base };
      namespace[key] = value;
    }
    if (namespace) {
      merged ??= { ...source };
      merged[name] = Object.freeze(namespace);
    }
  }
  return merged ? (Object.freeze(merged) as unknown as T) : parent;
}

// =============================================================================
// StringsProvider
// =============================================================================

const StringsContext = createContext<KeystoneStrings>(defaultStrings);

/**
 * Replaces the built-in English for everything inside it. A part's own prop
 * or children still win; nested providers merge, the nearest one winning
 * per key.
 *
 * Every change in `strings` identity re-renders every component that reads
 * strings, so pass a stable object: a module constant, or `useMemo`.
 */
function StringsProvider({
  children,
  strings,
}: {
  children?: ReactNode;
  /** The strings to replace. Omitted keys inherit. */
  strings?: StringsOverrides | undefined;
}) {
  const parent = useContext(StringsContext);
  const value = useMemo(() => mergeStrings(parent, strings), [parent, strings]);
  return (
    <StringsContext.Provider value={value}>{children}</StringsContext.Provider>
  );
}

// =============================================================================
// useStrings
// =============================================================================

/**
 * One namespace of the strings in effect here, read-only: the nearest
 * provider's, or the English.
 */
function useStrings<Namespace extends keyof KeystoneStrings>(
  namespace: Namespace
): KeystoneStrings[Namespace] {
  const strings: Partial<KeystoneStrings> = useContext(StringsContext);
  const entries = strings[namespace];
  if (entries === undefined) {
    throw new Error(
      `Keystone UI: no "${String(namespace)}" strings. \`strings.tsx\` is older than this component: re-add \`strings\`.`
    );
  }
  return entries;
}

// =============================================================================
// Exports
// =============================================================================
export { StringsProvider, useStrings };
