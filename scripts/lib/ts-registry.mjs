/**
 * Reads the two TypeScript registries the component scaffold edits, as
 * literal arrays, and appends one element to them as text.
 *
 *  - packages/ui/tsup.config.ts: the direct `entryPoints` array of the
 *    object returned by the `defineConfig` options callback.
 *  - packages/ui/src/_registry.ts: the initializer of
 *    `export const ui: RegistryItem[] = […];`, one object per row with
 *    exactly one direct string `name`.
 *
 * A text search for the entry would find it in a comment, miss it when it
 * is spelled with other quotes or spacing, and a regex anchored on the
 * closing bracket breaks as soon as the bracket moves. So the files are
 * scanned as tokens: single- or double-quoted strings without escapes,
 * identifiers, numbers, punctuation, whitespace, and `//` or `/* … *\/`
 * comments outside strings. Anything else, and anything in either array
 * that is not a literal (a spread, a hole, a computed key, an expression),
 * is refused with a LiteralShapeError: guessing would put the entry in the
 * wrong place. Containers are walked with an explicit stack, so nesting
 * depth costs memory, not call stack. No dependencies.
 */

/** The file is not the literal shape this module reads. */
export class LiteralShapeError extends Error {}

const refuse = (what) => {
  throw new LiteralShapeError(what);
};

const SPACE = new Set([" ", "\t", "\n", "\r"]);
const IDENT_START = /[A-Za-z_$]/;
const IDENT_PART = /[A-Za-z0-9_$]/;
const DIGIT = /[0-9]/;
const PUNCTUATION = new Set(["{", "}", "[", "]", "(", ")", ",", ":", ";", "="]);
const QUOTES = new Set(['"', "'"]);

/** Index just past the comment starting at `i`, or `i` when there is none. */
function skipComment(source, i) {
  if (source.startsWith("//", i)) {
    const end = source.indexOf("\n", i);
    return end === -1 ? source.length : end;
  }
  if (source.startsWith("/*", i)) {
    const end = source.indexOf("*/", i + 2);
    if (end === -1) {
      refuse("unterminated comment");
    }
    return end + 2;
  }
  return i;
}

function readString(source, start) {
  const quote = source[start];
  let i = start + 1;
  while (source[i] !== quote) {
    const char = source[i];
    if (char === undefined || char === "\\" || char === "\n" || char === "\r") {
      refuse("string with an escape or line break");
    }
    i++;
  }
  return {
    type: "string",
    value: source.slice(start + 1, i),
    start,
    end: i + 1,
  };
}

function readWord(source, start, pattern) {
  let i = start + 1;
  while (i < source.length && pattern.test(source[i])) {
    i++;
  }
  return i;
}

function readNumber(source, start) {
  let end = readWord(source, start, DIGIT);
  if (source[end] === "." && DIGIT.test(source[end + 1] ?? "")) {
    end = readWord(source, end + 1, DIGIT);
  }
  if (IDENT_PART.test(source[end] ?? "")) {
    refuse("number");
  }
  return { type: "number", value: source.slice(start, end), start, end };
}

/** One token at `i`, which is not whitespace or a comment. */
function readToken(source, i) {
  const char = source[i];
  if (QUOTES.has(char)) {
    return readString(source, i);
  }
  if (IDENT_START.test(char)) {
    const end = readWord(source, i, IDENT_PART);
    return { type: "ident", value: source.slice(i, end), start: i, end };
  }
  if (DIGIT.test(char)) {
    return readNumber(source, i);
  }
  for (const punctuation of ["...", "=>"]) {
    if (source.startsWith(punctuation, i)) {
      return {
        type: "punct",
        value: punctuation,
        start: i,
        end: i + punctuation.length,
      };
    }
  }
  if (PUNCTUATION.has(char)) {
    return { type: "punct", value: char, start: i, end: i + 1 };
  }
  return refuse(`unexpected ${JSON.stringify(char)}`);
}

