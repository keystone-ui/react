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

/** RFC 4180: quote a field only when it holds a comma, quote or line break. */
function csvField(value: string): string {
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
