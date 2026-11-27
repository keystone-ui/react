#!/usr/bin/env node

/**
 * Scaffolding script for adding a new Keystone UI component.
 *
 * Usage:
 *   pnpm add:component MyComponent
 *   pnpm add:component my-component
 *
 * This creates all necessary files across the monorepo:
 *   - Component source file
 *   - package.json export
 *   - tsup.config.ts entry
 *   - _registry.ts entry
 *   - Storybook story template
 *   - Fumadocs demo + registry entry + MDX page
 */

import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  chmodSync,
  closeSync,
  constants,
  fchmodSync,
  fchownSync,
  fstatSync,
  ftruncateSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import { basename, dirname, join, relative } from "node:path";

import { renderLoader, renderManifest } from "./gen-demos.mjs";
import { demoEntriesFromPaths } from "./lib/demo-entries.mjs";
import {
  appendElement,
  LiteralShapeError,
  readTsupEntries,
  readUiRows,
} from "./lib/ts-registry.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

// --- Name utilities ---

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function toPascalCase(str) {
  return str
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

// --- Validation ---

function validate(kebab) {
  if (!/^[a-z][a-z0-9-]*$/.test(kebab)) {
    console.error(
      `Error: Invalid component name "${kebab}". Use letters, numbers, and hyphens only.`
    );
    process.exit(1);
  }
}

// --- Collision check ---

/** Repo-relative paths of the four files the scaffold creates. */
function destinations(name) {
  return [
    `packages/ui/src/${name}.tsx`,
    `apps/storybook/stories/${name}.stories.tsx`,
    `apps/docs/demos/${name}/default.tsx`,
    `apps/docs/content/docs/components/${name}.mdx`,
  ];
}

/** lstat, so a dangling symlink counts as taken rather than written through. */
function statOrNull(path) {
  try {
    return lstatSync(path);
  } catch {
    return null;
  }
}

/** The `Stopped at` line for a filesystem error at `path`. */
function stoppedLine(path, error) {
  return `Stopped at ${path} (${error.code}).`;
}

/** An fs error, as opposed to a bug: it has a string code such as EACCES. */
function isFsError(error) {
  return typeof error?.code === "string";
}

/**
 * Preflight lstat of a repo-relative path: its stat, or null when it does
 * not exist. Only ENOENT means absent. Any other error (EACCES on a parent,
 * ENOTDIR, EIO) says nothing about whether the path is taken, so it is
 * pushed onto `lines` as a stop, and false comes back.
 */
function lookup(path, lines) {
  try {
    return lstatSync(join(ROOT, path));
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    if (!isFsError(error)) {
      throw error;
    }
    lines.push(stoppedLine(path, error));
    return false;
  }
}

/**
 * Every demo file for the preflight key check, or null after pushing the
 * stop for a scan error onto `lines`, named at the directory that failed.
 */
function preflightDemoFiles(lines) {
  try {
    return demoFiles();
  } catch (error) {
    if (!isFsError(error)) {
      throw error;
    }
    const at =
      typeof error.path === "string" && error.path.startsWith(`${ROOT}/`)
        ? relative(ROOT, error.path)
        : DEMOS;
    lines.push(stoppedLine(at, error));
    return null;
  }
}

/**
 * Everything the scaffold would create or add that is already there, one
 * line each. Runs before the first write: a single collision means nothing
 * is written, so a contributor's existing story, demo or page survives. A
 * lookup that fails for any reason but absence is a line too, and the
 * checks that can still run do.
 */
function findCollisions(name) {
  const collisions = [];

  for (const path of destinations(name)) {
    if (lookup(path, collisions)) {
      collisions.push(path);
    }
  }
  const demoDir = `apps/docs/demos/${name}`;
  const demoDirStat = lookup(demoDir, collisions);
  if (demoDirStat && !demoDirStat.isDirectory()) {
    collisions.push(`${demoDir} (exists and is not a directory)`);
  }

  const demos = preflightDemoFiles(collisions);
  if (demos) {
    collisions.push(...duplicateDemoKeys([...demos, `${name}/default.tsx`]));
  }

  collisions.push(
    ...readRegistry(PACKAGE, (bytes) => inspectPackage(bytes, name))
  );

  collisions.push(...readRegistry(TSUP, (bytes) => inspectTsup(bytes, name)));
  collisions.push(
    ...readRegistry(UI_REGISTRY, (bytes) => inspectUi(bytes, name))
  );
  collisions.push(...readRegistry(META, (bytes) => inspectMeta(bytes, name)));

  return collisions;
}

const DEMOS = "apps/docs/demos";
const PACKAGE = "packages/ui/package.json";
const TSUP = "packages/ui/tsup.config.ts";
const UI_REGISTRY = "packages/ui/src/_registry.ts";
const META = "apps/docs/content/docs/components/meta.json";
/** Every registry replaceRegistry() replaces, in the order they are edited. */
const REGISTRIES = [PACKAGE, TSUP, UI_REGISTRY, META];

// --- JSON registries ---
//
// Read by their fields, never by text search, and edited by inserting the
// new entry as text, so the rest of the document keeps its bytes: a parse
// and stringify of the whole file would move integer-like keys first and
// round numbers. A registry that does not have the shape the scaffold edits
// stops the run: guessing would add an entry in the wrong place, or
// overwrite one.

/** Why a registry cannot be edited; the message is the `Stopped at` reason. */
class RegistryShapeError extends Error {}

const UTF8 = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
const JSON_SPACE = /[ \t\n\r]/;
const LITERAL_END = /[ \t\n\r,\]}]/;
const CLOSER = { object: "}", array: "]" };

