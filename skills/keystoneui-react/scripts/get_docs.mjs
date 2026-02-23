#!/usr/bin/env node
/**
 * Get non-component Keystone UI documentation (guides, theming, installation).
 *
 * Usage:
 *   node get_docs.mjs /docs/theming
 *   node get_docs.mjs /docs/installation/quick-start
 *
 * Output:
 *   MDX documentation content
 *
 * Note: For component docs, use get_component_docs.mjs instead.
 */

const SITE_URL = process.env.KEYSTONEUI_URL || "https://keystoneui.io";

async function fetchDocs(path) {
  let cleanPath = path.replace(/^\//, "");

  if (!cleanPath.endsWith(".mdx")) {
    cleanPath = `${cleanPath}.mdx`;
  }

  const url = `${SITE_URL}/${cleanPath}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "KeystoneUI-Skill/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return {
        error: `HTTP ${response.status}: ${response.statusText}`,
        path,
        url,
      };
    }

    const content = await response.text();
    return { content, path, source: "docs", url };
  } catch (error) {
    return { error: `Fetch Error: ${error.message}`, path };
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node get_docs.mjs <path>");
    console.error("Example: node get_docs.mjs /docs/theming");
    console.error();
    console.error("Available paths include:");
    console.error("  /docs/installation/quick-start");
    console.error("  /docs/installation/registry");
    console.error("  /docs/theming");
    console.error("  /docs/theming/colors");
    console.error("  /docs/theming/dark-mode");
    console.error("  /docs/theming/customization");
    console.error("  /docs/agents/llms-txt");
    console.error();
    console.error(
      "Note: For component docs, use get_component_docs.mjs instead."
    );
    process.exit(1);
  }

  const path = args[0];

  if (path.includes("/components/")) {
    console.error(
      "# Warning: Use get_component_docs.mjs for component documentation."
    );
    const componentName = path.split("/").pop().replace(".mdx", "");
    console.error(`# Example: node get_component_docs.mjs ${componentName}`);
  }

  console.error(`# Fetching documentation for ${path}...`);

  const result = await fetchDocs(path);

  if (result.content) {
    console.log(result.content);
  } else {
    console.error(`# Error: ${result.error}`);
    console.log(JSON.stringify(result, null, 2));
    process.exit(1);
  }
}

main();
