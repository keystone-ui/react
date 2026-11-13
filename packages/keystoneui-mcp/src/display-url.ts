import { inspect } from "node:util";

const DISPLAYED_PROTOCOLS = new Set(["http:", "https:", "file:"]);
// An explicit root after the authority, with either slash (the URL parser
// treats `\` as `/` in http(s) and file URLs), after the leading C0 controls
// and spaces the parser ignores.
const PATH_AFTER_AUTHORITY = /^[\0- ]*[a-z][a-z\d+.-]*:[/\\]{2}[^/\\?#]*[/\\]/i;

/**
 * A configured URL made safe to print: in logs, errors, `info` output, or an
 * agent's context. Registry and docs URLs come from env vars or
 * components.json, and a private registry may carry a credential in the
 * userinfo (`https://user:secret@host`) or the query (`?token=secret`).
 *
 * Only http(s) and file URLs are displayed; anything else that parses (such
 * as `user:secret@host/r`, read as scheme `user:`) prints a fixed placeholder,
 * as does a string that does not parse. Drops userinfo and the fragment,
 * replaces every query value with a marker (keys stay, so the shape is still
 * debuggable). A secret inside the path cannot be told apart from a path and
 * is printed as-is. Only for display: always fetch the original string.
 */
export function displayUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "<unparseable URL>";
  }
  if (!DISPLAYED_PROTOCOLS.has(url.protocol)) {
    return "<unsupported URL>";
  }
  // Untouched when there is nothing to hide, so `https://keystoneui.io` does
  // not gain the trailing slash `URL#href` would add.
  if (!(url.username || url.password || url.search || url.hash)) {
    return raw;
  }
  url.username = "";
  url.password = "";
  url.hash = "";
  const keys = [...url.searchParams.keys()];
  url.search = keys
    .map((key) => `${encodeURIComponent(key)}=REDACTED`)
    .join("&");
  // `URL` reports a bare origin's path as "/". Keep the input's form, since
  // callers append `/r/...` to an origin and would otherwise print `//r`.
  if (url.host && url.pathname === "/" && !PATH_AFTER_AUTHORITY.test(raw)) {
    return `${url.protocol}//${url.host}${url.search}`;
  }
  return url.href;
}

const LONE_SURROGATE =
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

/**
 * `String#toWellFormed` (ES2024, outside this package's `lib`): each lone
 * surrogate becomes U+FFFD, as WebIDL's USVString conversion does.
 */
function wellFormed(text: string): string {
  return text.replace(LONE_SURROGATE, "\uFFFD");
}

/**
 * `fetch` throws a TypeError quoting the full URL when it holds userinfo or
 * does not parse, after converting it to a well-formed string (a lone
 * surrogate becomes U+FFFD). If the error (message, stack or cause) holds the
 * URL in either form, return a fresh error with no cause chain whose message
 * has the URL redacted. A TypeError stays a TypeError; any other error
 * becomes a plain Error. Otherwise return the original error unchanged, cause
 * and code intact.
 */
export function redactUrlInError(error: unknown, url: string): unknown {
  const forms = [...new Set([url, wellFormed(url)])];
  const full = inspect(error, { depth: 10 });
  if (!forms.some((form) => full.includes(form))) {
    return error;
  }
  const shown = displayUrl(url);
  let message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  for (const form of forms) {
    message = message.replaceAll(form, shown);
  }
  return error instanceof TypeError
    ? new TypeError(message)
    : new Error(message);
}