/** Every token of `source`, comments and whitespace dropped, then an EOF. */
export function tokenize(source) {
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    if (SPACE.has(source[i])) {
      i++;
      continue;
    }
    const next = skipComment(source, i);
    if (next !== i) {
      i = next;
      continue;
    }
    const token = readToken(source, i);
    tokens.push(token);
    i = token.end;
  }
  tokens.push({ type: "eof", value: "", start: i, end: i });
  return tokens;
}

/** A cursor over the tokens, with the checks the readers need. */
function cursor(source) {
  const tokens = tokenize(source);
  let index = 0;
  const c = {
    peek: () => tokens[index],
    next: () => {
      const token = tokens[index];
      if (token.type !== "eof") {
        index++;
      }
      return token;
    },
    is: (value) =>
      tokens[index].type !== "string" && tokens[index].value === value,
    expect: (value) => {
      if (!c.is(value)) {
        refuse(`expected ${value}`);
      }
      return c.next();
    },
    /** A string token whose text is `value`. */
    expectString: (value) => {
      const token = c.next();
      if (token.type !== "string" || token.value !== value) {
        refuse(`expected "${value}"`);
      }
      return token;
    },
    optional: (value) => {
      if (c.is(value)) {
        c.next();
      }
    },
    /** A sequence of identifiers and punctuation, in order. */
    words: (...values) => {
      for (const value of values) {
        const token = c.next();
        if (token.type === "string" || token.value !== value) {
          refuse(`expected ${value}`);
        }
      }
    },
  };
  return c;
}

/** An object key: an identifier or a quoted string, then `:`. */
function readKey(c) {
  const token = c.next();
  if (token.type !== "ident" && token.type !== "string") {
    refuse("expected an identifier or quoted key");
  }
  c.expect(":");
  return token.value;
}

const OPENERS = { "[": "]", "{": "}" };
const SCALAR_WORDS = new Set(["true", "false", "null"]);

/**
 * Starts the value at the cursor: a leaf comes back as a node, a container
 * is pushed on `stack` and null comes back. `scalars` also admits numbers,
 * true, false and null; strings, arrays and objects are always admitted.
 */
function openValue(c, stack, scalars) {
  const token = c.next();
  if (token.type === "string") {
    return token;
  }
  if (
    scalars &&
    (token.type === "number" ||
      (token.type === "ident" && SCALAR_WORDS.has(token.value)))
  ) {
    return token;
  }
  if (token.type === "punct" && OPENERS[token.value]) {
    stack.push({ closer: OPENERS[token.value], start: token.start });
    return null;
  }
  return refuse("expected a literal value");
}

/**
 * One literal value: a string, an array or object of literal values with
 * optional trailing commas, and with `scalars`, numbers and keywords.
 * Holes, spreads, computed keys and shorthand members are refused.
 */
export function readLiteral(c, { scalars = false } = {}) {
  const stack = [];
  let node = openValue(c, stack, scalars);
  for (;;) {
    if (node && stack.length === 0) {
      return node;
    }
    const frame = stack.at(-1);
    if (node) {
      // After a child: a comma, or the container's close.
      if (c.is(",")) {
        c.next();
      } else if (!c.is(frame.closer)) {
        refuse(`expected , or ${frame.closer}`);
      }
    }
    if (c.is(frame.closer)) {
      const close = c.next();
      stack.pop();
      node = { type: "container", start: frame.start, end: close.end };
      continue;
    }
    if (frame.closer === "}") {
      readKey(c);
    }
    node = openValue(c, stack, scalars);
  }
}

/**
 * Elements of the array whose `[` is next, each read by `element`, which
 * returns a node with `start` and `end`. The result says where the array
 * closes and how its last element ends, for appendElement().
 */
function readArray(c, element) {
  c.expect("[");
  const items = [];
  let trailingComma = false;
  while (!c.is("]")) {
    items.push(element(c));
    trailingComma = false;
    if (c.is(",")) {
      c.next();
      trailingComma = true;
    } else if (!c.is("]")) {
      refuse("expected , or ]");
    }
  }
  const close = c.next();
  return {
    items,
    close: close.start,
    lastEnd: items.length > 0 ? items.at(-1).end : null,
    trailingComma,
  };
}