/**
 * Registry bytes as text. Bytes that are not UTF-8 are not the registry's
 * shape: `reason` says what that shape is.
 */
function decodeRegistry(bytes, reason = "invalid JSON") {
  try {
    return UTF8.decode(bytes);
  } catch (error) {
    throw new RegistryShapeError(reason, { cause: error });
  }
}

/** Index of the quote that closes the JSON string opening at `start`. */
function stringEnd(source, start) {
  let i = start + 1;
  while (source[i] !== '"') {
    i += source[i] === "\\" ? 2 : 1;
  }
  return i;
}

/**
 * A document `JSON.parse` accepted, as nodes that keep their source offsets.
 * An object holds `members` (a Map by decoded key), an array `items`;
 * `lastEnd` is where the last child ends, null when there is none. A
 * repeated key is invalid: `JSON.parse` keeps the last value silently, and
 * the first would be lost. Open containers live on an explicit stack, so
 * nesting depth costs memory, not call stack.
 */
function parseJsonTree(source) {
  const cursor = { source, i: 0 };
  const stack = [];
  for (;;) {
    skipSpace(cursor);
    const parent = stack.at(-1);
    if (parent && source[cursor.i] === CLOSER[parent.type]) {
      cursor.i++;
      parent.end = cursor.i;
      stack.pop();
      if (stack.length === 0) {
        return parent;
      }
      stack.at(-1).lastEnd = parent.end;
    } else if (source[cursor.i] === ",") {
      cursor.i++;
    } else {
      const node = readJsonNode(cursor, parent, stack.length);
      if (CLOSER[node.type]) {
        stack.push(node);
      } else if (parent) {
        parent.lastEnd = node.end;
      } else {
        return node;
      }
    }
  }
}

function skipSpace(cursor) {
  while (
    cursor.i < cursor.source.length &&
    JSON_SPACE.test(cursor.source[cursor.i])
  ) {
    cursor.i++;
  }
}

function readJsonString(cursor) {
  const start = cursor.i;
  cursor.i = stringEnd(cursor.source, start) + 1;
  return JSON.parse(cursor.source.slice(start, cursor.i));
}

/**
 * One value at the cursor (after its key, inside an object), attached to
 * `parent`. A container comes back open: its `end` is set when it closes.
 */
function readJsonNode(cursor, parent, depth) {
  let key;
  if (parent?.type === "object") {
    key = readJsonString(cursor);
    if (parent.members.has(key)) {
      throw new RegistryShapeError("invalid JSON");
    }
    skipSpace(cursor);
    cursor.i++;
    skipSpace(cursor);
  }
  const node = readJsonValueStart(cursor, depth);
  if (parent?.type === "object") {
    parent.members.set(key, node);
  } else if (parent) {
    parent.items.push(node);
  }
  return node;
}

function readJsonValueStart(cursor, depth) {
  const { source } = cursor;
  const start = cursor.i;
  const char = source[start];
  if (char === "{" || char === "[") {
    cursor.i++;
    const node = { start, depth, lastEnd: null };
    return char === "{"
      ? { ...node, type: "object", members: new Map() }
      : { ...node, type: "array", items: [] };
  }
  if (char === '"') {
    const value = readJsonString(cursor);
    return { type: "string", start, end: cursor.i, value };
  }
  while (cursor.i < source.length && !LITERAL_END.test(source[cursor.i])) {
    cursor.i++;
  }
  return { type: "literal", start, end: cursor.i };
}

function parseRegistryJson(source) {
  try {
    JSON.parse(source);
  } catch (error) {
    throw new RegistryShapeError("invalid JSON", { cause: error });
  }
  return parseJsonTree(source);
}

/** The JSON tree of registry bytes or text. */
function jsonTree(input) {
  return parseRegistryJson(
    Buffer.isBuffer(input) ? decodeRegistry(input) : input
  );
}

function member(node, key) {
  return node?.type === "object" ? node.members.get(key) : undefined;
}

/**
 * Both export maps of packages/ui/package.json, each checked on its own: a
 * map that is not an object gives its reason, and the other map's collision
 * is still reported. A key counts as taken even when it holds `null`.
 */
function inspectPackage(input, name) {
  const tree = jsonTree(input);
  const key = `./${name}`;
  const maps = [
    ["exports", member(tree, "exports")],
    ["publishConfig.exports", member(member(tree, "publishConfig"), "exports")],
  ];
  const reasons = [];
  const collisions = [];
  for (const [field, node] of maps) {
    if (node?.type !== "object") {
      reasons.push(`expected ${field} object`);
    } else if (node.members.has(key)) {
      collisions.push(`${PACKAGE}: ${field} "${key}"`);
    }
  }
  return { maps: maps.map(([, node]) => node), reasons, collisions };
}

/** apps/docs/content/docs/components/meta.json, with `pages` all strings. */
function inspectMeta(input, name) {
  const tree = jsonTree(input);
  const pages = member(tree, "pages");
  if (
    pages?.type !== "array" ||
    !pages.items.every((item) => item.type === "string")
  ) {
    return {
      pages,
      reasons: ["expected pages array of strings"],
      collisions: [],
    };
  }
  const taken = pages.items.some((item) => item.value === name);
  return {
    pages,
    reasons: [],
    collisions: taken ? [`${META}: pages "${name}"`] : [],
  };
}

