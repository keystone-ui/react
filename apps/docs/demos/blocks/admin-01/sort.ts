/** Sort state shared by both tables, the Sort menu and the column headers. */

export type SortDirection = "asc" | "desc";

export interface SortState<K extends string> {
  direction: SortDirection;
  key: K;
}

/** Both directions, the column's natural one first — the order the menu lists. */
export function directionsFor(natural: SortDirection): SortDirection[] {
  return natural === "asc" ? ["asc", "desc"] : ["desc", "asc"];
}
