// @vitest-environment node

/**
 * `ComboboxInput` puts its `className` on the `InputGroup` wrapper, a plain
 * `div`, so it cannot honour Base UI's function `className`. Its type used to
 * be inherited from `ComboboxPrimitive.Input.Props` and so accepted a function
 * that was then silently dropped. The type is now narrowed to `string`.
 *
 * Type errors are not caught by `vitest run`, and no CI step type-checks test
 * files, so this compiles a probe with the TypeScript API and asserts on the
 * diagnostics: a string type-checks, a function is rejected.
 */

import { dirname, join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const SRC_DIR = import.meta.dirname;
const PROBE = join(SRC_DIR, "__combobox_input_probe__.tsx");
const PROBE_SOURCE = `import type { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { ComboboxInput, type ComboboxInputProps } from "./combobox";

declare const ownProps: ComboboxInputProps;
declare const baseUiProps: ComboboxPrimitive.Input.Props;

export const okString = <ComboboxInput className="w-full" />;
export const okUndefined = <ComboboxInput />;
export const okOwnProps = <ComboboxInput {...ownProps} />;
export const badFunction = <ComboboxInput className={() => "w-full"} />;
export const badBaseUiProps = <ComboboxInput {...baseUiProps} />;
`;
const BAD_FUNCTION_LINE = 10;
const BAD_SPREAD_LINE = 11;

function probeDiagnostics() {
  const configPath = join(dirname(SRC_DIR), "tsconfig.json");
  const parsed = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => undefined }
  );
  if (!parsed) {
    throw new Error(`could not read ${configPath}`);
  }
  const options = { ...parsed.options, noEmit: true, skipLibCheck: true };
  const host = ts.createCompilerHost(options);
  const { fileExists, readFile, getSourceFile } = host;
  host.fileExists = (f) => f === PROBE || fileExists.call(host, f);
  host.readFile = (f) => (f === PROBE ? PROBE_SOURCE : readFile.call(host, f));
  host.getSourceFile = (f, lang, ...rest) =>
    f === PROBE
      ? ts.createSourceFile(f, PROBE_SOURCE, lang, true, ts.ScriptKind.TSX)
      : getSourceFile.call(host, f, lang, ...rest);

  const program = ts.createProgram([PROBE], options, host);
  const probe = program.getSourceFile(PROBE);
  if (!probe) {
    throw new Error("probe source file was not loaded");
  }
  return program.getSemanticDiagnostics(probe).map((d) => ({
    line:
      d.start === undefined
        ? 0
        : probe.getLineAndCharacterOfPosition(d.start).line + 1,
    text: ts.flattenDiagnosticMessageText(d.messageText, "\n"),
  }));
}

describe("ComboboxInput className type", () => {
  it("accepts a string and rejects a function", () => {
    const diagnostics = probeDiagnostics();
    expect(
      diagnostics.filter(
        (d) => d.line !== BAD_FUNCTION_LINE && d.line !== BAD_SPREAD_LINE
      )
    ).toEqual([]);
    const bad = diagnostics.filter((d) => d.line === BAD_FUNCTION_LINE);
    expect(bad).toHaveLength(1);
    expect(bad[0]?.text).toBe(
      "Type '() => string' is not assignable to type 'string'."
    );
  }, 60_000);

  // The documented break: props typed with Base UI's wider type no longer
  // spread into ComboboxInput, even when their className is a string at
  // runtime. Consumers type them as ComboboxInputProps instead.
  it("rejects a spread of ComboboxPrimitive.Input.Props", () => {
    const diagnostics = probeDiagnostics();
    expect(diagnostics.filter((d) => d.line === BAD_SPREAD_LINE)).toHaveLength(
      1
    );
  }, 60_000);
});
