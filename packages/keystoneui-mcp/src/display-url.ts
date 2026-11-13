import { inspect } from "node:util";

const DISPLAYED_PROTOCOLS = new Set(["http:", "https:", "file:"]);
// An explicit root after the authority, with either slash (the URL parser
// treats `\` as `/` in http(s) and file URLs).
const PATH_AFTER_AUTHORITY = /^[a-z][a-z\d+.-]*:[/\\]{2}[^/\\?#]*[/\\]/i;

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
  const trimmed = raw.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return "<unparseable URL>";
  }
  if (!DISPLAYED_PROTOCOLS.has(url.protocol)) {
    return "<unsupported URL>";
  }
  // Untouched when there is nothing to hide, so `https://keystoneui.io` does
  // not gain the trailing slash `URL#href` would add.
  if (!(url.username || url.password || url.search || url.hash)) {
    return trimmed;
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
  if (url.host && url.pathname === "/" && !PATH_AFTER_AUTHORITY.test(trimmed)) {
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

/** Each form a secret part of `raw` may take in an error message. */
function secretParts(raw: string): string[] {
  let url: URL;
  try {
    url = new URL(wellFormed(raw).trim());
  } catch {
    return [];
  }
  const parts = [url.username, url.password, url.hash.slice(1)];
  for (const pair of url.search.slice(1).split("&")) {
    const at = pair.indexOf("=");
    if (at !== -1) {
      parts.push(pair.slice(at + 1));
    }
  }
  for (const value of url.searchParams.values()) {
    parts.push(value);
  }
  const forms = new Set<string>();
  for (const part of parts) {
    forms.add(part);
    try {
      forms.add(decodeURIComponent(part));
    } catch {
      // Not decodable: the encoded form is already in the set.
    }
  }
  forms.delete("");
  return [...forms];
}

/**
 * `fetch` throws a TypeError quoting the full URL when it holds userinfo or
 * does not parse, after converting it to a well-formed string (a lone
 * surrogate becomes U+FFFD). If the error (message, stack or cause) holds the
 * URL in either form, or any of its username, password, query values or
 * fragment, return a fresh error with no cause chain whose message has the
 * URL redacted -- or, if a secret part would still show, a fixed message. A
 * TypeError stays a TypeError; any other error becomes a plain Error.
 * Otherwise return the original error unchanged.
 */
export function redactUrlInError(error: unknown, url: string): unknown {
  const urlForms = [...new Set([url, wellFormed(url)])];
  const secrets = secretParts(url);
  const holds = (text: string, needles: string[]) =>
    needles.some((needle) => text.includes(needle));

  const full = inspect(error, { depth: 10 });
  if (!(holds(full, urlForms) || holds(full, secrets))) {
    return error;
  }
  const shown = displayUrl(url);
  let message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  for (const form of urlForms) {
    message = message.replaceAll(form, shown);
  }
  if (holds(message, secrets)) {
    message = `Request to ${shown} failed`;
  }
  if (holds(message, secrets)) {
    // The secret also reads as part of the displayed URL (say `?k=r` in
    // `.../r`): name no URL at all.
    message = "Request to the configured URL failed";
  }
  return error instanceof TypeError
    ? new TypeError(message)
    : new Error(message);
}