const ENTRY_PATH = /^(?:\.\/)?src\/(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.tsx?$/;

function entryPath(c) {
  const token = c.next();
  if (token.type !== "string" || !ENTRY_PATH.test(token.value)) {
    refuse("expected an entry path string");
  }
  return { ...token, path: token.value.replace(/^\.\//, "") };
}

/**
 * packages/ui/tsup.config.ts as checked in: the `defineConfig` import, then
 * `export default defineConfig((options) => ({ … }));`. The object holds
 * literal settings, exactly one `entryPoints` array of entry paths, and
 * optionally `...options` as its last member. Each entry's `path` has one
 * leading `./` stripped.
 */
export function readTsupEntries(source) {
  const c = cursor(source);
  c.words("import", "{", "defineConfig", "}", "from");
  c.expectString("tsup");
  c.optional(";");
  c.words("export", "default", "defineConfig", "(", "(");
  const options = c.next();
  if (options.type !== "ident") {
    refuse("expected the options parameter");
  }
  c.words(")", "=>", "(", "{");
  let entries;
  while (!c.is("}")) {
    if (c.is("...")) {
      c.next();
      c.words(options.value);
      c.optional(",");
      if (!c.is("}")) {
        refuse("a spread before the last member");
      }
      break;
    }
    if (readKey(c) === "entryPoints") {
      if (entries) {
        refuse("entryPoints appears twice");
      }
      entries = readArray(c, entryPath);
    } else {
      readLiteral(c, { scalars: true });
    }
    if (c.is(",")) {
      c.next();
    } else if (!c.is("}")) {
      refuse("expected , or }");
    }
  }
  c.words("}", ")", ")");
  c.optional(";");
  if (c.peek().type !== "eof") {
    refuse("expected the end of the file");
  }
  if (!entries) {
    refuse("no entryPoints");
  }
  return entries;
}

/** A ui row: an object of literal fields with exactly one direct string `name`. */
function uiRow(c) {
  const open = c.expect("{");
  let name;
  while (!c.is("}")) {
    const key = readKey(c);
    if (key === "name") {
      const token = c.next();
      if (token.type !== "string" || name !== undefined) {
        refuse("expected one string name");
      }
      name = token.value;
    } else {
      readLiteral(c);
    }
    if (c.is(",")) {
      c.next();
    } else if (!c.is("}")) {
      refuse("expected , or }");
    }
  }
  const close = c.next();
  if (name === undefined) {
    refuse("a row without a name");
  }
  return { type: "row", name, start: open.start, end: close.end };
}

/**
 * packages/ui/src/_registry.ts as checked in: the `RegistryItem` type import,
 * then `export const ui: RegistryItem[] = [ … ];` and nothing else.
 */
export function readUiRows(source) {
  const c = cursor(source);
  c.words("import", "type", "{", "RegistryItem", "}", "from");
  c.expectString("shadcn/schema");
  c.optional(";");
  c.words("export", "const", "ui", ":", "RegistryItem", "[", "]", "=");
  const rows = readArray(c, uiRow);
  c.optional(";");
  if (c.peek().type !== "eof") {
    refuse("expected the end of the file");
  }
  return rows;
}

/**
 * `source` with `entry` (whole lines, no final newline) appended as the
 * last element of `array`. A missing comma goes directly after the last
 * element, before any comment. When only spaces or tabs precede the `]` on
 * its line, the entry goes on its own lines just above it; otherwise the
 * `]` moves to a new line indented by `closingIndent`.
 */
export function appendElement(source, array, entry, closingIndent) {
  const { close, lastEnd, trailingComma } = array;
  const lineStart = source.lastIndexOf("\n", close - 1) + 1;
  const added = /^[ \t]*$/.test(source.slice(lineStart, close))
    ? `${source.slice(0, lineStart)}${entry}\n${source.slice(lineStart)}`
    : `${source.slice(0, close)}\n${entry}\n${closingIndent}${source.slice(close)}`;
  if (lastEnd === null || trailingComma) {
    return added;
  }
  return `${added.slice(0, lastEnd)},${added.slice(lastEnd)}`;
}