// --- TypeScript registries ---
//
// tsup's `entryPoints` and _registry.ts's `ui` are read as literal arrays by
// scripts/lib/ts-registry.mjs, never by text search: a comment holding the
// entry is not the entry, and `'./src/x.tsx'` is. Anything that is not a
// literal array of the expected elements stops the run with the file's one
// reason.

const TSUP_SHAPE = "expected literal entryPoints path array";
const UI_SHAPE = "expected literal ui array of named objects";

/** `read(text)` of registry bytes or text, its refusals as `reason`. */
function readLiteralRegistry(input, read, reason) {
  const text = Buffer.isBuffer(input) ? decodeRegistry(input, reason) : input;
  try {
    return read(text);
  } catch (error) {
    if (error instanceof LiteralShapeError) {
      throw new RegistryShapeError(reason, { cause: error });
    }
    throw error;
  }
}

/** packages/ui/tsup.config.ts: whether `src/<name>.tsx` is an entry. */
function inspectTsup(input, name) {
  const entries = readLiteralRegistry(input, readTsupEntries, TSUP_SHAPE);
  const path = `src/${name}.tsx`;
  return {
    array: entries,
    values: entries.items.map((item) => item.path),
    reasons: [],
    collisions: entries.items.some((item) => item.path === path)
      ? [`${TSUP}: entry "${path}"`]
      : [],
  };
}

/** packages/ui/src/_registry.ts: whether a `ui` row is named `name`. */
function inspectUi(input, name) {
  const rows = readLiteralRegistry(input, readUiRows, UI_SHAPE);
  return {
    array: rows,
    values: rows.items.map((item) => item.name),
    reasons: [],
    collisions: rows.items.some((item) => item.name === name)
      ? [`${UI_REGISTRY}: entry name: "${name}"`]
      : [],
  };
}

/**
 * Opens a registry without following a symlink at its path, and without
 * waiting: a named pipe put there would block a plain open until something
 * opened its other end. Callers check the type before the first read.
 */
function openRegistry(path, flags) {
  try {
    return openSync(join(ROOT, path), noFollow(nonBlocking(flags)));
  } catch (error) {
    if (error.code === "ELOOP") {
      throw new RegistryShapeError("symlinked registry", { cause: error });
    }
    throw error;
  }
}

/** Every byte of `fd`, read positionally from offset zero to EOF. */
function readToEnd(fd) {
  const buffer = Buffer.alloc(64 * 1024);
  const chunks = [];
  let position = 0;
  let read;
  do {
    read = readSync(fd, buffer, 0, buffer.length, position);
    chunks.push(Buffer.from(buffer.subarray(0, read)));
    position += read;
  } while (read > 0);
  return Buffer.concat(chunks);
}

/**
 * Preflight read of one registry, `inspect(bytes)`: the lines naming why
 * it, or a part of it, cannot be read, beside the collisions it can still
 * show, so the other registries are checked and listed too.
 */
function readRegistry(path, inspect) {
  let found;
  try {
    const fd = openRegistry(path, constants.O_RDONLY);
    let bytes;
    try {
      requireRegularFile(fd);
      bytes = readToEnd(fd);
    } finally {
      closeSync(fd);
    }
    found = inspect(bytes);
  } catch (error) {
    if (error instanceof RegistryShapeError) {
      return [`Stopped at ${path} (${error.message}).`];
    }
    // A registry that cannot be read, ENOENT included: it is required.
    if (isFsError(error)) {
      return [stoppedLine(path, error)];
    }
    throw error;
  }
  return [
    ...found.reasons.map((reason) => `Stopped at ${path} (${reason}).`),
    ...found.collisions,
  ];
}

/**
 * The edit's own reading of a registry: a shape reason stops it, and so does
 * the entry already being there (someone saved it after the check, and the
 * save is theirs to keep).
 */
function requireEditable(found) {
  if (found.reasons.length > 0) {
    throw new RegistryShapeError(found.reasons[0]);
  }
  if (found.collisions.length > 0) {
    throw new RegistryShapeError("entry appeared after the check");
  }
}

/**
 * `source` with `text` added as the last child of `node`, laid out the way
 * `JSON.stringify(…, null, 2)` lays out a child at that depth.
 */
function insertLast(source, node, text) {
  const inner = "  ".repeat(node.depth + 1);
  const entry = text.split("\n").join(`\n${inner}`);
  if (node.lastEnd === null) {
    const outer = "  ".repeat(node.depth);
    return `${source.slice(0, node.start + 1)}\n${inner}${entry}\n${outer}${source.slice(node.end - 1)}`;
  }
  return `${source.slice(0, node.lastEnd)},\n${inner}${entry}${source.slice(node.lastEnd)}`;
}

function memberText(key, value) {
  return `${JSON.stringify(key)}: ${JSON.stringify(value, null, 2)}`;
}

// --- Replacing a registry ---
//
// A registry is never written in place: a contributor's editor may save it
// at any moment, and a write through the scaffold's descriptor would land on
// top of that save. Instead:
//
//  1. Read: open the regular file without following a symlink, pin its
//     identity and bytes, and compute the edit from those bytes. The whole
//     result is parsed again before anything is written.
//  2. Stage: write the result to a new sibling file only this run created.
//  3. Publish: check the registry and the staging file are both still what
//     this run saw and wrote, then rename the staging file over the
//     registry. The rename is the last thing this run does to the registry.
//
// After a stop the staging file is removed only when it is provably this
// run's and unmodified (see discardStaging); anything else is left and
// listed. Usable by any registry whose edit is a function of its text.

