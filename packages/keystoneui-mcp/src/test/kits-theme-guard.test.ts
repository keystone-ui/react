/**
 * The whole get_theme_info text for the default registry and a project with
 * no components.json, pinned as it is printed today.
 */
import { afterEach, expect, it, vi } from "vitest";
import { getThemeInfoTool } from "../tools.js";
import { cleanDirs, inDir, projectDir } from "./fixtures.js";

afterEach(() => {
  vi.restoreAllMocks();
  cleanDirs();
});

const TODAY = [
  "# Keystone UI Theme",
  "",
  "## CSS Setup",
  "",
  "Add these to `your global CSS file` -- edit that",
  "file rather than creating a new one, or the tokens will not reach the components.",
  "",
  "```css",
  '@import "tailwindcss";',
  '@import "@keystoneui/react/base.css";',
  "```",
  "",
  "## Semantic Color Tokens (OKLCH)",
  "",
  "| Token | Light | Dark | Usage |",
  "|---|---|---|---|",
  "| `--primary` | `oklch(0.21 0.006 285)` | `oklch(0.92 0.004 286)` | Main actions, CTAs |",
  "| `--secondary` | `oklch(0.967 0.001 286)` | `oklch(0.274 0.006 286)` | Alternative actions |",
  "| `--destructive` | `oklch(0.577 0.245 27)` | `oklch(0.704 0.191 22)` | Destructive actions, a metric that got worse |",
  "| `--success` | `oklch(0.627 0.194 149)` | `oklch(0.723 0.19 150)` | Positive status, a metric that improved |",
  "| `--warning` | `oklch(0.769 0.188 70)` | `oklch(0.828 0.189 84)` | Caution and threshold states only |",
  "| `--info` | `oklch(0.546 0.245 263)` | `oklch(0.707 0.165 255)` | Neutral notices (info Alert, info Toast) |",
  "| `--muted` | `oklch(0.967 0.001 286)` | `oklch(0.274 0.006 286)` | Subdued elements |",
  "| `--accent` | `oklch(0.967 0.001 286)` | `oklch(0.274 0.006 286)` | Highlights |",
  "| `--background` | `oklch(1 0 0)` | `oklch(0.141 0.005 286)` | Page background |",
  "| `--border` | `oklch(0.92 0.004 286)` | `oklch(1 0 0 / 10%)` | Border color |",
  "| `--ring` | `oklch(0.21 0.006 286)` | `oklch(0.92 0.004 286)` | Focus ring |",
  "",
  "## Radius Scale",
  "",
  "Base: `--radius: 0.625rem` (10px). Derived values:",
  "- `rounded-sm`: `--radius * 0.6` (6px)",
  "- `rounded-md`: `--radius * 0.8` (8px)",
  "- `rounded-lg`: `--radius` (10px, base)",
  "- `rounded-xl`: `--radius * 1.4` (14px)",
  "",
  "Ratios, not pixel offsets — the scale stays proportional at any base.",
  "",
  "## Custom Tokens",
  "",
  "- `--input-bg`: Form control background (transparent light, 5% white dark)",
  "- `--popup-ring`: Subtle popup container ring",
  "- `--border-muted`: Lower-contrast separator inside popups, and Card's filled ring",
  "- `--success-foreground` / `--warning-foreground`: Text on a success/warning fill. `--warning-foreground` is dark, not near-white — near-white on amber-500 is ~1.9:1 and fails WCAG",
  "- `--sidebar` + 7 `--sidebar-*`: Read by the sidebar item (`sidebar`) and by an imported shadcn sidebar. Declared as aliases, so the sidebar follows the active keystone theme",
  "",
  "Use `text-success` / `bg-warning` rather than raw `emerald`/`amber` classes, and never add a `dark:` override to a status token.",
  "",
  "## Dark Mode",
  "",
  "Add the `dark` class to a parent element.",
  "",
  "## Registry",
  "",
  "Get the full style definition:",
  "```bash",
  "npx shadcn@latest add https://keystoneui.io/r/default.json",
  "```",
  "",
  "## Custom themes",
  "",
  "The theme builder (https://keystoneui.io/theme-builder) encodes a theme as a code,",
  "`k1_<base>_<L>_<C>_<H>_<radius>_<font>`, served as a `registry:theme` item.",
  "Install one, or only its colours (`?only=theme`) or font (`?only=font`):",
  "```bash",
  "npx shadcn@latest add https://keystoneui.io/r/theme/<code>.json",
  "```",
  "`keystoneui theme <code>` prints the decoded settings and this command.",
].join("\n");

it("get_theme_info on the default registry prints today's text", () => {
  inDir(projectDir({}));
  expect(
    getThemeInfoTool({
      docsUrl: "https://keystoneui.io",
      registry: { url: "https://keystoneui.io/r" },
    })
  ).toBe(TODAY);
});
