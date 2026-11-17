/**
 * The eager-upload demo keeps an attempt number per file, so a result from
 * an older try (or for a file no longer selected) never overwrites the
 * current one. The demo is copied into apps by the registry, so the rule it
 * teaches is tested here.
 */

import { describe, expect, it } from "vitest";

import { applyResult } from "@/demos/file-upload/eager-upload";

const file = new File(["x"], "report.pdf");

describe("eager-upload demo: applyResult", () => {
  const retrying = [
    {
      id: "upload-1",
      file,
      status: "uploading" as const,
      progress: 0,
      attempt: 2,
    },
  ];

  it("drops a late result from a superseded attempt", () => {
    const next = applyResult(retrying, "upload-1", 1, {
      status: "error",
      error: "Timed out",
    });
    expect(next[0]).toMatchObject({ status: "uploading", attempt: 2 });
    expect(next[0]?.error).toBeUndefined();
  });

  it("applies a result from the current attempt", () => {
    const next = applyResult(retrying, "upload-1", 2, {
      status: "success",
      progress: 100,
    });
    expect(next[0]).toMatchObject({ status: "success", progress: 100 });
  });

  it("ignores a result for a file that was removed", () => {
    expect(applyResult([], "upload-1", 1, { status: "success" })).toEqual([]);
  });
});
