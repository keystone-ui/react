/**
 * Pure helpers for scripts/smoke-install.mjs, split out so they can be unit
 * tested without spawning the shadcn CLI.
 */

export const PRODUCTION_REGISTRY = "https://keystoneui.io/r/";

/**
 * Serve the committed registry as if it were production: every
 * `https://keystoneui.io/r/` address inside an item (its registry
 * dependencies) is pointed at the local server, so a smoke run installs this
 * checkout's items and never the deployed ones.
 */
export function rewriteRegistryBody(body, localBase) {
  return body.split(PRODUCTION_REGISTRY).join(localBase);
}

/**
 * The consumer projects an install must work in. Each differs in the one
 * thing that has broken installs before: where files land and how imports
 * resolve.
 */
export const FIXTURES = [
  {
    // Vite / CRA shape: everything under src/, default aliases.
    name: "vite-src",
    srcDir: "src",
    aliases: {
      components: "@/components",
      ui: "@/components/ui",
      utils: "@/lib/utils",
      lib: "@/lib",
      hooks: "@/hooks",
    },
    expectedUiDir: "src/components/ui",
  },
  {
    // Next.js app router shape: no src/, `@/*` maps to the project root.
    name: "next-root",
    srcDir: "",
    aliases: {
      components: "@/components",
      ui: "@/components/ui",
      utils: "@/lib/utils",
      lib: "@/lib",
      hooks: "@/hooks",
    },
    expectedUiDir: "components/ui",
  },
  {
    // A project whose ui alias is not components/ui. Items with a literal
    // `components/ui/<x>.tsx` target ignore the alias.
    name: "custom-ui-alias",
    srcDir: "src",
    aliases: {
      components: "@/components",
      ui: "@/components/kit",
      utils: "@/lib/utils",
      lib: "@/lib",
      hooks: "@/hooks",
    },
    expectedUiDir: "src/components/kit",
  },
];

/** components.json for a fixture. */
export function componentsJson(fixture) {
  const css = fixture.srcDir
    ? `${fixture.srcDir}/index.css`
    : "app/globals.css";
  return {
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: fixture.srcDir === "",
    tsx: true,
    tailwind: {
      config: "",
      css,
      baseColor: "neutral",
      cssVariables: true,
      prefix: "",
    },
    aliases: fixture.aliases,
    iconLibrary: "lucide",
  };
}

/** tsconfig.json for a fixture: strict, bundler resolution, `@/*` alias. */
export function tsconfigJson(fixture) {
  const root = fixture.srcDir ? `./${fixture.srcDir}/*` : "./*";
  return {
    compilerOptions: {
      target: "ES2022",
      lib: ["DOM", "DOM.Iterable", "ES2022"],
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      types: [],
      paths: { "@/*": [root] },
    },
    include: fixture.srcDir
      ? [fixture.srcDir]
      : ["app", "components", "lib", "hooks"],
  };
}

/**
 * Files an install wrote outside the directory the project's ui alias names.
 * A non-empty result means items ignore the consumer's components.json.
 */
export function misplacedUiFiles(writtenFiles, fixture) {
  return writtenFiles.filter(
    (file) =>
      /\/ui\/[^/]+\.tsx$|\/kit\/[^/]+\.tsx$/.test(file) &&
      !file.startsWith(`${fixture.expectedUiDir}/`)
  );
}
