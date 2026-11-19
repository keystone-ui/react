/**
 * The one rule for text this package did not write: one context, one helper.
 *
 * Every string that comes from a registry, a project file, the environment,
 * the caller, or the message of an error caught from a library or the
 * platform is rendered by the helper for the context it is printed in:
 *
 * - prose: `shown`;
 * - an inline code span: `inlineCode`;
 * - an argument of a suggested shell command: `shellWord`, the complete
 *   value as one word, and the command is printed only when the value
 *   `isCommandSafe` (otherwise the guidance alone);
 * - a code block: `codeBlock` (info string escaped, delimiter longer than
 *   any backtick run in the body, closing delimiter on its own line);
 * - a Markdown table cell: `tableCell`, over the cell's rendered text;
 * - a thrown message: escaped where the message is built (`shown`), and an
 *   error caught from a library or the platform through `escapedError`.
 *
 * Three exemptions, and only these: documentation Markdown returned as
 * Markdown (get_docs and CLI `docs`); source bytes inside a code block
 * body; and a JSON document printed or written as JSON (`info --json`, the
 * client config `init` writes), which JSON's own escaping governs.
 *
 * Ordinary values render exactly as they are. How this is checked:
 * `output-sinks.test.ts` scans the template placeholders of the package's
 * output files, each of which must be one whole helper call or carry a
 * reason; output built by concatenation, joins or a passed variable is
 * covered by the behaviour tests that file's header lists by sink.
 */

// Line breaks of every kind (CR, LF, NEL, LS, PS) and the C0, DEL and C1
// control characters.
const BREAK_OR_CONTROL =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: the characters escaped
  /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/g;
const BREAK_OR_CONTROL_TEST =
  // biome-ignore lint/suspicious/noControlCharactersInRegex: the characters tested
  /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/;
// A fence marker where a value could start a line.
const LEADING_FENCE = /^( {0,3})([`~])(?=\2\2)/;
const BACKTICK_RUN = /`+/g;
const SHELL_SAFE = /^[A-Za-z0-9@%+=:,._/-]+$/;

function escapeChar(c: string): string {
  return `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`;
}

/**
 * Text as prose: line breaks and controls escaped, no leading fence. A
 * non-string value (from a malformed file) is printed as it always was, as
 * its string form.
 */
export function shown(text: unknown): string {
  return String(text)
    .replace(BREAK_OR_CONTROL, escapeChar)
    .replace(
      LEADING_FENCE,
      (_, indent: string, mark: string) => `${indent}${escapeChar(mark)}`
    );
}

/**
 * Text as an inline code span: shown, between backtick runs longer than any
 * it holds (CommonMark), with a space inside when it starts or ends with a
 * backtick. An ordinary value is wrapped in single backticks.
 */
export function inlineCode(text: unknown): string {
  const safe = String(text).replace(BREAK_OR_CONTROL, escapeChar);
  const fence = "`".repeat(longestBacktickRun(safe) + 1);
  const pad = safe.startsWith("`") || safe.endsWith("`") ? " " : "";
  return `${fence}${pad}${safe}${pad}${fence}`;
}

/** Whether `text` can be one argument of a printed command line. */
export function isCommandSafe(text: string): boolean {
  return !BREAK_OR_CONTROL_TEST.test(text);
}

/** A value as one shell word: single-quoted unless every character is safe. */
export function shellWord(value: string): string {
  return SHELL_SAFE.test(value) ? value : `'${value.replaceAll("'", "'\\''")}'`;
}

/** The longest run of backticks in `text`. */
function longestBacktickRun(text: string): number {
  return Math.max(
    0,
    ...[...text.matchAll(BACKTICK_RUN)].map((run) => run[0].length)
  );
}

/**
 * A fenced code block: the info string escaped so no line break, control
 * character or backtick leaves it, a delimiter longer than the longest
 * backtick run in the body (three at least), the body's bytes unchanged,
 * and the closing delimiter on its own line.
 */
export function codeBlock(
  info: unknown,
  body: unknown,
  separator = "\n"
): string {
  const text = String(body);
  const fence = "`".repeat(Math.max(3, longestBacktickRun(text) + 1));
  const label = String(info)
    .replace(BREAK_OR_CONTROL, escapeChar)
    .replaceAll("`", "\\u0060");
  return `${fence}${label}\n${text}${separator}${fence}`;
}

const PIPE_AFTER_BACKSLASHES = /(\\*)\|/g;

/**
 * A Markdown table cell from its rendered text: every pipe ends up behind
 * an odd run of backslashes, so it stays in the cell; one already escaped
 * is kept as it is.
 */
export function tableCell(rendered: string): string {
  return rendered.replace(PIPE_AFTER_BACKSLASHES, (match, slashes: string) =>
    slashes.length % 2 === 0 ? `${slashes}\\|` : match
  );
}

function needsEscape(error: unknown, seen: Set<unknown>): boolean {
  if (typeof error === "string") {
    return shown(error) !== error;
  }
  if (!(error instanceof Error) || seen.has(error)) {
    return false;
  }
  seen.add(error);
  return (
    shown(error.message) !== error.message ||
    ("cause" in error && needsEscape(error.cause, seen))
  );
}

function escapedCopy(error: unknown, copies: Map<Error, Error>): unknown {
  if (typeof error === "string") {
    return shown(error);
  }
  if (!(error instanceof Error)) {
    return error;
  }
  const done = copies.get(error);
  if (done) {
    return done;
  }
  // Same prototype and own properties (name, code, errno, path, …), so the
  // kind and its details survive; only the displayed text is escaped.
  const copy = Object.create(Object.getPrototypeOf(error)) as Error;
  copies.set(error, copy);
  for (const key of Reflect.ownKeys(error)) {
    const descriptor = Object.getOwnPropertyDescriptor(error, key);
    if (descriptor) {
      Object.defineProperty(copy, key, descriptor);
    }
  }
  const message = shown(error.message);
  Object.defineProperty(copy, "message", {
    configurable: true,
    value: message,
    writable: true,
  });
  if (typeof error.stack === "string") {
    const head = `${error.name}: ${error.message}`;
    Object.defineProperty(copy, "stack", {
      configurable: true,
      value: error.stack.startsWith(head)
        ? `${error.name}: ${message}${error.stack.slice(head.length)}`
        : shown(error.stack),
      writable: true,
    });
  }
  if ("cause" in error) {
    Object.defineProperty(copy, "cause", {
      configurable: true,
      value: escapedCopy(error.cause, copies),
      writable: true,
    });
  }
  return copy;
}

/**
 * An error caught from a library or the platform, ready to be thrown on.
 * Returned as it is when its message (and its cause's, through any chain)
 * already reads the same through `shown`; otherwise a copy with the same
 * prototype, name, code, cause and other own properties, whose message,
 * stack head and causes are escaped. A string rejection is escaped too.
 * Credential redaction (display-url.ts) happens before this.
 */
export function escapedError(error: unknown): unknown {
  return needsEscape(error, new Set()) ? escapedCopy(error, new Map()) : error;
}
