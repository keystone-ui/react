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

/**
 * Items whose name starts with this are the package flavour of an item: their
 * files import `@keystoneui/react/*` and ship no ui components, so they only
 * work in an app that depends on the package, and the vendored fixtures above
 * (which link no `@keystoneui/react`) cannot typecheck them.
 */
export const PACKAGE_PREFIX = "npm/";

/** "recharts@^3" -> "recharts". */
const VERSION_RANGE = /(?<=.)@.*$/;

/**
 * Apps that use the npm package: no `components/ui`, no `lib/utils.ts`, and
 * the smallest `components.json` shadcn accepts, plus `rsc` in Next (see
 * packageComponentsJson). Next gets a `registry:page`; shadcn skips it in
 * Vite.
 */
export const PACKAGE_FIXTURES = [
  { name: "package-next", srcDir: "", flavour: "package", framework: "next" },
  {
    name: "package-vite",
    srcDir: "src",
    flavour: "package",
    framework: "vite",
  },
];

/**
 * The components.json the docs tell a package consumer to write by hand.
 * shadcn 4.21–4.23 rejects a file without `style`, `tailwind.css` or
 * `tailwind.baseColor` ("Invalid configuration"); with no file at all, `add`
 * runs `init`, which rewrites the app's CSS with shadcn's own theme.
 */
export function packageComponentsJson(fixture) {
  return {
    style: "new-york",
    // A Next App Router app keeps `"use client"` boundaries with `rsc: true`.
    ...(fixture.framework === "next" ? { rsc: true } : {}),
    tailwind: {
      css: fixture.srcDir ? `${fixture.srcDir}/index.css` : "app/globals.css",
      baseColor: "neutral",
    },
    aliases: { components: "@/components", utils: "@/lib/utils" },
  };
}

/** The fixtures a group installs into. */
export function fixturesFor(group) {
  return group.flavour === "package" ? PACKAGE_FIXTURES : FIXTURES;
}

/**
 * ui items install together, as an app that adds components one by one ends
 * up with all of them. Each block installs alone into its own project:
 * blocks share file names (admin-01 and dashboard-01 both ship chart.tsx),
 * and nobody installs every block into one app. Each package-flavour item
 * installs alone too, into the package fixtures only: it writes the same
 * file names as its vendored twin, with different imports.
 */
export function installGroups(registry, names) {
  const byName = new Map(registry.items.map((i) => [i.name, i]));
  const isPackage = (n) => n.startsWith(PACKAGE_PREFIX);
  const isBlock = (n) => byName.get(n)?.type === "registry:block";
  const ui = names.filter((n) => !(isPackage(n) || isBlock(n)));
  const blocks = names.filter((n) => !isPackage(n) && isBlock(n));
  const packages = names.filter(isPackage);
  return [
    ...(ui.length > 0 ? [{ flavour: "vendored", label: "ui", items: ui }] : []),
    ...blocks.map((name) => ({
      flavour: "vendored",
      label: name,
      items: [name],
    })),
    ...packages.map((name) => ({
      flavour: "package",
      label: name.replace("/", "-"),
      items: [name],
    })),
  ];
}

/**
 * Every file a package-flavour install must write, relative to the fixture:
 * each component flat in `components/`, and the page at its target in Next.
 */
export function expectedPackageFiles(item, fixture) {
  return (item.files ?? [])
    .map((file) => installedPath(file, fixture))
    .filter((path) => path !== null)
    .sort();
}

/**
 * Where an item file lands in a package fixture: flat in the components
 * alias's directory, or at its target for a page, which shadcn writes only
 * into a Next app (null elsewhere).
 */
export function installedPath(file, fixture) {
  if (file.type === "registry:page") {
    return fixture.framework === "next" ? file.target : null;
  }
  const components = fixture.srcDir
    ? `${fixture.srcDir}/components`
    : "components";
  return `${components}/${file.path.split("/").pop()}`;
}

/**
 * The package as npm serves it, from the workspace's packages/ui/package.json.
 * In the workspace, `exports` maps every subpath to `src`; packing replaces
 * it with `publishConfig.exports`, which maps to `dist`. A package fixture
 * installs this manifest beside a link to packages/ui/dist, so it typechecks
 * against the built declaration files a consumer gets.
 */
export function publishedManifest(pkg) {
  const { publishConfig, ...rest } = pkg;
  return { ...rest, exports: publishConfig.exports };
}

/** The packages a package fixture links: React, its types, the item's own. */
export function packageFixtureDependencies(item) {
  const own = (item.dependencies ?? []).map((dep) =>
    dep.replace(VERSION_RANGE, "")
  );
  return [
    ...new Set([
      "react",
      "react-dom",
      "@types/react",
      "@types/react-dom",
      ...own,
    ]),
  ].sort();
}

/**
 * Which of the app's own files an install changed, compared byte for byte:
 * `css` and `components.json`, each as [before, after].
 */
export function setupChanges({ css, config }) {
  return [
    ...(css[0] === css[1] ? [] : ["css"]),
    ...(config[0] === config[1] ? [] : ["components.json"]),
  ];
}

const USE_CLIENT = /^\s*["']use client["']/;

/**
 * Installed files whose source starts with a `"use client"` directive and
 * that no longer do: each entry is { path, source, installed }.
 */
export function lostClientDirectives(files) {
  return files
    .filter(
      ({ source, installed }) =>
        USE_CLIENT.test(source) && !USE_CLIENT.test(installed)
    )
    .map(({ path }) => path);
}
