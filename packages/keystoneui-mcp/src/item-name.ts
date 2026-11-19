/**
 * Which names are accepted as a registry item address, and how a printed URL
 * is made safe for a shell.
 *
 * A name is put into a URL path as given (see registry-url.ts). The item-name
 * rules refuse empty names or segments, dot segments including
 * percent-encoded forms, question marks, hashes, backslashes and control
 * characters. Other names are accepted, shell metacharacters included;
 * install URLs are quoted where needed.
 */

import { shellWord, shown } from "./render.js";
import { parseThemeCode } from "./theme.js";

// biome-ignore lint/suspicious/noControlCharactersInRegex: the characters a name may not hold
const CONTROL = /[\u0000-\u001f\u007f]/;
const ENCODED_DOT = /%2e/gi;
const TRAILING_SPACES = / +$/;
const ONLY_PARAM = /^(.*?)\?only=([^&#]*)/s;
const THEME_CODE = /^theme\/(.+)$/s;
/** The `--only` values the `theme` verb takes. */
const THEME_PARTS = new Set(["theme", "font", "theme,font", "font,theme"]);

/** The name as printed in a message (see render.ts). */
export function shownName(name: string): string {
  return shown(name);
}

function isDotSegment(segment: string): boolean {
  const decoded = segment.replace(ENCODED_DOT, ".");
  return decoded === "." || decoded === "..";
}

/** Why `name` cannot be a registry item address, or null when it can. */
function invalidReason(name: string): string | null {
  if (name === "") {
    return "empty name";
  }
  if (CONTROL.test(name)) {
    return "control character";
  }
  if (name.includes("?")) {
    return "query delimiter `?`";
  }
  if (name.includes("#")) {
    return "fragment delimiter `#`";
  }
  if (name.includes("\\")) {
    return "backslash, read as a path separator";
  }
  const segments = name.split("/");
  if (segments.some((segment) => segment === "")) {
    return "empty path segment";
  }
  if (segments.some(isDotSegment)) {
    return "dot segment";
  }
  // The URL parser drops trailing spaces where the name ends the URL, so the
  // last segment is judged as it would be requested.
  const last = (segments.at(-1) ?? "").replace(TRAILING_SPACES, "");
  if (last === "") {
    return "empty path segment";
  }
  if (isDotSegment(last)) {
    return "dot segment";
  }
  return null;
}

/** `?only=` typed into a name: say where it goes instead. */
function onlyMessage(name: string): string | null {
  const match = ONLY_PARAM.exec(name);
  if (!match || CONTROL.test(name)) {
    return null;
  }
  const [, base, only] = match;
  // A command is suggested only for a theme code and a part the `theme` verb
  // takes, each a safe literal word; otherwise the guidance alone.
  const code = THEME_CODE.exec(base)?.[1];
  const cli =
    code && parseThemeCode(code) && THEME_PARTS.has(only)
      ? ` (CLI: keystoneui theme ${shellWord(code)} --only ${shellWord(only)})`
      : "";
  return `**${shown(name)}**: ?only is not part of a name: get the command for ${shown(base)}, then append ?only=${shown(only)} to the printed URL${cli}.`;
}

/**
 * The refusal for a name that cannot be a registry item address, or null
 * when it can be one. `label` follows the name in the message.
 */
export function nameRefusal(name: string, label = ""): string | null {
  const reason = invalidReason(name);
  if (reason === null) {
    return null;
  }
  return (
    (label ? null : onlyMessage(name)) ??
    `**${shownName(name)}**${label}: not a valid registry item name (${reason}).`
  );
}
