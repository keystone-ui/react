/**
 * Which pills a toolbar shows, for any filter vocabulary.
 *
 * Both tables declare their filters as a list of `{ key, value }`
 * descriptors; these read that list, so the users and payments rows decide
 * what is on show by the same rule.
 */

export interface FilterDescriptor<K extends string, F> {
  key: K;
  /** The value as the pill reads it, or `null` when the filter is unset. */
  value: (filters: F) => string | null;
}

/**
 * The pills on the row: the ones added (or there from the start), then any
 * filter that holds a value without a pill — set from the phone drawer, or
 * from a link. A filter that narrows the table is never invisible.
 */
export function visibleKeys<K extends string, F>(
  defs: readonly FilterDescriptor<K, F>[],
  filters: F,
  added: readonly K[]
): K[] {
  const valued = defs
    .filter((def) => def.value(filters) !== null && !added.includes(def.key))
    .map((def) => def.key);
  return [...added, ...valued];
}

/** Filters still available to add — the `+ Add filter` menu's contents. */
export function addableKeys<K extends string, F>(
  defs: readonly FilterDescriptor<K, F>[],
  filters: F,
  added: readonly K[]
): K[] {
  const visible = visibleKeys(defs, filters, added);
  return defs.filter((def) => !visible.includes(def.key)).map((def) => def.key);
}