const fsError = (code) => Object.assign(new Error(code), { code });
/** open(2) flags that refuse a symlink at the final path component. */
function noFollow(flags) {
  // biome-ignore lint/suspicious/noBitwiseOperators: open(2) flags are a bit set
  return flags | constants.O_NOFOLLOW;
}

/** open(2) flags that return at once on a named pipe instead of waiting. */
function nonBlocking(flags) {
  // biome-ignore lint/suspicious/noBitwiseOperators: open(2) flags are a bit set
  return flags | constants.O_NONBLOCK;
}

/**
 * The staging file's open(2) flags. O_EXCL with O_CREAT: a new file or
 * EEXIST. O_APPEND: every write goes after whatever the file holds, so the
 * write that continues after a short one cannot land on bytes someone else
 * put there meanwhile; the check before publishing sees them instead.
 */
const STAGING_FLAGS = noFollow(
  // biome-ignore lint/suspicious/noBitwiseOperators: open(2) flags are a bit set
  constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_APPEND
);

/** `mode & 07777`: the permission bits, without the file type. */
function permissionBits(mode) {
  // biome-ignore lint/suspicious/noBitwiseOperators: st_mode is a bit set
  return mode & 0o7777n;
}

/** The parts of a stat that say "same file, same owner, same mode". */
function identity(stat) {
  return {
    dev: stat.dev,
    ino: stat.ino,
    uid: stat.uid,
    gid: stat.gid,
    mode: stat.mode,
  };
}

function sameIdentity(a, b) {
  return (
    a.dev === b.dev &&
    a.ino === b.ino &&
    a.uid === b.uid &&
    a.gid === b.gid &&
    a.mode === b.mode
  );
}

/** The bigint stat of `fd`, which must be a regular file. */
function requireRegularFile(fd) {
  const stat = fstatSync(fd, { bigint: true });
  if (!stat.isFile()) {
    throw new RegistryShapeError("not a regular file");
  }
  return stat;
}

/** Step 1: the open, regular registry with its pinned identity and bytes. */
function pinRegistry(path) {
  const fd = openRegistry(path, constants.O_RDWR);
  try {
    const stat = requireRegularFile(fd);
    return { fd, pinned: identity(stat), bytes: readToEnd(fd) };
  } catch (error) {
    closeQuietly(fd);
    throw error;
  }
}

/**
 * The check just before publishing: the pinned descriptor read again from
 * offset zero gives the same bytes, and the path still names a file with
 * the pinned identity, owner and mode. Anything else, including the path
 * having gone, means someone saved it since the read.
 */
