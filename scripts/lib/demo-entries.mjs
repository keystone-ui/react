/**
 * Derives demo registry entries from paths under `apps/docs/demos`.
 *
 *   <component>/<variant>.tsx   → key "<component>-<variant>"
 *   blocks/<name>.tsx           → key "block-<name>"
 *   blocks/<name>/index.tsx     → key "block-<name>"; the block's sibling
 *                                 files are its own parts, not demos
 *
 * Pure: takes relative POSIX paths, returns `{ key, file }` sorted by key.
 * Shared by the generator and its tests.
 */

const TSX = /\.tsx$/;

/**
 * @param {readonly string[]} paths  Paths relative to the demos directory.
 * @returns {{ key: string, file: string }[]}
 */
export function demoEntriesFromPaths(paths) {
  const byKey = new Map();

  for (const file of paths) {
    if (!TSX.test(file)) {
      continue;
    }
    const segments = file.split("/");
    let key;
    if (segments[0] === "blocks") {
      if (segments.length === 2) {
        key = `block-${segments[1].replace(TSX, "")}`;
      } else if (segments.length === 3 && segments[2] === "index.tsx") {
        key = `block-${segments[1]}`;
      } else {
        continue;
      }
    } else if (segments.length === 2) {
      key = `${segments[0]}-${segments[1].replace(TSX, "")}`;
    } else {
      continue;
    }

    const existing = byKey.get(key);
    if (existing) {
      throw new Error(
        `demo key "${key}" is produced by both ${existing} and ${file}`
      );
    }
    byKey.set(key, file);
  }

  return [...byKey.entries()]
    .sort(([a], [b]) => compareKeys(a, b))
    .map(([key, file]) => ({ key, file }));
}

/** Code-point order, not `localeCompare`: output must not vary by machine. */
function compareKeys(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}
