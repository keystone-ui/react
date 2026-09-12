/**
 * How much of the result set is on screen.
 *
 * Shared between this block's two tables, which asked the same question with
 * the same arithmetic and differed only in the noun.
 *
 * It is not what the pagination status says: `Page 2 of 2` reads the same
 * whether that page holds ten rows or the three left over. Nor is it the
 * selection count — `SelectionBar` already states that, at every width, where
 * `TablePaginationInfo` is `hidden lg:block`.
 *
 * Deliberately a block file rather than a library prop. `TablePaginationInfo`
 * already accepts `children`, which is the composition answer, and the whole
 * of the rest is two lines of arithmetic and a plural.
 */
export function ResultSummary({
  noun,
  pageIndex,
  pageSize,
  rowCount,
  totalCount,
}: {
  /** Singular and plural, because English will not derive one from the other. */
  noun: [string, string];
  pageIndex: number;
  pageSize: number;
  rowCount: number;
  totalCount: number;
}) {
  if (totalCount === 0) {
    return null;
  }

  const first = pageIndex * pageSize + 1;
  const last = pageIndex * pageSize + rowCount;

  return (
    <>
      Showing {first}–{last} of {totalCount}{" "}
      {totalCount === 1 ? noun[0] : noun[1]}
    </>
  );
}
