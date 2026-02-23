#!/usr/bin/env node
/**
 * Get complete component documentation (MDX) for Keystone UI components.
 *
 * Usage:
 *   node get_component_docs.mjs button
 *   node get_component_docs.mjs button card select
 *
 * Output:
 *   MDX documentation including imports, usage, variants, props, examples
 */

const SITE_URL = process.env.KEYSTONEUI_URL || "https://keystoneui.io";

function toKebabCase(name) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

async function fetchComponentDocs(component) {
  const kebabName = toKebabCase(component);
  const url = `${SITE_URL}/docs/components/${kebabName}.mdx`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "KeystoneUI-Skill/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return {
        component,
        error: `HTTP ${response.status}: ${response.statusText}`,
        url,
      };
    }

    const content = await response.text();
    return { component, content, url, source: "docs" };
  } catch (error) {
    return { component, error: `Fetch Error: ${error.message}` };
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "Usage: node get_component_docs.mjs <component1> [component2] ..."
    );
    console.error("Example: node get_component_docs.mjs button card");
    process.exit(1);
  }

  console.error(`# Fetching docs for: ${args.join(", ")}...`);

  const results = await Promise.all(args.map(fetchComponentDocs));

  if (results.length === 1) {
    const result = results[0];
    if (result.content) {
      console.log(result.content);
    } else {
      console.error(`# Error for ${result.component}: ${result.error}`);
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    for (const result of results) {
      if (result.content) {
        console.log(`\n${"=".repeat(60)}`);
        console.log(`# ${result.component}`);
        console.log(`${"=".repeat(60)}\n`);
        console.log(result.content);
      } else {
        console.error(`# Error for ${result.component}: ${result.error}`);
      }
    }
  }
}

main();
