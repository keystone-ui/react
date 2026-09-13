import { afterEach, describe, expect, it } from "vitest";
import { loadProjectConfig, resolveDocsUrl } from "../config.js";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

describe("origin resolution", () => {
  it("defaults both origins to production", () => {
    delete process.env.KEYSTONEUI_URL;
    delete process.env.KEYSTONEUI_REGISTRY_URL;
    const config = loadProjectConfig();
    expect(config.docsUrl).toBe("https://keystoneui.io");
    expect(config.registry.url).toBe("https://keystoneui.io/r");
  });

  // The bug this fixes: the two env vars were independent, so overriding the
  // docs origin left the registry pointed at production and a fixture run
  // silently mixed local docs with live component source.
  it("moves the registry with the docs origin", () => {
    process.env.KEYSTONEUI_URL = "http://localhost:3000";
    const config = loadProjectConfig();
    expect(config.docsUrl).toBe("http://localhost:3000");
    expect(config.registry.url).toBe("http://localhost:3000/r");
  });

  it("still lets the registry be overridden on its own", () => {
    process.env.KEYSTONEUI_URL = "http://localhost:3000";
    process.env.KEYSTONEUI_REGISTRY_URL = "https://private.example/r";
    const config = loadProjectConfig();
    expect(config.docsUrl).toBe("http://localhost:3000");
    expect(config.registry.url).toBe("https://private.example/r");
  });

  it("resolveDocsUrl reads the env var", () => {
    process.env.KEYSTONEUI_URL = "https://staging.example";
    expect(resolveDocsUrl()).toBe("https://staging.example");
  });
});
