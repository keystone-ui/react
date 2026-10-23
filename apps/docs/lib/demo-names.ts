/**
 * Names served by `/r/demos/[name]`, derived from the demo map's `file`
 * paths.
 *
 * A component demo lives at `<component>/<variant>.tsx` and is served under
 * the component name; a block lives at `blocks/<block>.tsx` or
 * `blocks/<block>/...` and is served under the block name. The `blocks`
 * directory itself and anything `_`-prefixed are reserved and never served.
 */
const SOURCE_EXTENSION = /\.tsx?$/;

export function demoNamesFromFiles(files: readonly string[]): string[] {
  const names = new Set<string>();
  for (const file of files) {
    const segments = file.split("/");
    const name =
      segments[0] === "blocks"
        ? (segments[1] ?? "").replace(SOURCE_EXTENSION, "")
        : segments[0];
    if (!name || name === "blocks" || name.startsWith("_")) {
      continue;
    }
    names.add(name);
  }
  return [...names].sort();
}
