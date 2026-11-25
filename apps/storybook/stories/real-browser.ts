/** The shared guard runs in plain Storybook and Vitest. */
declare global {
  interface ImportMeta {
    readonly env?: { readonly VITEST?: unknown };
  }
}

interface SetUpGlobals {
  __realCommands?: unknown;
  __realUserEvent?: unknown;
  __vitest_browser__?: boolean;
}

/**
 * Vitest's own markers, read independently of the set-up's globals. In the
 * browser run, browser mode marks the page with `__vitest_browser__` (there
 * `import.meta.env.VITEST` is undefined). In a Node pool (forks, threads)
 * Vitest defines `import.meta.env.VITEST`; it rewrites only the literal
 * `import.meta.env`, so the expression must keep that literal form.
 */
function underVitest() {
  return (
    (globalThis as SetUpGlobals).__vitest_browser__ === true ||
    Boolean(import.meta.env?.VITEST)
  );
}

/**
 * A Vitest marker lets the play continue. Each play checks the input it uses.
 * Without a marker, either defined setup handle makes the guard throw.
 * With neither marker nor handle, it returns true so the play can skip.
 */
export function outsideVitest() {
  if (underVitest()) {
    return false;
  }
  const g = globalThis as SetUpGlobals;
  if (g.__realCommands !== undefined || g.__realUserEvent !== undefined) {
    throw new Error(
      "The real browser set-up ran but Vitest's markers are absent: refusing to skip"
    );
  }
  return true;
}
