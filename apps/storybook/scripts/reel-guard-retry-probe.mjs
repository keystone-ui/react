// Runs the Reel skip-guard retry probe and fails unless it really checked the
// guard.
//
// The companion story asserts it is on Vitest's retry 1 and then calls the
// real skip guard, so the probe proves something only when both stories ran
// in the intended module and the companion passed on exactly retry 1. A name
// filter that matches nothing passes silently, and a filename filter matches
// substrings (an archived copy of the file would run too), so this script
// runs one exact project/module specification and then checks the returned
// cases by display name and by Storybook ID. A Storybook ID is generated from
// the export name, and two exports can generate the same one
// (`RevealOnRoomRestoresCounter` and `Reveal_On_Room_Restores_Counter`), so
// the Storybook index of the module must also bind each ID to exactly one
// export, the expected one.
//
// Run from apps/storybook: `pnpm run probe:reel-retry` (CI runs the same).
import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createVitest } from "vitest/node";

const PROJECT = "storybook (chromium)";
const MODULE_ID = fileURLToPath(
  new URL("../stories/reel.stories.tsx", import.meta.url)
);
const CONFIG_DIR = fileURLToPath(new URL("../.storybook", import.meta.url));

// The one expectation table: the filter, the comparisons and the messages all
// read it. On an intentional rename, update the story in
// stories/reel.stories.tsx and its row here: a `name` change updates `name`,
// an export rename updates `exportName` and `storyId`.
export const ROLES = [
  {
    role: "base",
    exportName: "RevealOnRoom",
    storyId: "components-reel--reveal-on-room",
    name: "Reveal on room",
  },
  {
    role: "companion",
    exportName: "RevealOnRoomRestoresCounter",
    storyId: "components-reel--reveal-on-room-restores-counter",
    name: "Reveal on room restores counter",
  },
];

export const MESSAGES = {
  success: "Both Reel stories passed and the companion passed on retry 1.",
  missing: (name) => `"${name}" did not run with its expected identity.`,
  renamed:
    "If you renamed the story, update its entry in apps/storybook/scripts/reel-guard-retry-probe.mjs.",
  ambiguous: (name) =>
    `"${name}" has ambiguous matches in the target Reel module.`,
  failed: (name) => `"${name}" failed.`,
  retry: (value) =>
    `The Reel companion must pass on retry 1 (observed ${value}).`,
  scope: `Expected exactly one stories/reel.stories.tsx module in ${PROJECT}.`,
  runner: "Vitest failed during the Reel retry probe.",
};

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Reads one field of a Vitest object; a missing or throwing field is undefined. */
function read(get) {
  try {
    return get();
  } catch {}
}

/**
 * The post-run result boundary: plain records read from the reported modules
 * after Vitest has closed. Each test keeps its own `diagnostic` function, so
 * the retry evidence is read at check time.
 */
export function collectRecords(testModules) {
  return testModules.map((module) => ({
    project: read(() => module.project.name),
    moduleId: read(() => module.moduleId),
    errors: read(() => module.errors()) ?? [],
    tests: [...(read(() => module.children.allTests()) ?? [])].map((test) => ({
      project: read(() => test.project.name),
      moduleId: read(() => test.module.moduleId),
      name: read(() => test.name),
      storyId: read(() => test.meta()?.storyId),
      state: read(() => test.result()?.state),
      diagnostic: () => test.diagnostic(),
    })),
  }));
}

/** The companion's retry count as the message shows it. */
function observedRetry(retryCount) {
  return typeof retryCount === "number" && Number.isFinite(retryCount)
    ? retryCount
    : "unknown";
}

/** The lines one role adds: none when its case is identified and passed. */
function checkRole(tests, indexed, expected) {
  const byName = tests.filter((record) => record.name === expected.name);
  const byId = tests.filter((record) => record.storyId === expected.storyId);
  const bindings = indexed.filter((item) => item.id === expected.storyId);
  if (byName.length > 1 || byId.length > 1 || bindings.length > 1) {
    return [MESSAGES.ambiguous(expected.name)];
  }
  const [found] = byName;
  const [binding] = bindings;
  const identified =
    found !== undefined &&
    byId[0] === found &&
    found.project === PROJECT &&
    found.moduleId === MODULE_ID &&
    binding?.exportName === expected.exportName &&
    binding.moduleId === MODULE_ID;
  if (!(identified && (found.state === "passed" || found.state === "failed"))) {
    return [MESSAGES.missing(expected.name), MESSAGES.renamed];
  }
  if (found.state === "failed") {
    return [MESSAGES.failed(expected.name)];
  }
  if (expected.role === "companion") {
    const retryCount = read(() => found.diagnostic()?.retryCount);
    if (retryCount !== 1) {
      return [MESSAGES.retry(observedRetry(retryCount))];
    }
  }
  return [];
}

/**
 * Decides the probe from the boundary records. `modules` is undefined when
 * Vitest failed before selecting the target module; `indexed` holds the
 * Storybook index entries of the Reel module (`{ id, exportName, moduleId }`,
 * duplicates kept) and is undefined when the index could not be read;
 * `runnerErrors` holds startup, indexing, collection, suite, unhandled and
 * teardown errors; `exitCode` is `process.exitCode` after Vitest closed.
 * Returns the lines to print and the exit code (0 only with the success
 * sentence).
 *
 * @param {{
 *   modules?: object[],
 *   indexed?: { id: string, exportName: string, moduleId: string }[],
 *   runnerErrors?: unknown[],
 *   exitCode?: number,
 * }} probe
 * @returns {{ lines: string[], exitCode: number }}
 */
