import type { ContentType } from "./content-types";

/**
 * The search tag for a docs page. Component and block pages get their own
 * tags, so the search dialog can scope a query to "Components". Every other
 * page is tagged with its Diátaxis content type, or "Docs" until it
 * declares one.
 */
export function searchTag(
  slugs: readonly string[],
  contentType: ContentType | undefined
): string {
  if (slugs[0] === "components") {
    return "Components";
  }
  if (slugs[0] === "blocks") {
    return "Blocks";
  }
  return contentType ?? "Docs";
}
