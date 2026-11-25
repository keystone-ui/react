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

import { randomBytes } from "node:crypto";
import {
  closeSync,
  constants,
  fchmodSync,
  fchownSync,
  fstatSync,
  ftruncateSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
  renameSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import { basename, dirname, join, relative } from "node:path";

import { renderLoader, renderManifest } from "./gen-demos.mjs";
import { demoEntriesFromPaths } from "./lib/demo-entries.mjs";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const UI_DIR = join(ROOT, "packages/ui");

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

/**
 * Everything the scaffold would create or add that is already there, one
 * line each. Runs before the first write: a single collision means nothing
 * is written, so a contributor's existing story, demo or page survives.
 */
function findCollisions(name) {
  const collisions = [];

  for (const path of destinations(name)) {
    if (statOrNull(join(ROOT, path))) {
      collisions.push(path);
    }
  }
  const demoDir = `apps/docs/demos/${name}`;
  const demoDirStat = statOrNull(join(ROOT, demoDir));
  if (demoDirStat && !demoDirStat.isDirectory()) {
    collisions.push(`${demoDir} (exists and is not a directory)`);
  }

  collisions.push(
    ...duplicateDemoKeys([...demoFiles(), `${name}/default.tsx`])
  );

  collisions.push(
    ...readRegistry(PACKAGE, (tree) => inspectPackage(tree, name))
  );

  const tsup = readFileSync(join(UI_DIR, "tsup.config.ts"), "utf-8");
  if (tsup.includes(`"src/${name}.tsx"`)) {
    collisions.push(`packages/ui/tsup.config.ts: entry "src/${name}.tsx"`);
  }

  const registry = readFileSync(join(UI_DIR, "src/_registry.ts"), "utf-8");
  if (registry.includes(`name: "${name}"`)) {
    collisions.push(`packages/ui/src/_registry.ts: entry name: "${name}"`);
  }

  collisions.push(...readRegistry(META, (tree) => inspectMeta(tree, name)));

  return collisions;
}

const DEMOS = "apps/docs/demos";
const PACKAGE = "packages/ui/package.json";
const META = "apps/docs/content/docs/components/meta.json";

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

/** Registry bytes as text. Bytes that are not UTF-8 are not JSON. */
function decodeRegistry(bytes) {
  try {
    return UTF8.decode(bytes);
  } catch (error) {
    throw new RegistryShapeError("invalid JSON", { cause: error });
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

function member(node, key) {
  return node?.type === "object" ? node.members.get(key) : undefined;
}

/**
 * Both export maps of packages/ui/package.json, each checked on its own: a
 * map that is not an object gives its reason, and the other map's collision
 * is still reported. A key counts as taken even when it holds `null`.
 */
function inspectPackage(tree, name) {
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
function inspectMeta(tree, name) {
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

/** Opens a registry without following a symlink at its path. */
function openRegistry(path, flags) {
  try {
    return openSync(join(ROOT, path), noFollow(flags));
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
 * Preflight read of one JSON registry: the lines naming why it, or a part of
 * it, cannot be read, beside the collisions it can still show, so the other
 * registries are checked and listed too.
 */
function readRegistry(path, inspect) {
  let found;
  try {
    const fd = openRegistry(path, constants.O_RDONLY);
    let bytes;
    try {
      bytes = readToEnd(fd);
    } finally {
      closeSync(fd);
    }
    found = inspect(parseRegistryJson(decodeRegistry(bytes)));
  } catch (error) {
    if (error instanceof RegistryShapeError) {
      return [`Stopped at ${path} (${error.message}).`];
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
// at any moment, and a write or a cut through the scaffold's descriptor
// would land on top of that save. Instead:
//
//  1. Read: open the regular file without following a symlink, pin its
//     identity and bytes, and compute the edit from those bytes.
//  2. Stage: write the result to a new sibling file only this run created.
//  3. Publish: check the registry and the staging file are both still what
//     this run saw and wrote, then rename the staging file over the
//     registry. The rename is the last thing this run does to the registry.
//
// Usable by any registry whose edit is a function of its text.

const fsError = (code) => Object.assign(new Error(code), { code });
/** open(2) flags that refuse a symlink at the final path component. */
function noFollow(flags) {
  // biome-ignore lint/suspicious/noBitwiseOperators: open(2) flags are a bit set
  return flags | constants.O_NOFOLLOW;
}

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

/** Step 1: the open, regular registry with its pinned identity and bytes. */
function pinRegistry(path) {
  const fd = openRegistry(path, constants.O_RDWR);
  try {
    const stat = fstatSync(fd, { bigint: true });
    if (!stat.isFile()) {
      throw new Error("not a regular file");
    }
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

/** Step 2a: an exclusive, private sibling of the registry. */
function createStaging(path) {
  const name = `${dirname(path)}/.${basename(path)}.${randomBytes(8).toString("hex")}.tmp`;
  const fd = openSync(join(ROOT, name), "wx", 0o600);
  const stat = fstatSync(fd, { bigint: true });
  return {
    path: name,
    fd,
    dev: stat.dev,
    ino: stat.ino,
    mode: 0o600n,
    written: 0,
  };
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
      candidate.length - staging.written,
      staging.written
    );
    if (count === 0) {
      throw fsError("EIO");
    }
    staging.written += count;
  }
  const own = fstatSync(staging.fd, { bigint: true });
  if (own.uid !== pinned.uid || own.gid !== pinned.gid) {
    fchownSync(staging.fd, Number(pinned.uid), Number(pinned.gid));
  }
  fchmodSync(staging.fd, Number(permissionBits(pinned.mode)));
  staging.mode = permissionBits(pinned.mode);
  closeSync(staging.fd);
  staging.fd = undefined;
}

/**
 * The staging file as it is now, if it is still the one this run created
 * holding exactly `expected` with the permissions this run gave it.
 */
function stagingIntact(staging, expected, owner) {
  let fd;
  try {
    fd = openSync(join(ROOT, staging.path), noFollow(constants.O_RDONLY));
    const stat = fstatSync(fd, { bigint: true });
    return (
      stat.dev === staging.dev &&
      stat.ino === staging.ino &&
      permissionBits(stat.mode) === staging.mode &&
      (owner === undefined ||
        (stat.uid === owner.uid && stat.gid === owner.gid)) &&
      readToEnd(fd).equals(expected)
    );
  } catch {
    return false;
  } finally {
    if (fd !== undefined) {
      closeQuietly(fd);
    }
  }
}

/**
 * After a stop: remove the staging file only if it is still this run's,
 * unmodified. Otherwise leave it and list it with the paths this run
 * created, for the person to look at.
 */
function releaseStaging(staging, candidate) {
  if (staging.fd !== undefined) {
    closeQuietly(staging.fd);
    staging.fd = undefined;
  }
  if (stagingIntact(staging, candidate.subarray(0, staging.written))) {
    try {
      unlinkSync(join(ROOT, staging.path));
      return;
    } catch {
      // Unremovable: reported below.
    }
  }
  created.push(staging.path);
}

/**
 * Replaces the registry at `path` with `change(text)`, by the three steps
 * above. `change` throws a RegistryShapeError to refuse; a refusal is only
 * reported once the registry is known not to have changed since the read,
 * since a refusal of bytes someone has already replaced would be wrong.
 */
function replaceRegistry(path, change) {
  let source;
  let staging;
  let candidate;
  try {
    source = pinRegistry(path);
    try {
      candidate = Buffer.from(change(decodeRegistry(source.bytes)));
    } catch (error) {
      if (error instanceof RegistryShapeError) {
        verifyJsonSnapshot(path, source.fd, source);
      }
      throw error;
    }
    staging = createStaging(path);
    fillStaging(staging, candidate, source.pinned);
    verifyJsonSnapshot(path, source.fd, source);
    if (!stagingIntact(staging, candidate, source.pinned)) {
      throw new RegistryShapeError("staging file changed");
    }
    closeSync(source.fd);
    source.fd = undefined;
    renameSync(join(ROOT, staging.path), join(ROOT, path));
  } catch (error) {
    if (source?.fd !== undefined) {
      closeQuietly(source.fd);
    }
    if (staging) {
      releaseStaging(staging, candidate);
    }
    stopAt(path, error);
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
 * Rewrites a registry file through one descriptor: read it, apply `change`,
 * write back only if the bytes differ. A generated output that is absent is
 * created exclusively instead. Returns whether the file changed. The JSON
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
    if (!fstatSync(fd).isFile()) {
      throw new Error("not a regular file");
    }
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
    stopAt(path, error);
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
  replaceRegistry(PACKAGE, (source) => {
    const found = inspectPackage(parseRegistryJson(source), kebab);
    requireEditable(found);
    const withSource = insertLast(
      source,
      found.maps[0],
      memberText(key, `./src/${kebab}.tsx`)
    );
    // Offsets after the first insertion moved, so read the result again.
    const publishMap = inspectPackage(parseRegistryJson(withSource), kebab)
      .maps[1];
    return insertLast(
      withSource,
      publishMap,
      memberText(key, {
        types: `./dist/${kebab}.d.ts`,
        default: `./dist/${kebab}.js`,
      })
    );
  });
  console.log(`  ✓ ${PACKAGE} — added export "${key}"`);
}

function addTsupEntry(kebab) {
  const entry = `"src/${kebab}.tsx"`;
  const added = editFile("packages/ui/tsup.config.ts", (source) => {
    if (source.includes(entry)) {
      return source;
    }
    // Append before the closing bracket of the entryPoints array. Anchoring
    // on a particular last entry broke silently once `src/utils.ts` stopped
    // being last: the replace matched nothing and the script still reported
    // success, shipping an export that `tsup` never built.
    const updated = source.replace(
      /(entryPoints:\s*\[[\s\S]*?)(\n\s*\],)/,
      `$1\n    ${entry},$2`
    );
    if (updated === source) {
      throw new Error("could not find the entryPoints array");
    }
    return updated;
  });
  console.log(
    added
      ? "  ✓ packages/ui/tsup.config.ts — added entry"
      : "  ⊘ tsup.config.ts entry already exists"
  );
}

function addRegistryEntry(kebab) {
  const added = editFile("packages/ui/src/_registry.ts", (source) => {
    if (source.includes(`name: "${kebab}"`)) {
      return source;
    }
    const entry = `  {
    name: "${kebab}",
    type: "registry:ui",
    dependencies: [],
    files: [{ path: "ui/${kebab}.tsx", type: "registry:ui" }],
  },`;
    // Insert before the closing ];
    return source.replace(/\n];/, `\n${entry}\n];`);
  });
  console.log(
    added
      ? "  ✓ packages/ui/src/_registry.ts — added entry"
      : "  ⊘ _registry.ts entry already exists"
  );
}

/**
 * The demo files as they are now that the four files exist: another process
 * may have added a demo with the new key since the check. These are the
 * inputs for this run's manifest and loader.
 */
function liveDemoEntries() {
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
  return demoEntriesFromPaths(files);
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
  replaceRegistry(META, (source) => {
    const found = inspectMeta(parseRegistryJson(source), kebab);
    requireEditable(found);
    return insertLast(source, found.pages, JSON.stringify(kebab));
  });
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

const demoEntries = liveDemoEntries();
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