function verifyJsonSnapshot(path, fd, snapshot) {
  const changed = () =>
    new RegistryShapeError("registry changed after the read");
  if (!readToEnd(fd).equals(snapshot.bytes)) {
    throw changed();
  }
  let live;
  try {
    live = lstatSync(join(ROOT, path), { bigint: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      throw changed();
    }
    throw error;
  }
  if (!sameIdentity(identity(live), snapshot.pinned)) {
    throw changed();
  }
}

/**
 * The access control list on `path` as text, "" when it has none. Mode bits
 * cannot say "everyone but this user may read", and the rename puts the
 * staging file's list in the registry's place, so the two are compared
 * before publishing. macOS `ls -le` prints the entries (`ls -l` shows an `@`
 * instead of the `+` when the file also has extended attributes); elsewhere
 * `ls -l` marks a list with `+` and `getfacl` prints it.
 */
function accessControlList(path) {
  const absolute = join(ROOT, path);
  const output = (file, args) =>
    execFileSync(file, args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  if (process.platform === "darwin") {
    return output("/bin/ls", ["-lde", absolute])
      .split("\n")
      .slice(1)
      .join("\n")
      .trim();
  }
  if (output("ls", ["-ld", "--", absolute])[10] !== "+") {
    return "";
  }
  return output("getfacl", [
    "--omit-header",
    "--absolute-names",
    "--",
    absolute,
  ]).trim();
}

/**
 * The staging file would publish with the registry's access control list.
 * Runs before the verification read, keeping the external commands out of
 * the gap between it and the rename. When a listing fails, the registry
 * and staging checks say why if they can (one of them changed); otherwise
 * the list cannot be shown to be kept, and the run stops.
 */
function requireSameAccessControl(path, source, staging, candidate) {
  let same;
  try {
    same = accessControlList(path) === accessControlList(staging.path);
  } catch (error) {
    verifyJsonSnapshot(path, source.fd, source);
    requireStagingIntact(staging, candidate);
    throw new RegistryShapeError("access control list unreadable", {
      cause: error,
    });
  }
  if (!same) {
    throw new RegistryShapeError("access control list would not be kept");
  }
}

/** The staging file is still this run's, holding `candidate`. */
function requireStagingIntact(staging, candidate) {
  if (!stagingIntact(staging, candidate)) {
    staging.changed = true;
    throw new RegistryShapeError("staging file changed");
  }
}

/**
 * Step 2a: an exclusive, private sibling of the registry, returned as soon
 * as it exists so a stop at any later step can find it. A name that is
 * taken stops the run at that name.
 */
function createStaging(path) {
  const name = `${dirname(path)}/.${basename(path)}.${randomBytes(8).toString("hex")}.tmp`;
  try {
    return {
      path: name,
      fd: openSync(join(ROOT, name), STAGING_FLAGS, 0o600),
      written: 0,
    };
  } catch (error) {
    error.stopPath = name;
    throw error;
  }
}

/** The staging file's identity, owner and actual mode (0600 less the umask). */
function recordStaging(staging) {
  const stat = fstatSync(staging.fd, { bigint: true });
  staging.dev = stat.dev;
  staging.ino = stat.ino;
  staging.uid = stat.uid;
  staging.gid = stat.gid;
  staging.mode = permissionBits(stat.mode);
}

/**
 * Step 2b: all of `candidate` into the staging file, then the registry's
 * owner, group and permission bits, set explicitly so the umask plays no
 * part. A write that makes no progress is an I/O error.
 */
function fillStaging(staging, candidate, pinned) {
  while (staging.written < candidate.length) {
    const count = writeSync(
      staging.fd,
      candidate,
      staging.written,
      candidate.length - staging.written
    );
    if (count === 0) {
      throw fsError("EIO");
    }
    staging.written += count;
  }
  if (staging.uid !== pinned.uid || staging.gid !== pinned.gid) {
    fchownSync(staging.fd, Number(pinned.uid), Number(pinned.gid));
    staging.uid = pinned.uid;
    staging.gid = pinned.gid;
  }
  fchmodSync(staging.fd, Number(permissionBits(pinned.mode)));
  staging.mode = permissionBits(pinned.mode);
  const { fd } = staging;
  staging.fd = undefined;
  closeSync(fd);
}

/**
 * Whether `path` (the staging name by default) is still the staging file
 * this run created, with the owner and permissions it gave it, holding
 * exactly `expected`. Only absence, a symlink or other non-regular file, or
 * a different identity, owner, mode or content mean "changed". Every other
 * error, a failed close included, is thrown: an I/O failure stops the run
 * with its own code rather than passing or reading as a change.
 */
function stagingIntact(staging, expected, path = staging.path) {
  let fd;
  try {
    fd = openSync(join(ROOT, path), noFollow(nonBlocking(constants.O_RDONLY)));
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ELOOP") {
      return false;
    }
    throw error;
  }
  let intact;
  try {
    const stat = fstatSync(fd, { bigint: true });
    intact =
      stat.isFile() &&
      stat.dev === staging.dev &&
      stat.ino === staging.ino &&
      stat.uid === staging.uid &&
      stat.gid === staging.gid &&
      permissionBits(stat.mode) === staging.mode &&
      readToEnd(fd).equals(expected);
  } catch (error) {
    closeQuietly(fd);
    throw error;
  }
  closeSync(fd);
  return intact;
}

/**
 * After a stop: remove the staging file only if it is provably this run's
 * and unmodified, and list whatever is left with the paths this run
 * created. One already seen changed is left as it is. Never throws.
 */
function releaseStaging(staging, expected) {
  if (staging.fd !== undefined) {
    if (staging.ino === undefined) {
      try {
        recordStaging(staging);
      } catch {
        // Its identity is unknown, so it cannot be told apart: it is kept.
      }
    }
    closeQuietly(staging.fd);
    staging.fd = undefined;
  }
  const left =
    staging.ino === undefined || staging.changed
      ? staging.path
      : discardStaging(staging, expected);
  if (left) {
    created.push(left);
  }
}

/**
 * Removes the staging file if it is intact. It is first renamed into a new
 * private directory beside it: the rename moves whatever holds the name at
 * that instant, and the checks then run on a name nobody else knows, so a
 * file put at the staging name before them is never the one removed.
 * Anything that is not this run's is linked back under the staging name
 * (never over something new there). Returns the path where what was there
 * now is, or null when nothing is left.
 */
function discardStaging(staging, expected) {
  let dir;
  try {
    dir = relative(
      ROOT,
      mkdtempSync(join(ROOT, dirname(staging.path), ".add-component-"))
    );
    // mkdtemp's 0700 less the umask: a umask such as 0277 would leave it
    // without the write permission the rename into it needs.
    chmodSync(join(ROOT, dir), 0o700);
  } catch {
    if (dir !== undefined) {
      removeDirectoryQuietly(dir);
    }
    return staging.path;
  }
  const moved = `${dir}/staging`;
  try {
    renameSync(join(ROOT, staging.path), join(ROOT, moved));
  } catch (error) {
    removeDirectoryQuietly(dir);
    return error.code === "ENOENT" ? null : staging.path;
  }
  let intact = false;
  try {
    intact = stagingIntact(staging, expected, moved);
  } catch {
    // Not provably this run's: it goes back.
  }
  if (intact) {
    try {
      unlinkSync(join(ROOT, moved));
      removeDirectoryQuietly(dir);
      return null;
    } catch {
      // Unremovable: it goes back and is listed.
    }
  }
  try {
    if (lstatSync(join(ROOT, moved)).isDirectory()) {
      return moved;
    }
    linkSync(join(ROOT, moved), join(ROOT, staging.path));
  } catch {
    // The name is taken again, or this cannot be linked: it stays here.
    return moved;
  }
  try {
    unlinkSync(join(ROOT, moved));
  } catch {
    return staging.path;
  }
  removeDirectoryQuietly(dir);
  return staging.path;
}

function removeDirectoryQuietly(path) {
  try {
    rmdirSync(join(ROOT, path));
  } catch {
    // An empty directory left behind is harmless; nothing else is in it.
  }
}

/**
 * Replaces the registry at `path` with `change(text)`, by the three steps
 * above. `change` throws a RegistryShapeError to refuse; a refusal is only
 * reported once the registry is known not to have changed since the read,
 * since a refusal of bytes someone has already replaced would be wrong.
 * `added(text)` parses the complete result again and says whether it holds
 * exactly the new entry. Bytes that are not UTF-8 are refused as `reason`.
 */
function replaceRegistry(path, change, added, reason = "invalid JSON") {
  let source;
  let staging;
  let candidate;
  try {
    source = pinRegistry(path);
    try {
      const text = change(decodeRegistry(source.bytes, reason));
      if (!added(text)) {
        throw new RegistryShapeError(
          reason === "invalid JSON" ? "the edit did not add the entry" : reason
        );
      }
      candidate = Buffer.from(text);
    } catch (error) {
      if (error instanceof RegistryShapeError) {
        verifyJsonSnapshot(path, source.fd, source);
      }
      throw error;
    }
    staging = createStaging(path);
    recordStaging(staging);
    fillStaging(staging, candidate, source.pinned);
    requireSameAccessControl(path, source, staging, candidate);
    verifyJsonSnapshot(path, source.fd, source);
    requireStagingIntact(staging, candidate);
    const { fd } = source;
    source.fd = undefined;
    closeSync(fd);
    renameSync(join(ROOT, staging.path), join(ROOT, path));
  } catch (error) {
    if (source?.fd !== undefined) {
      closeQuietly(source.fd);
    }
    if (staging) {
      releaseStaging(staging, candidate.subarray(0, staging.written));
    }
    stopAt(error.stopPath ?? path, error);
  }
}

/**
 * Every file under apps/docs/demos, relative and POSIX-separated, walked the
 * way gen-demos walks it. A missing demos folder counts as empty.
 */
function demoFiles() {
  const dir = join(ROOT, DEMOS);
  let entries;
  try {
    entries = readdirSync(dir, { recursive: true, withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(dir, join(entry.parentPath, entry.name)).split("\\").join("/")
    );
}

/**
 * One sentence per pair of demo files that get the same registry key, by
 * gen-demos' own key calculation. `scaffold/probe-default.tsx` and
 * `scaffold-probe/default.tsx` are both "scaffold-probe-default", and
 * gen-demos refuses to build a registry with a duplicate key.
 */
function duplicateDemoKeys(files) {
  const byKey = new Map();
  for (const file of [...new Set(files)].sort()) {
    const [entry] = demoEntriesFromPaths([file]);
    if (entry) {
      byKey.set(entry.key, [...(byKey.get(entry.key) ?? []), file]);
    }
  }
  const sentences = [];
  for (const [key, [first, ...others]] of byKey) {
    for (const other of others) {
      sentences.push(
        `Demo key "${key}" is produced by both ${DEMOS}/${first} and ${DEMOS}/${other}.`
      );
    }
  }
  return sentences;
}

function refuseCollisions(name) {
  const collisions = findCollisions(name);
  if (collisions.length === 0) {
    return;
  }
  console.error(
    `Error: "${name}" collides with what is already in the repo. Nothing was written.\n`
  );
  for (const collision of collisions) {
    console.error(`  ${collision}`);
  }
  console.error(
    "\nPick another name, or move the existing files and entries out of the way first."
  );
  process.exit(1);
}

// --- Write phase ---
//
// Past the check another process can still get somewhere first: a second
// run, an editor saving. So nothing is overwritten (files are opened `wx`)
// and nothing is ever removed: by the time something fails, a path this run
// created may hold someone else's save. The run stops at the first failure
// and lists what it created, for the person to look at.

/** Repo-relative paths this run created, in creation order. */
const created = [];

function stop(lines) {
  console.error(
    "\nError: scaffolding stopped part-way. Nothing was removed.\n"
  );
  for (const line of lines) {
    console.error(line);
  }
  console.error(
    `Paths created by this run: ${created.length > 0 ? created.join(", ") : "none"}.`
  );
  process.exit(1);
}

function stopAt(path, error) {
  const lines = [`Stopped at ${path} (${error.code ?? error.message}).`];
  if (error.code === "EEXIST") {
    lines.push(`${path} (appeared after the check)`);
  }
  stop(lines);
}

function closeQuietly(fd) {
  try {
    closeSync(fd);
  } catch {
    // The error already being reported is the one that matters.
  }
}

/** Writes all of `text` through `fd`, from `position` when one is given. */
function writeAll(fd, text, position = null) {
  const bytes = Buffer.from(text);
  let done = 0;
  while (done < bytes.length) {
    done += writeSync(
      fd,
      bytes,
      done,
      bytes.length - done,
      position === null ? null : position + done
    );
  }
  return bytes.length;
}

/**
 * Creates a file that must not exist (`wx`), writes it through that
 * descriptor and closes it. The path counts as created as soon as the open
 * succeeds, even if the write or the close then fails.
 */
function createFile(path, content) {
  let fd;
  try {
    fd = openSync(join(ROOT, path), "wx");
  } catch (error) {
    stopAt(path, error);
  }
  created.push(path);
  try {
    writeAll(fd, content);
  } catch (error) {
    closeQuietly(fd);
    stopAt(path, error);
  }
  try {
    closeSync(fd);
  } catch (error) {
    stopAt(path, error);
  }
}

/** One level of mkdir. An existing real directory is reused, not recorded. */
function makeDirectory(path) {
  try {
    mkdirSync(join(ROOT, path));
  } catch (error) {
    if (
      error.code === "EEXIST" &&
      statOrNull(join(ROOT, path))?.isDirectory()
    ) {
      return;
    }
    stopAt(path, error);
  }
  created.push(path);
}

/**
 * The file `editFile` opened is not a registry under another name, a
 * symlink or a hard link to it: a write through it would write the live
 * registry in place, which only replaceRegistry() may change. Compared with
 * what the registry paths name now, so a registry this run already
 * replaced counts as its new file.
 */
function requireNotRegistry(stat) {
  for (const registry of REGISTRIES) {
    let live;
    try {
      live = lstatSync(join(ROOT, registry), { bigint: true });
    } catch (error) {
      // A registry that is not there cannot be this file; any other error
      // leaves that unknown, so the write does not happen.
      if (error.code === "ENOENT") {
        continue;
      }
      error.stopPath = registry;
      throw error;
    }
    if (live.dev === stat.dev && live.ino === stat.ino) {
      throw new RegistryShapeError(`same file as ${registry}`);
    }
  }
}

/**
 * Rewrites a registry file through one descriptor: read it, apply `change`,
 * write back only if the bytes differ. A generated output that is absent is
 * created exclusively instead. Returns whether the file changed. The four
 * registries do not come here: see replaceRegistry().
 */
function editFile(path, change, { generated = false } = {}) {
  let fd;
  try {
    fd = openSync(join(ROOT, path), "r+");
  } catch (error) {
    if (!(generated && error.code === "ENOENT")) {
      stopAt(path, error);
    }
  }
  if (fd === undefined) {
    let content;
    try {
      content = change(null);
    } catch (error) {
      stopAt(path, error);
    }
    createFile(path, content);
    return true;
  }
  try {
    const stat = fstatSync(fd, { bigint: true });
    if (!stat.isFile()) {
      throw new Error("not a regular file");
    }
    requireNotRegistry(stat);
    const source = readFileSync(fd, "utf-8");
    const next = change(source);
    if (next === source) {
      closeSync(fd);
      return false;
    }
    ftruncateSync(fd, writeAll(fd, next, 0));
    closeSync(fd);
    return true;
  } catch (error) {
    closeQuietly(fd);
    stopAt(error.stopPath ?? path, error);
  }
}

// --- File generators ---

function componentTemplate(pascal, kebab) {
  return `"use client";

import * as React from "react";
import { cn } from "./utils";

interface ${pascal}Props extends React.HTMLAttributes<HTMLDivElement> {
  // Add props here
}

function ${pascal}({
  className,
  ref,
  ...props
}: ${pascal}Props & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      className={cn("", className)}
      data-slot="${kebab}"
      ref={ref}
      {...props}
    />
  );
}

export { ${pascal} };
export type { ${pascal}Props };
`;
}

function storyTemplate(pascal, kebab) {
  return `import type { Meta, StoryObj } from "@storybook/react";
import { ${pascal} } from "@keystoneui/react/${kebab}";

const meta: Meta<typeof ${pascal}> = {
  title: "${pascal}",
  component: ${pascal},
};

export default meta;
type Story = StoryObj<typeof ${pascal}>;

export const Default: Story = {
  render: () => (
    <${pascal}>
      ${pascal} component
    </${pascal}>
  ),
};
`;
}

function demoTemplate(pascal, kebab) {
  return `"use client";

import { ${pascal} } from "@keystoneui/react/${kebab}";

export default function ${pascal}Default() {
  return <${pascal}>${pascal} component</${pascal}>;
}
`;
}

// The canonical page of apps/docs/content/docs/components/_template.mdx:
// preview first, Installation, then Usage with the import. The demo above is
// a bare `return` of one element from that import, so Usage carries it as
// the snippet, as `migrate-component-mdx.mjs` would.
function mdxTemplate(pascal, kebab) {
  return `---
title: ${pascal}
description: TODO - Add a description for the ${pascal} component.
---

<ComponentPreview name="${kebab}-default" />

## Installation

<CodeBlockTabs items={["CLI", "Manual"]}>

\`\`\`bash tab="CLI"
npx shadcn@latest add https://keystoneui.io/r/${kebab}.json
\`\`\`

<div tab="Manual">

<Steps>

<Step>Install dependencies.</Step>

\`\`\`bash
pnpm add @keystoneui/react@beta @base-ui/react
\`\`\`

<Step>Copy the source.</Step>

<ComponentSource name="${kebab}-default" />

<Step>Update import paths to match your project.</Step>

</Steps>

</div>

</CodeBlockTabs>

## Usage

\`\`\`tsx
import { ${pascal} } from "@keystoneui/react/${kebab}";
\`\`\`

\`\`\`tsx
<${pascal}>${pascal} component</${pascal}>
\`\`\`

## API Reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| \`className\` | \`string\` | - | Additional CSS classes |
| \`children\` | \`ReactNode\` | - | Content |
`;
}

// --- Registry edits ---
//
// Each runs through editFile(), only after the four files are closed, in the
// order the main block calls them. A registry that already holds the entry
// is left byte-for-byte as it is.

function addPackageJsonExport(kebab) {
  const key = `./${kebab}`;
  replaceRegistry(
    PACKAGE,
    (source) => {
      const found = inspectPackage(source, kebab);
      requireEditable(found);
      const withSource = insertLast(
        source,
        found.maps[0],
        memberText(key, `./src/${kebab}.tsx`)
      );
      // Offsets after the first insertion moved, so read the result again.
      const publishMap = inspectPackage(withSource, kebab).maps[1];
      return insertLast(
        withSource,
        publishMap,
        memberText(key, {
          types: `./dist/${kebab}.d.ts`,
          default: `./dist/${kebab}.js`,
        })
      );
    },
    (text) => {
      const found = inspectPackage(text, kebab);
      return found.reasons.length === 0 && found.collisions.length === 2;
    }
  );
  console.log(`  ✓ ${PACKAGE} — added export "${key}"`);
}

/**
 * Replaces the TypeScript registry at `path` with `entry` appended to its
 * literal array, read by `inspect`. The result is read again and must list
 * exactly the old elements and then `value`.
 */
function appendToLiteralArray(path, inspect, value, entry, closingIndent) {
  let before;
  replaceRegistry(
    path,
    (source) => {
      const found = inspect(source);
      requireEditable(found);
      before = found.values;
      return appendElement(source, found.array, entry, closingIndent);
    },
    (text) => {
      const after = inspect(text).values;
      return (
        after.length === before.length + 1 &&
        before.every((item, index) => after[index] === item) &&
        after.at(-1) === value
      );
    },
    path === TSUP ? TSUP_SHAPE : UI_SHAPE
  );
}

function addTsupEntry(kebab) {
  appendToLiteralArray(
    TSUP,
    (source) => inspectTsup(source, kebab),
    `src/${kebab}.tsx`,
    `    "src/${kebab}.tsx",`,
    "  "
  );
  console.log(`  ✓ ${TSUP} — added entry`);
}

function addRegistryEntry(kebab) {
  appendToLiteralArray(
    UI_REGISTRY,
    (source) => inspectUi(source, kebab),
    kebab,
    `  {
    name: "${kebab}",
    type: "registry:ui",
    dependencies: [],
    files: [{ path: "ui/${kebab}.tsx", type: "registry:ui" }],
  },`,
    ""
  );
  console.log(`  ✓ ${UI_REGISTRY} — added entry`);
}

/**
 * The demo files as they are now that the four files exist: another process
 * may have added a demo with the new key since the check. These are the
 * inputs for this run's manifest and loader, so they must map the key the
 * new MDX page previews to the demo this run wrote. A demo moved, removed or
 * replaced since its close, or a path gen-demos keys another way, would give
 * a manifest without the page's preview: the run stops before any registry
 * edit instead.
 */
function liveDemoEntries(name) {
  let files;
  try {
    files = demoFiles();
  } catch (error) {
    stopAt(DEMOS, error);
  }
  const duplicates = duplicateDemoKeys(files);
  if (duplicates.length > 0) {
    stop(duplicates);
  }
  const entries = demoEntriesFromPaths(files);
  const key = `${name}-default`;
  const file = `${name}/default.tsx`;
  if (!entries.some((entry) => entry.key === key && entry.file === file)) {
    stop([
      `Stopped at ${DEMOS}/${file} (demo key "${key}" not in the rescan).`,
    ]);
  }
  return entries;
}

/** apps/docs/demos/manifest.json, rendered by gen-demos' own renderer. */
function writeDemoManifest(entries) {
  editFile(`${DEMOS}/manifest.json`, () => renderManifest(entries), {
    generated: true,
  });
}

/** apps/docs/demos/loader.tsx, rendered by gen-demos' own renderer. */
function writeDemoLoader(entries) {
  editFile(`${DEMOS}/loader.tsx`, () => renderLoader(entries), {
    generated: true,
  });
  console.log("  ✓ apps/docs/demos — registry regenerated");
}

function addToComponentsMetaJson(kebab) {
  replaceRegistry(
    META,
    (source) => {
      const found = inspectMeta(source, kebab);
      requireEditable(found);
      return insertLast(source, found.pages, JSON.stringify(kebab));
    },
    (text) => {
      const found = inspectMeta(text, kebab);
      return (
        found.reasons.length === 0 &&
        found.pages.items.filter((item) => item.value === kebab).length === 1
      );
    }
  );
  console.log(`  ✓ ${META} — added "${kebab}"`);
}

// --- Main ---

const rawName = process.argv[2];

if (!rawName) {
  console.log("Usage: pnpm add:component <ComponentName>");
  console.log("");
  console.log("Examples:");
  console.log("  pnpm add:component MyComponent");
  console.log("  pnpm add:component my-component");
  process.exit(1);
}

const kebab = toKebabCase(rawName);
const pascal = toPascalCase(kebab);

validate(kebab);
refuseCollisions(kebab);

console.log(`\nScaffolding component: ${pascal} (${kebab})\n`);

// Create files
console.log("Creating files:");

const [componentFile, storyFile, demoFile, mdxFile] = destinations(kebab);

createFile(componentFile, componentTemplate(pascal, kebab));
console.log(`  ✓ ${componentFile}`);
createFile(storyFile, storyTemplate(pascal, kebab));
console.log(`  ✓ ${storyFile}`);
makeDirectory(DEMOS);
makeDirectory(`${DEMOS}/${kebab}`);
createFile(demoFile, demoTemplate(pascal, kebab));
console.log(`  ✓ ${demoFile}`);
createFile(mdxFile, mdxTemplate(pascal, kebab));
console.log(`  ✓ ${mdxFile}`);

// Registries, only once all four files are closed
console.log("\nUpdating registries:");

const demoEntries = liveDemoEntries(kebab);
addPackageJsonExport(kebab);
addTsupEntry(kebab);
addRegistryEntry(kebab);
writeDemoManifest(demoEntries);
writeDemoLoader(demoEntries);
addToComponentsMetaJson(kebab);

console.log(`
Done! Next steps:

  1. Implement the component in packages/ui/src/${kebab}.tsx
  2. Develop with Storybook:  pnpm dev --filter=@keystoneui/storybook
  3. Add more stories in apps/storybook/stories/${kebab}.stories.tsx
  4. Create additional demos in apps/docs/demos/${kebab}/
  5. Update the MDX docs in apps/docs/content/docs/components/${kebab}.mdx
  6. Run pnpm gen:static-paths, or the new docs and preview URLs answer 404

See CONTRIBUTING.md for the full workflow.
`);
