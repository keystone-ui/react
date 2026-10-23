/**
 * scripts/build-skills.sh produces the tarballs the /skills/[skill] route
 * serves. The route prerenders from them, so a run that quietly packaged
 * nothing used to surface only as a 404 after deploy.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = resolve(import.meta.dirname, "../../../scripts/build-skills.sh");
const NO_PACKAGES_BUILT = /no skill packages were built/i;

const created: string[] = [];

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "build-skills-"));
  created.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of created.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function runScript(skillsDir: string, outputDir: string) {
  try {
    const stdout = execFileSync("bash", [SCRIPT], {
      env: { ...process.env, SKILLS_DIR: skillsDir, OUTPUT_DIR: outputDir },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { status: 0, output: stdout };
  } catch (error) {
    const failed = error as { status: number; stdout: string; stderr: string };
    return {
      status: failed.status,
      output: `${failed.stdout}${failed.stderr}`,
    };
  }
}

describe("scripts/build-skills.sh", () => {
  it("packages every directory that has a SKILL.md and skips the rest", () => {
    const skills = tempDir();
    const output = join(tempDir(), "skills");
    mkdirSync(join(skills, "alpha"));
    writeFileSync(join(skills, "alpha", "SKILL.md"), "# alpha\n");
    mkdirSync(join(skills, "notes"));

    const result = runScript(skills, output);

    expect(result.status, result.output).toBe(0);
    const listing = execFileSync(
      "tar",
      ["-tzf", join(output, "alpha.tar.gz")],
      {
        encoding: "utf8",
      }
    );
    expect(listing).toContain("SKILL.md");
    expect(existsSync(join(output, "notes.tar.gz"))).toBe(false);
  });

  it("fails when no skill was packaged", () => {
    const skills = tempDir();
    const output = join(tempDir(), "skills");
    mkdirSync(join(skills, "notes"));

    const result = runScript(skills, output);

    expect(result.status).not.toBe(0);
    expect(result.output).toMatch(NO_PACKAGES_BUILT);
  });
});
