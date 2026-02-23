#!/usr/bin/env node
/**
 * Get React/TypeScript source code for Keystone UI components.
 *
 * Usage:
 *   node get_source.mjs button
 *   node get_source.mjs button accordion card
 *
 * Output:
 *   Full TSX source code with GitHub URL for each component
 */

const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/keystone-ui/react/refs/heads/main";
const GITHUB_BLOB_BASE = "https://github.com/keystone-ui/react/blob/main";

function toKebabCase(name) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

async function fetchSource(component) {
  const kebabName = toKebabCase(component);
  const filePath = `packages/ui/src/${kebabName}.tsx`;
  const url = `${GITHUB_RAW_BASE}/${filePath}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "KeystoneUI-Skill/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return {
        component,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const sourceCode = await response.text();
    return {
      component,
      filePath,
      githubUrl: `${GITHUB_BLOB_BASE}/${filePath}`,
      sourceCode,
    };
  } catch (error) {
    return { component, error: `Fetch Error: ${error.message}` };
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node get_source.mjs <component1> [component2] ...");
    console.error("Example: node get_source.mjs button accordion");
    process.exit(1);
  }

  console.error(`# Fetching source code for: ${args.join(", ")}...`);

  const results = await Promise.all(args.map(fetchSource));

  if (results.length === 1) {
    const result = results[0];
    if (result.sourceCode) {
      console.log(`// File: ${result.filePath}`);
      console.log(`// GitHub: ${result.githubUrl}`);
      console.log();
      console.log(result.sourceCode);
    } else {
      console.error(`# Error: ${result.error}`);
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    for (const result of results) {
      if (result.sourceCode) {
        console.log(`\n// ${"=".repeat(58)}`);
        console.log(`// File: ${result.filePath}`);
        console.log(`// GitHub: ${result.githubUrl}`);
        console.log(`// ${"=".repeat(58)}\n`);
        console.log(result.sourceCode);
      } else {
        console.error(`# Error for ${result.component}: ${result.error}`);
      }
    }
  }
}

main();
