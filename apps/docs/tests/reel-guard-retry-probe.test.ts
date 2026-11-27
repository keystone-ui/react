/**
 * The decision half of apps/storybook/scripts/reel-guard-retry-probe.mjs.
 * The script itself starts Vitest with the Storybook browser project, which
 * is too slow for this suite; CI runs it as its own step
 * (`pnpm run probe:reel-retry` in apps/storybook).
 *
 * Every row hands `checkProbe` the plain records the script reads after
 * Vitest closes: the run's modules and the Storybook index entries of the
 * Reel stories file.
 */

import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  checkProbe,
  MESSAGES,
} from "../../storybook/scripts/reel-guard-retry-probe.mjs";

const PROJECT = "storybook (chromium)";
const MODULE_ID = resolve(
  import.meta.dirname,
  "../../storybook/stories/reel.stories.tsx"
);

const BASE = {
  id: "components-reel--reveal-on-room",
  name: "Reveal on room",
  exportName: "RevealOnRoom",
};
const COMPANION = {
  id: "components-reel--reveal-on-room-restores-counter",
  name: "Reveal on room restores counter",
  exportName: "RevealOnRoomRestoresCounter",
};

function test(story: { id: string; name: string }, retryCount: number) {
  return {
    project: PROJECT,
    moduleId: MODULE_ID,
    name: story.name,
    storyId: story.id,
    state: "passed",
    diagnostic: () => ({ retryCount }),
  };
}

/** A run in which both stories passed and the companion passed on retry 1. */
function healthyModules() {
  return [
    {
      project: PROJECT,
      moduleId: MODULE_ID,
      errors: [],
      tests: [test(BASE, 0), test(COMPANION, 1)],
    },
  ];
}

function entry(
  story: { id: string; exportName: string },
  moduleId = MODULE_ID
) {
  return { id: story.id, exportName: story.exportName, moduleId };
}

const healthyIndex = () => [entry(BASE), entry(COMPANION)];

describe("reel guard retry probe", () => {
  it("passes a healthy run whose index binds each ID to its export", () => {
    const result = checkProbe({
      modules: healthyModules(),
      indexed: healthyIndex(),
    });
    expect(result).toEqual({ lines: [MESSAGES.success], exitCode: 0 });
  });

  describe("verifies the raw export name through the Storybook index", () => {
    // `Reveal_On_Room_Restores_Counter` generates the companion's ID. With
    // the real export in `excludeStories`, it is the only binding left and
    // its play passes on retry 1 without calling the guard.
    it("fails when a colliding export holds the companion's ID", () => {
      const result = checkProbe({
        modules: healthyModules(),
        indexed: [
          entry(BASE),
          entry({
            ...COMPANION,
            exportName: "Reveal_On_Room_Restores_Counter",
          }),
        ],
      });
      expect(result.exitCode).toBe(1);
      expect(result.lines).toContain(MESSAGES.missing(COMPANION.name));
      expect(result.lines).not.toContain(MESSAGES.success);
    });

    // With the real export tagged `!test`, both exports are indexed under
    // the one ID (the merged index keeps only the first).
    it("fails when two exports share the companion's ID", () => {
      const result = checkProbe({
        modules: healthyModules(),
        indexed: [
          entry(BASE),
          entry(COMPANION),
          entry({
            ...COMPANION,
            exportName: "Reveal_On_Room_Restores_Counter",
          }),
        ],
      });
      expect(result.exitCode).toBe(1);
      expect(result.lines).toContain(MESSAGES.ambiguous(COMPANION.name));
    });

    it("fails when the indexed export lives in another module", () => {
      const result = checkProbe({
        modules: healthyModules(),
        indexed: [entry(BASE), entry(COMPANION, `${MODULE_ID}.archive.tsx`)],
      });
      expect(result.exitCode).toBe(1);
      expect(result.lines).toContain(MESSAGES.missing(COMPANION.name));
    });

    it("fails when the index could not be read", () => {
      const result = checkProbe({ modules: healthyModules() });
      expect(result.exitCode).toBe(1);
      expect(result.lines).toContain(MESSAGES.runner);
      expect(result.lines).not.toContain(MESSAGES.success);
    });
  });

  describe("forwards only a status the shell can see", () => {
    // A Unix exit status is eight bits: 256 reaches the shell as 0.
    it.each([256, 512, -1, 1.5, Number.NaN])(
      "exits 1 for status %s",
      (status) => {
        const result = checkProbe({
          modules: healthyModules(),
          indexed: healthyIndex(),
          exitCode: status,
        });
        expect(result.lines).toContain(MESSAGES.runner);
        expect(result.exitCode).toBe(1);
      }
    );

    it.each([1, 7, 255])("forwards status %s", (status) => {
      const result = checkProbe({
        modules: healthyModules(),
        indexed: healthyIndex(),
        exitCode: status,
      });
      expect(result.exitCode).toBe(status);
    });

    it("exits 1 for a missing role under status 256", () => {
      const result = checkProbe({
        modules: [{ ...healthyModules()[0], tests: [test(BASE, 0)] }],
        indexed: healthyIndex(),
        exitCode: 256,
      });
      expect(result.lines).toContain(MESSAGES.missing(COMPANION.name));
      expect(result.exitCode).toBe(1);
    });
  });
});
