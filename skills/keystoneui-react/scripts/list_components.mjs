#!/usr/bin/env node
/**
 * List all available Keystone UI components.
 *
 * Usage:
 *   node list_components.mjs
 *
 * Output:
 *   JSON with components array and count
 */

const SITE_URL = process.env.KEYSTONEUI_URL || "https://keystoneui.io";
const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/keystone-ui/react/refs/heads/main";

async function fetchFromLLMsTxt() {
  const url = `${SITE_URL}/llms.txt`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "KeystoneUI-Skill/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return null;
    }

    const content = await response.text();
    const components = [];
    let inComponentsSection = false;

    for (const line of content.split("\n")) {
      if (line.trim() === "### Components") {
        inComponentsSection = true;
        continue;
      }

      if (inComponentsSection && line.trim().startsWith("### ")) {
        break;
      }

      if (inComponentsSection) {
        const match = line.match(
          /^\s*-\s*\[([^\]]+)\]\(https:\/\/keystoneui\.dev\/docs\/components\//
        );
        if (match) {
          components.push(match[1]);
        }
      }
    }

    if (components.length > 0) {
      return {
        components: components.sort(),
        count: components.length,
        source: "llms.txt",
      };
    }

    return null;
  } catch (error) {
    console.error(`# Fetch Error: ${error.message}`);
    return null;
  }
}

async function fetchFromGitHub() {
  const url = `${GITHUB_RAW_BASE}/packages/ui/src/_registry.ts`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "KeystoneUI-Skill/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return null;
    }

    const content = await response.text();
    const components = [];
    const nameRegex = /name:\s*"([^"]+)"/g;
    let match;

    while ((match = nameRegex.exec(content)) !== null) {
      components.push(match[1]);
    }

    if (components.length > 0) {
      console.error("# Using fallback: GitHub _registry.ts");
      return {
        components: components.sort(),
        count: components.length,
        source: "github",
      };
    }

    return null;
  } catch (error) {
    console.error(`# GitHub Fallback Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.error("# Fetching Keystone UI component list...");

  let data = await fetchFromLLMsTxt();

  if (!data) {
    console.error("# llms.txt failed, trying GitHub fallback...");
    data = await fetchFromGitHub();
  }

  if (!data || data.components.length === 0) {
    console.error("Error: Failed to fetch component list");
    process.exit(1);
  }

  console.log(JSON.stringify(data, null, 2));
  console.error(`\n# Found ${data.components.length} components`);
}

main();
