import { inspect } from "node:util";

const PATH_AFTER_AUTHORITY = /^[a-z][a-z\d+.-]*:\/\/[^/?#]*\//i;

/**
 * A configured URL made safe to print: in logs, errors, `info` output, or an
 * agent's context. Registry and docs URLs come from env vars or
 * components.json, and a private registry may carry a credential in the
 * userinfo (`https://user:secret@host`) or the query (`?token=secret`).
 *
 * Drops userinfo and the fragment, replaces every query value with a marker
 * (keys stay, so the shape is still debuggable). A string that does not parse
 * is never echoed. A secret inside the path cannot be told apart from a path
 * and is printed as-is. Only for display: always fetch the original string.
 */
export function displayUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return "<unparseable URL>";
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

/**
 * `fetch` throws a TypeError quoting the full URL when it holds userinfo. If
 * `url` appears anywhere in the error (message, stack, cause), rethrow a fresh
 * error of the same class with the URL redacted and no cause chain; otherwise
 * return the original error unchanged.
 */
export function redactUrlInError(error: unknown, url: string): unknown {
  if (!inspect(error, { depth: 10 }).includes(url)) {
    return error;
  }
  const message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  const safe = message.replaceAll(url, displayUrl(url));
  return error instanceof TypeError ? new TypeError(safe) : new Error(safe);
}