export function checkProbe({ modules, indexed, runnerErrors = [], exitCode }) {
  const errors = [];
  if (modules !== undefined) {
    const targets = modules.filter(
      (module) => module.project === PROJECT && module.moduleId === MODULE_ID
    );
    if (targets.length === 1) {
      const tests = targets[0].tests ?? [];
      errors.push(
        ...ROLES.flatMap((expected) =>
          checkRole(tests, indexed ?? [], expected)
        )
      );
    } else {
      errors.push(MESSAGES.scope);
    }
  }
  const failedStatus = exitCode !== undefined && exitCode !== 0;
  if (
    modules === undefined ||
    indexed === undefined ||
    runnerErrors.length > 0 ||
    failedStatus
  ) {
    errors.push(MESSAGES.runner);
  }
  if (errors.length === 0) {
    return { lines: [MESSAGES.success], exitCode: 0 };
  }
  // A Unix exit status is eight bits (256 reaches the shell as 0), so only
  // 1..255 is forwarded.
  const forwardable =
    Number.isInteger(exitCode) && exitCode >= 1 && exitCode <= 255;
  return { lines: errors, exitCode: forwardable ? exitCode : 1 };
}

/**
 * The Storybook index entries of the Reel module, read per file before the
 * index merges entries that share an ID (it keeps the first of two from one
 * file, which hides a colliding export). Uses the configured indexers, the
 * same as `storybook build`; relative import paths resolve against the
 * working directory, as the index generator's do.
 */
async function readIndexedStories() {
  const { experimental_loadStorybook, StoryIndexGenerator } = await import(
    "storybook/internal/core-server"
  );
  const { normalizeStories } = await import("storybook/internal/common");
  const { presets } = await experimental_loadStorybook({
    configDir: CONFIG_DIR,
  });
  const [indexers, stories, docs, features] = await Promise.all([
    presets.apply("experimental_indexers", []),
    presets.apply("stories", []),
    presets.apply("docs"),
    presets.apply("features"),
  ]);
  const workingDir = process.cwd();
  const generator = new StoryIndexGenerator(
    normalizeStories(stories, { configDir: CONFIG_DIR, workingDir }),
    { configDir: CONFIG_DIR, workingDir, indexers, docs, build: {}, features }
  );
  await generator.initialize();
  // Throws on an indexing error, as `storybook build` would.
  await generator.getIndex();
  const indexed = [];
  for (const files of generator.specifierToCache.values()) {
    for (const cached of Object.values(files)) {
      for (const indexEntry of cached?.entries ?? []) {
        const moduleId = resolve(workingDir, indexEntry.importPath);
        if (indexEntry.type === "story" && moduleId === MODULE_ID) {
          indexed.push({
            id: indexEntry.id,
            exportName: indexEntry.exportName,
            moduleId,
          });
        }
      }
    }
  }
  return indexed;
}

function describeError(error) {
  if (error instanceof Error) {
    return error.stack ?? `${error.name}: ${error.message}`;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.stack ?? error.message);
  }
  return String(error);
}

async function main() {
  const runnerErrors = [];
  let vitest;
  let ran = false;
  let modules;
  let indexed;
  // What `startVitest` sets before creating Vitest; the Storybook plugin adds
  // the story files to the project only when `VITEST` is set.
  process.env.TEST = "true";
  process.env.VITEST = "true";
  process.env.NODE_ENV ??= "test";
  try {
    vitest = await createVitest("test", {
      run: true,
      watch: false,
      maxWorkers: 4,
      mode: "reel-guard-retry",
      retry: 1,
      testNamePattern: `^(${ROLES.map((r) => escapeRegExp(r.name)).join("|")})$`,
    });
    await vitest.standalone();
    const specifications = (
      await vitest.getRelevantTestSpecifications()
    ).filter(
      (spec) => spec.project.name === PROJECT && spec.moduleId === MODULE_ID
    );
    if (specifications.length === 1) {
      ran = true;
      await vitest.runTestSpecifications(specifications);
    } else {
      modules = [];
    }
  } catch (error) {
    runnerErrors.push(error);
  } finally {
    if (vitest) {
      try {
        await vitest.close();
      } catch (error) {
        runnerErrors.push(error);
      }
    }
  }

  if (vitest && ran) {
    runnerErrors.push(...vitest.state.getUnhandledErrors());
    modules = collectRecords(vitest.state.getTestModules());
    for (const module of modules) {
      runnerErrors.push(...module.errors);
    }
  }

  try {
    indexed = await readIndexedStories();
  } catch (error) {
    runnerErrors.push(error);
  }

  const exitCode =
    process.exitCode === undefined || process.exitCode === ""
      ? undefined
      : Number(process.exitCode);
  const result = checkProbe({ modules, indexed, runnerErrors, exitCode });
  if (result.exitCode === 0) {
    console.log(`\n${result.lines.join("\n")}`);
  } else {
    for (const error of runnerErrors) {
      console.error(describeError(error));
    }
    console.error(`\n${result.lines.join("\n")}`);
  }
  process.exitCode = result.exitCode;
}

// Run unless imported (the acceptance harness imports `checkProbe`). Both
// sides are real paths: a script started through a symlinked path must still
// run, never exit 0 having checked nothing.
const entry = process.argv[1] ? realpathSync(process.argv[1]) : undefined;
if (entry === realpathSync(fileURLToPath(import.meta.url))) {
  await main();
}
