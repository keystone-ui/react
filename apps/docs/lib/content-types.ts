/**
 * The job a docs page does, one per page. The four Diátaxis types
 * (Tutorial, How-to, Reference, Conceptual) plus Troubleshooting and the
 * Landing pages that route readers to the others. See apps/docs/WRITING.md.
 */
export const CONTENT_TYPES = [
  "Tutorial",
  "How-to",
  "Reference",
  "Conceptual",
  "Troubleshooting",
  "Landing",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];
