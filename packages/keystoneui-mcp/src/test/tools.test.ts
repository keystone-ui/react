import { afterEach, describe, expect, it, vi } from "vitest";
import type { ProjectConfig } from "../config.js";
import {
  getAddCommandSchema,
  getAddCommandTool,
  listComponentsSchema,
  searchComponentsSchema,
  TOOL_SPECS,
  viewComponentSchema,
  viewComponentTool,
} from "../tools.js";

const config: ProjectConfig = { registry: { url: "https://example.test/r" } };

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TOOL_SPECS", () => {
  // server.ts registers from this map and scripts/lint-skill.mjs parses it to
  // check the docs. Both break silently if an entry loses its description, so
  // pin the shape rather than trusting review.
  it("gives every tool a non-empty description", () => {
    for (const [name, spec] of Object.entries(TOOL_SPECS)) {
      expect(spec.description.length, `${name} description`).toBeGreaterThan(
        20
      );
    }
  });

  it("exposes a zod shape for every tool", () => {
    for (const [name, spec] of Object.entries(TOOL_SPECS)) {
      expect(spec.schema.shape, `${name} shape`).toBeDefined();
    }
  });
});

describe("input bounds", () => {
  // view_component fans out one network fetch per name, so its cap is the one
  // that protects the registry.
  it("caps view_component at 5 names", () => {
    expect(
      viewComponentSchema.safeParse({ names: new Array(5).fill("a") }).success
    ).toBe(true);
    expect(
      viewComponentSchema.safeParse({ names: new Array(6).fill("a") }).success
    ).toBe(false);
  });

  // get_add_command only formats strings, so its cap is looser -- but it must
  // exist, or a runaway array builds an unbounded shell command.
  it("bounds get_add_command rather than leaving it open", () => {
    expect(
      getAddCommandSchema.safeParse({ names: new Array(20).fill("a") }).success
    ).toBe(true);
    expect(
      getAddCommandSchema.safeParse({ names: new Array(21).fill("a") }).success
    ).toBe(false);
  });

  it("rejects an empty names array", () => {
    expect(viewComponentSchema.safeParse({ names: [] }).success).toBe(false);
  });

  it("accepts `category` on both search tools", () => {
    expect(
      listComponentsSchema.safeParse({ category: "authentication" }).success
    ).toBe(true);
    expect(
      searchComponentsSchema.safeParse({ category: "login", query: "x" })
        .success
    ).toBe(true);
  });

  it("rejects an unknown item type", () => {
    expect(listComponentsSchema.safeParse({ type: "widget" }).success).toBe(
      false
    );
  });
});

describe("getAddCommandTool", () => {
  it("builds URLs from the configured registry, not a hardcoded host", () => {
    const out = getAddCommandTool(config, { names: ["button", "card"] });
    expect(out).toContain("https://example.test/r/button.json");
    expect(out).toContain("https://example.test/r/card.json");
    expect(out).not.toContain("keystoneui.io");
  });

  it("offers a combined command and one per component", () => {
    const out = getAddCommandTool(config, { names: ["button", "card"] });
    expect(out).toContain(
      "npx shadcn@latest add https://example.test/r/button.json https://example.test/r/card.json"
    );
    expect(out.match(/npx shadcn@latest add/g)).toHaveLength(3);
  });
});

describe("viewComponentTool", () => {
  it("reports a missing component instead of throwing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    );
    const out = await viewComponentTool(config, { names: ["nope"] });
    expect(out).toContain("Not found in registry");
  });

  // One bad name must not lose the others -- the handler fetches concurrently
  // and a rejected promise would otherwise take the whole call down.
  it("keeps good results when one name fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("button")) {
          return Promise.resolve({
            json: () =>
              Promise.resolve({
                description: "A button.",
                files: [{ content: "export const Button = () => null;" }],
                name: "button",
              }),
            ok: true,
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      })
    );
    const out = await viewComponentTool(config, { names: ["button", "nope"] });
    expect(out).toContain("A button.");
    expect(out).toContain("Not found in registry");
  });
});
