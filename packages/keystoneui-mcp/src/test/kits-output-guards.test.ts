/**
 * Whole-output guards for surfaces the render helpers now pass through:
 * audit_checklist in both install modes, the CLI `theme` verb and the CLI
 * `info` text, as printed today for ordinary project values.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { runCli } from "../cli.js";
import { auditChecklistTool } from "../tools.js";
import {
  captureConsole,
  cleanDirs,
  inDir,
  PACKAGE_PROJECT,
  projectDir,
  REGISTRY_PROJECT,
} from "./fixtures.js";

const VERSION = (
  JSON.parse(
    readFileSync(join(import.meta.dirname, "../../package.json"), "utf-8")
  ) as { version: string }
).version;
const env = { ...process.env };

beforeEach(() => {
  delete process.env.KEYSTONEUI_URL;
  delete process.env.KEYSTONEUI_REGISTRY_URL;
});

afterEach(() => {
  process.env = { ...env };
  vi.restoreAllMocks();
  cleanDirs();
});

const AUDIT_REGISTRY = [
  "# Post-Install Audit Checklist",
  "",
  "## 1. CSS Setup (`app/globals.css`)",
  '- [ ] `@import "tailwindcss"` is present in `app/globals.css`',
  '- [ ] `@import "@keystoneui/react/base.css"` is imported AFTER tailwindcss',
  "- [ ] Dark mode variant is configured: `@custom-variant dark (&:is(.dark *))`",
  "",
  "## 2. Tailwind Configuration",
  "- [ ] Using Tailwind CSS v4.1+",
  "- [ ] Content paths include your component files",
  "",
  "## 3. Dependencies",
  "- [ ] `@keystoneui/react` is installed",
  "- [ ] Component-specific peer dependencies are installed (check each component's `dependencies` field)",
  "- [ ] Using React 19+",
  "",
  "## 4. Import Pattern (install mode: registry)",
  '- [ ] Importing from the project alias: `import { Button } from "@/components/ui/button"`',
  "- [ ] NOT importing from `@keystoneui/react` -- it is not a dependency in this project",
  "",
  "## 5. Theme Variables",
  "- [ ] CSS custom properties are defined in `:root` (see `get_theme_info` for the full list)",
  "- [ ] Dark mode variables are defined in `.dark` selector",
  "",
  "## 6. Icon Library",
  "- [ ] Using `lucide-react` for icons, matching this project's configured icon library",
  "",
  "## 7. Common Issues",
  '- [ ] If hover styles feel "sticky" on mobile: ensure `base.css` is imported (it gates `hover:` with `@media (hover: hover)`)',
  "- [ ] If buttons don't show pointer cursor: Tailwind v4 changed the default — Keystone UI handles this internally",
  "- [ ] If focus rings look wrong: don't mix outline-based and ring-based focus patterns",
].join("\n");

const AUDIT_PACKAGE = [
  "# Post-Install Audit Checklist",
  "",
  "## 1. CSS Setup (`your CSS entry point`)",
  '- [ ] `@import "tailwindcss"` is present in `your CSS entry point`',
  '- [ ] `@import "@keystoneui/react/base.css"` is imported AFTER tailwindcss',
  "- [ ] Dark mode variant is configured: `@custom-variant dark (&:is(.dark *))`",
  "",
  "## 2. Tailwind Configuration",
  "- [ ] Using Tailwind CSS v4.1+",
  "- [ ] Content paths include your component files",
  "",
  "## 3. Dependencies",
  "- [ ] `@keystoneui/react` is installed",
  "- [ ] Component-specific peer dependencies are installed (check each component's `dependencies` field)",
  "- [ ] Using React 19+",
  "",
  "## 4. Import Pattern (install mode: package)",
  '- [ ] Using subpath imports: `import { Button } from "@keystoneui/react/button"`',
  "- [ ] NOT using barrel imports from `@keystoneui/react`",
  "",
  "## 5. Theme Variables",
  "- [ ] CSS custom properties are defined in `:root` (see `get_theme_info` for the full list)",
  "- [ ] Dark mode variables are defined in `.dark` selector",
  "",
  "## 6. Icon Library",
  "- [ ] Using `lucide-react` for icons, matching this project's configured icon library",
  "",
  "## 7. Common Issues",
  '- [ ] If hover styles feel "sticky" on mobile: ensure `base.css` is imported (it gates `hover:` with `@media (hover: hover)`)',
  "- [ ] If buttons don't show pointer cursor: Tailwind v4 changed the default — Keystone UI handles this internally",
  "- [ ] If focus rings look wrong: don't mix outline-based and ring-based focus patterns",
].join("\n");

const THEME = [
  "Theme k1_slate_0.55_0.2_262.5_large_inter",
  "  base slate · primary oklch(0.55 0.2 262.5) · radius large · font inter",
  "",
  "Install (writes the tokens into your global CSS):",
  "  npx shadcn@latest add https://keystoneui.io/r/theme/k1_slate_0.55_0.2_262.5_large_inter.json",
  "",
  "Edit: https://keystoneui.io/theme-builder?base=slate&primaryL=0.55&primaryC=0.2&primaryH=262.5&radius=large&font=inter",
].join("\n");

it("audit_checklist in a registry-mode project prints today's text", () => {
  inDir(projectDir(REGISTRY_PROJECT));
  expect(auditChecklistTool()).toBe(AUDIT_REGISTRY);
});

it("audit_checklist in a package-mode project prints today's text", () => {
  inDir(projectDir(PACKAGE_PROJECT));
  expect(auditChecklistTool()).toBe(AUDIT_PACKAGE);
});

it("the theme verb prints today's text", async () => {
  inDir(projectDir({}));
  const io = captureConsole();
  await runCli(["theme", "k1_slate_0.55_0.2_262.5_large_inter"]);
  expect(io.stdout).toBe(THEME);
  expect(io.stderr).toBe("");
});

it("the info text prints today's text", async () => {
  const dir = projectDir(REGISTRY_PROJECT);
  inDir(dir);
  // No client config under the home folder either.
  process.env.HOME = dir;
  const io = captureConsole();
  await runCli(["info"]);
  expect(io.stdout).toBe(
    [
      `@keystoneui/mcp v${VERSION}`,
      "",
      "Project",
      "  Install mode      registry",
      "  UI alias          @/components/ui",
      "  Theme CSS         app/globals.css",
      "  Icon library      (unknown)",
      "  RSC               (unknown)",
      "  Package manager   (unknown)",
      "",
      "Environment",
      `  Node              ${process.version}`,
      `  Platform          ${process.platform}`,
      `  Project root      ${dir}`,
      "  Registry URL      https://keystoneui.io/r",
      "  Docs URL          https://keystoneui.io",
      "",
      "MCP clients",
      "  (none configured for keystoneui)",
      "",
      "Installed @keystoneui packages",
      "  (none detected in this project)",
      "",
      "Links",
      "  Docs              https://keystoneui.io",
      "  Registry          https://keystoneui.io/r/registry.json",
      "  llms.txt          https://keystoneui.io/llms.txt",
    ].join("\n")
  );
});
