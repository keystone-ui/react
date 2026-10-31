/**
 * CSV for a spreadsheet, not a person.
 *
 * Each table lists its own columns; the quoting and the download are here so
 * they are written once.
 */

export type CsvColumn<Row> = readonly [
  header: string,
  read: (row: Row) => string,
];

const NEEDS_QUOTES = /[",\r\n]/;
const FORMULA_START = /^[=+\-@\t\r]/;
const NUMBER = /^[+-]?\d+(\.\d+)?$/;

/**
 * One field: neutralised, then quoted per RFC 4180 only when it holds a comma,
 * quote or line break.
 *
 * Neutralised because a spreadsheet runs a cell that starts with `=`, `+`, `-`
 * or `@` as a formula, and these exports carry text people typed — a name of
 * `=HYPERLINK(…)` would become a live link in whoever opens the file. A leading
 * `'` makes Excel and Sheets read it as text. A plain number is left alone, so
 * `-5` stays a number someone can sum.
 */
function csvField(raw: string): string {
  const value = FORMULA_START.test(raw) && !NUMBER.test(raw) ? `'${raw}` : raw;
  return NEEDS_QUOTES.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

/** A header line, one line per row, CRLF endings and a trailing newline. */
export function toCsv<Row>(
  columns: readonly CsvColumn<Row>[],
  rows: readonly Row[]
): string {
  const lines = [
    columns.map(([header]) => csvField(header)),
    ...rows.map((row) => columns.map(([, read]) => csvField(read(row)))),
  ];
  return `${lines.map((line) => line.join(",")).join("\r\n")}\r\n`;
}

/**
 * Hands the text to the browser as a file. A `Blob` URL and a throwaway `<a>`
 * rather than a `data:` URI, which some browsers cap in length, and revoked
 * straight after so a long session does not hold every export in memory.
 */
export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
