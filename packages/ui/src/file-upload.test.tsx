import type { BaseUIEvent } from "@base-ui/react/types";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  StrictMode,
  Suspense,
  startTransition,
  useEffect,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Button } from "./button";
import {
  FileUpload,
  type FileUploadChangeDetails,
  FileUploadDropzone,
  FileUploadError,
  FileUploadItem,
  FileUploadItemError,
  FileUploadItemName,
  FileUploadItemProgress,
  FileUploadItemRemove,
  FileUploadItemSize,
  FileUploadList,
  type FileUploadProps,
  type FileUploadStatus,
  FileUploadTrigger,
  useFileUploadItem,
} from "./file-upload";

const FILEUPLOADTRIGGER_PATTERN = /FileUploadTrigger/;
const FILE_PATTERN = /file/;
const MAXFILES_PATTERN = /maxFiles/;
const MAXSIZE_PATTERN = /maxSize/;
const MINSIZE_PATTERN = /minSize/;
const MULTIPLE_PATTERN = /multiple/;
const NOT_IN_THE_VALUE_PATTERN = /not in the value/;
const SAME_FILE_PATTERN = /same File/;
const SAME_KEY_PATTERN = /same key/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFile(
  name: string,
  { size = 10, type = "text/plain", lastModified = 1 } = {}
) {
  return new File(["x".repeat(size)], name, { type, lastModified });
}

function root(container: HTMLElement) {
  return container.querySelector<HTMLElement>(
    '[data-slot="file-upload"]'
  ) as HTMLElement;
}
function zone(container: HTMLElement) {
  return container.querySelector<HTMLElement>(
    '[data-slot="file-upload-dropzone"]'
  ) as HTMLElement;
}
function trigger(container: HTMLElement) {
  return container.querySelector<HTMLButtonElement>(
    '[data-slot="file-upload-trigger"]'
  ) as HTMLButtonElement;
}
function picker(container: HTMLElement) {
  return container.querySelector<HTMLInputElement>(
    "input[data-file-upload-picker]"
  ) as HTMLInputElement;
}
function formInput(container: HTMLElement) {
  return container.querySelector<HTMLInputElement>(
    "input[data-file-upload-form-input]"
  ) as HTMLInputElement;
}
function rows(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-slot="file-upload-item"]')
  );
}
function names(container: HTMLElement) {
  return rows(container).map(
    (row) =>
      row.querySelector('[data-slot="file-upload-item-name"]')?.textContent
  );
}
function status(container: HTMLElement) {
  return container.querySelector<HTMLElement>('[role="status"]') as HTMLElement;
}

/** Simulates a pick: jsdom has no DataTransfer, so `files` is defined. */
function pick(container: HTMLElement, files: File[]) {
  const input = picker(container);
  Object.defineProperty(input, "files", {
    configurable: true,
    value: files,
  });
  fireEvent.change(input);
}

interface FakeItem {
  getAsFile: () => File | null;
  kind: string;
  type: string;
  webkitGetAsEntry?: () => { isDirectory: boolean; name: string } | null;
}

function fileItem(file: File): FakeItem {
  return {
    kind: "file",
    type: file.type,
    getAsFile: () => file,
    webkitGetAsEntry: () => ({ isDirectory: false, name: file.name }),
  };
}

function dataTransfer(items: FakeItem[], types = ["Files"]) {
  return {
    types,
    items,
    files: items.map((i) => i.getAsFile()).filter(Boolean),
    dropEffect: "none",
  };
}

function drop(target: HTMLElement, files: File[]) {
  fireEvent.drop(target, { dataTransfer: dataTransfer(files.map(fileItem)) });
}

const DefaultRow = () => (
  <FileUploadItem>
    <FileUploadItemName />
    <FileUploadItemSize />
    <FileUploadItemRemove />
    <FileUploadItemProgress />
    <FileUploadItemError />
  </FileUploadItem>
);

function Uploader(props: FileUploadProps & { withError?: boolean }) {
  const { withError, ...rest } = props;
  return (
    <FileUpload aria-labelledby="label" {...rest}>
      <span id="label">Attachments</span>
      <FileUploadDropzone>
        <p>Drop files</p>
        <FileUploadTrigger>Choose files</FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList>{() => <DefaultRow />}</FileUploadList>
      {withError ? <FileUploadError /> : null}
    </FileUpload>
  );
}

let warn: ReturnType<typeof vi.spyOn>;
let error: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  error = vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  warn.mockRestore();
  error.mockRestore();
  cleanup();
  vi.useRealTimers();
});

function warned(pattern: RegExp) {
  return warn.mock.calls.some((args: unknown[]) =>
    pattern.test(String(args[0]))
  );
}

// ---------------------------------------------------------------------------
// Structure
// ---------------------------------------------------------------------------

describe("FileUpload structure", () => {
  it("renders every part with its data-slot", () => {
    const file = makeFile("a.txt");
    const { container } = render(
      <FileUpload defaultValue={[file]}>
        <FileUploadDropzone>
          <FileUploadTrigger>Choose</FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>
          {() => (
            <FileUploadItem error="Boom" progress={40} status="error">
              <FileUploadItemName />
              <FileUploadItemSize />
              <FileUploadItemRemove />
              <FileUploadItemProgress />
              <FileUploadItemError />
            </FileUploadItem>
          )}
        </FileUploadList>
        <FileUploadError />
      </FileUpload>
    );
    for (const slot of [
      "file-upload",
      "file-upload-dropzone",
      "file-upload-trigger",
      "file-upload-list",
      "file-upload-item",
      "file-upload-item-name",
      "file-upload-item-size",
      "file-upload-item-remove",
      "file-upload-item-progress",
      "file-upload-item-error",
    ]) {
      expect(
        container.querySelector(`[data-slot="${slot}"]`),
        slot
      ).not.toBeNull();
    }
    // The required error part renders only in its state.
    cleanup();
    const required = render(<Uploader required withError />);
    fireEvent.invalid(formInput(required.container));
    expect(
      required.container.querySelector('[data-slot="file-upload-error"]')
    ).not.toBeNull();
  });

  it("forwards each part's ref to its element", () => {
    const refs: Record<string, HTMLElement | null> = {};
    const set = (key: string) => (el: HTMLElement | null) => {
      refs[key] = el;
    };
    render(
      <FileUpload defaultValue={[makeFile("a.txt")]} ref={set("root")}>
        <FileUploadDropzone ref={set("zone")}>
          <FileUploadTrigger ref={set("trigger")}>Choose</FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList ref={set("list")}>
          {() => (
            <FileUploadItem progress={40} ref={set("item")} status="error">
              <FileUploadItemName ref={set("name")} />
              <FileUploadItemSize ref={set("size")} />
              <FileUploadItemRemove ref={set("remove")} />
              <FileUploadItemProgress ref={set("progress")} />
              <FileUploadItemError ref={set("error")} />
            </FileUploadItem>
          )}
        </FileUploadList>
      </FileUpload>
    );
    const required = render(
      <FileUpload required>
        <FileUploadError ref={set("requiredError")} />
      </FileUpload>
    );
    fireEvent.invalid(formInput(required.container));
    expect(refs.root?.tagName).toBe("DIV");
    expect(refs.zone?.tagName).toBe("DIV");
    expect(refs.trigger?.tagName).toBe("BUTTON");
    expect(refs.list?.tagName).toBe("UL");
    expect(refs.item?.tagName).toBe("LI");
    expect(refs.name?.tagName).toBe("SPAN");
    expect(refs.size?.tagName).toBe("SPAN");
    expect(refs.remove?.tagName).toBe("BUTTON");
    expect(refs.error?.tagName).toBe("P");
    expect(refs.progress?.tagName).toBe("DIV");
    expect(refs.progress).toHaveAttribute(
      "data-slot",
      "file-upload-item-progress"
    );
    expect(refs.requiredError?.tagName).toBe("P");
    expect(refs.requiredError).toHaveAttribute(
      "data-slot",
      "file-upload-error"
    );
  });

  it("keeps the trigger's slot when it renders a Button", () => {
    const { container } = render(
      <FileUpload>
        <FileUploadTrigger render={<Button size="sm" variant="outline" />}>
          Choose
        </FileUploadTrigger>
      </FileUpload>
    );
    const button = container.querySelector("button") as HTMLElement;
    expect(button).toHaveAttribute("data-slot", "file-upload-trigger");
    expect(button).toHaveAttribute("type", "button");
  });

  it("names the group and the list", () => {
    const { container } = render(<Uploader />);
    expect(root(container)).toHaveAttribute("role", "group");
    expect(root(container)).toHaveAttribute("aria-labelledby", "label");
    expect(
      container.querySelector('[data-slot="file-upload-list"]')
    ).toHaveAttribute("role", "list");
  });
});

// ---------------------------------------------------------------------------
// Value and identity
// ---------------------------------------------------------------------------

describe("value and identity", () => {
  it("adds picked files and reports the change", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader multiple onValueChange={onValueChange} />
    );
    const a = makeFile("a.txt");
    const b = makeFile("b.txt");
    pick(container, [a, b]);
    expect(names(container)).toEqual(["a.txt", "b.txt"]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    const [files, details] = onValueChange.mock.calls[0] ?? [];
    expect(files).toEqual([a, b]);
    expect(details).toMatchObject({
      reason: "add",
      added: [a, b],
      removed: [],
    });
    expect(details.event).toBeInstanceOf(Event);
  });

  it("clears the picker's value after each change", () => {
    const { container } = render(<Uploader multiple />);
    const input = picker(container);
    const setValue = vi.spyOn(input, "value", "set");
    pick(container, [makeFile("a.txt")]);
    expect(setValue).toHaveBeenCalledWith("");
  });

  it("shows two rows for two files that share a name", () => {
    const { container } = render(
      <Uploader
        allowDuplicates={false}
        defaultValue={[
          makeFile("same.txt", { size: 1 }),
          makeFile("same.txt", { size: 2 }),
        ]}
        multiple
      />
    );
    expect(names(container)).toEqual(["same.txt", "same.txt"]);
  });

  it("warns once for a repeated reference and still keys rows apart", () => {
    const a = makeFile("a.txt");
    const { container } = render(<Uploader multiple value={[a, a]} />);
    expect(rows(container)).toHaveLength(2);
    expect(
      warn.mock.calls.filter((args: unknown[]) =>
        SAME_FILE_PATTERN.test(String(args[0]))
      )
    ).toHaveLength(1);
    expect(
      error.mock.calls.some((args: unknown[]) =>
        SAME_KEY_PATTERN.test(String(args[0]))
      )
    ).toBe(false);
  });

  it("removes the clicked row, not the first equal reference", () => {
    const a = makeFile("a.txt");
    const b = makeFile("b.txt");
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader multiple onValueChange={onValueChange} value={[a, b, a]} />
    );
    const removes = container.querySelectorAll<HTMLButtonElement>(
      '[data-slot="file-upload-item-remove"]'
    );
    fireEvent.click(removes[2] as HTMLButtonElement);
    expect(onValueChange.mock.calls[0]?.[0]).toEqual([a, b]);
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({
      reason: "remove",
      removed: [a],
      added: [],
    });
  });

  it("treats a longer single-mode value as its first file, with a warning", () => {
    const { container } = render(
      <Uploader value={[makeFile("a.txt"), makeFile("b.txt")]} />
    );
    expect(names(container)).toEqual(["a.txt"]);
    expect(warned(MULTIPLE_PATTERN)).toBe(true);
  });

  it("does not rewrite a controlled value when the limit drops below it", () => {
    const a = makeFile("a.txt");
    const b = makeFile("b.txt");
    const { container, rerender } = render(
      <Uploader maxFiles={5} multiple value={[a, b]} />
    );
    rerender(<Uploader maxFiles={1} multiple value={[a, b]} />);
    expect(names(container)).toEqual(["a.txt", "b.txt"]);
    rerender(<Uploader maxFiles={0} multiple value={[a, b]} />);
    expect(names(container)).toEqual(["a.txt", "b.txt"]);
  });
});

// ---------------------------------------------------------------------------
// Validation and batches
// ---------------------------------------------------------------------------

describe("validation", () => {
  function setup(props: FileUploadProps = {}) {
    const onValueChange = vi.fn();
    const onFilesRejected = vi.fn();
    const utils = render(
      <Uploader
        multiple
        onFilesRejected={onFilesRejected}
        onValueChange={onValueChange}
        {...props}
      />
    );
    return { ...utils, onValueChange, onFilesRejected };
  }

  function codes(onFilesRejected: ReturnType<typeof vi.fn>) {
    const rejections = onFilesRejected.mock.calls[0]?.[0] ?? [];
    return Object.fromEntries(
      rejections.map((r: { name: string; errors: { code: string }[] }) => [
        r.name,
        r.errors.map((e) => e.code),
      ])
    );
  }

  it("matches accept tokens case-insensitively and by extension", () => {
    const { container, onValueChange, onFilesRejected } = setup({
      accept: " .PDF , image/* ,text/plain",
    });
    pick(container, [
      makeFile("a.pdf", { type: "" }),
      makeFile("b.Pdf", { type: "application/pdf" }),
      makeFile("c.png", { type: "image/png" }),
      makeFile("d.txt", { type: "TEXT/PLAIN" }),
      makeFile("e.doc", { type: "application/msword" }),
      makeFile("f", { type: "" }),
    ]);
    expect(onValueChange.mock.calls[0]?.[0].map((f: File) => f.name)).toEqual([
      "a.pdf",
      "b.Pdf",
      "c.png",
      "d.txt",
    ]);
    expect(codes(onFilesRejected)).toEqual({
      "e.doc": ["file-invalid-type"],
      f: ["file-invalid-type"],
    });
  });

  it("matches an empty MIME type only by extension", () => {
    const { container, onFilesRejected } = setup({ accept: "text/plain" });
    pick(container, [makeFile("a.txt", { type: "" })]);
    expect(codes(onFilesRejected)).toEqual({ "a.txt": ["file-invalid-type"] });
  });

  it("treats any type/* token as a wildcard", () => {
    const { container, onValueChange } = setup({ accept: "application/*" });
    pick(container, [makeFile("a.zip", { type: "application/zip" })]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("accepts every file for */*, including one with no MIME type", () => {
    const { container, onValueChange, onFilesRejected } = setup({
      accept: "*/*",
    });
    pick(container, [
      makeFile("a.zip", { type: "application/zip" }),
      makeFile("notes", { type: "" }),
    ]);
    expect(onFilesRejected).not.toHaveBeenCalled();
    expect(onValueChange.mock.calls[0]?.[0]).toHaveLength(2);
  });

  it("collects every failure of a file", () => {
    const { container, onFilesRejected } = setup({
      accept: ".pdf",
      maxSize: 5,
      validate: () => "Nope",
    });
    pick(container, [makeFile("a.txt", { size: 10 })]);
    const rejection = onFilesRejected.mock.calls[0]?.[0][0];
    expect(rejection.errors).toEqual([
      { code: "file-invalid-type", message: expect.any(String) },
      { code: "file-too-large", message: expect.any(String) },
      { code: "custom", message: "Nope" },
    ]);
    expect(rejection.file).toBeInstanceOf(File);
  });

  it("checks minSize and maxSize in bytes", () => {
    const { container, onFilesRejected } = setup({ minSize: 5, maxSize: 10 });
    pick(container, [
      makeFile("small", { size: 4 }),
      makeFile("ok", { size: 5 }),
      makeFile("large", { size: 11 }),
    ]);
    expect(codes(onFilesRejected)).toEqual({
      small: ["file-too-small"],
      large: ["file-too-large"],
    });
  });

  it("rejects duplicates against the value and within one batch", () => {
    const a = makeFile("a.txt");
    const { container, onFilesRejected, onValueChange } = setup({
      defaultValue: [a],
    });
    pick(container, [makeFile("a.txt"), makeFile("b.txt"), makeFile("b.txt")]);
    expect(
      onValueChange.mock.calls[0]?.[1].added.map((f: File) => f.name)
    ).toEqual(["b.txt"]);
    expect(onFilesRejected.mock.calls[0]?.[0]).toHaveLength(2);
    expect(
      onFilesRejected.mock.calls[0]?.[0].map(
        (r: { errors: { code: string }[] }) => r.errors[0]?.code
      )
    ).toEqual(["file-exists", "file-exists"]);
  });

  it("allows duplicates when asked", () => {
    const { container, onValueChange } = setup({ allowDuplicates: true });
    pick(container, [makeFile("a.txt"), makeFile("a.txt")]);
    expect(onValueChange.mock.calls[0]?.[0]).toHaveLength(2);
  });

  it("passes validate the provisional list", () => {
    const a = makeFile("a.txt");
    const seen: string[][] = [];
    const { container } = setup({
      defaultValue: [a],
      validate: (_file, provisional) => {
        seen.push(provisional.map((f) => f.name));
        return null;
      },
    });
    pick(container, [makeFile("b.txt"), makeFile("c.txt")]);
    expect(seen).toEqual([["a.txt"], ["a.txt", "b.txt"]]);
  });

  it("uses messages.rejection for visible rejection text", () => {
    const { container, onFilesRejected } = setup({
      maxSize: 1,
      messages: { rejection: (code, name) => `${code}:${name}` },
    });
    pick(container, [makeFile("a.txt", { size: 2 })]);
    expect(onFilesRejected.mock.calls[0]?.[0][0].errors[0].message).toBe(
      "file-too-large:a.txt"
    );
  });

  it("calls onValueChange, then onFilesRejected, once each", () => {
    const order: string[] = [];
    const { container } = render(
      <Uploader
        maxSize={5}
        multiple
        onFilesRejected={() => order.push("rejected")}
        onValueChange={() => order.push("change")}
      />
    );
    pick(container, [
      makeFile("a", { size: 1 }),
      makeFile("b", { size: 9 }),
      makeFile("c", { size: 1 }),
      makeFile("d", { size: 9 }),
    ]);
    expect(order).toEqual(["change", "rejected"]);
  });
});

describe("limits", () => {
  function setup(props: FileUploadProps) {
    const onValueChange = vi.fn();
    const onFilesRejected = vi.fn();
    const utils = render(
      <Uploader
        multiple
        onFilesRejected={onFilesRejected}
        onValueChange={onValueChange}
        {...props}
      />
    );
    return { ...utils, onValueChange, onFilesRejected };
  }

  it("accepts up to the room left and rejects the surplus", () => {
    const { container, onValueChange, onFilesRejected } = setup({
      defaultValue: [makeFile("a")],
      maxFiles: 3,
    });
    pick(container, [makeFile("b"), makeFile("c"), makeFile("d")]);
    expect(
      onValueChange.mock.calls[0]?.[1].added.map((f: File) => f.name)
    ).toEqual(["b", "c"]);
    expect(onFilesRejected.mock.calls[0]?.[0]).toEqual([
      expect.objectContaining({
        name: "d",
        errors: [expect.objectContaining({ code: "too-many-files" })],
      }),
    ]);
  });

  it("keeps ordinary errors at zero capacity and gives valid files the capacity code", () => {
    const a = makeFile("a.txt");
    const { container, onValueChange, onFilesRejected } = setup({
      defaultValue: [a],
      maxFiles: 0,
      maxSize: 5,
    });
    pick(container, [
      makeFile("ok", { size: 1 }),
      makeFile("big", { size: 9 }),
    ]);
    expect(onValueChange).not.toHaveBeenCalled();
    const rejections = onFilesRejected.mock.calls[0]?.[0];
    expect(
      rejections.map((r: { errors: { code: string }[] }) =>
        r.errors.map((e) => e.code)
      )
    ).toEqual([["too-many-files"], ["file-too-large"]]);
    // Chosen files still remove.
    fireEvent.click(
      container.querySelector(
        '[data-slot="file-upload-item-remove"]'
      ) as HTMLElement
    );
    expect(onValueChange.mock.calls[0]?.[0]).toEqual([]);
  });

  it("treats a negative maxFiles as zero, with a warning", () => {
    const { container, onFilesRejected } = setup({ maxFiles: -2 });
    pick(container, [makeFile("a")]);
    expect(onFilesRejected.mock.calls[0]?.[0][0].errors[0].code).toBe(
      "too-many-files"
    );
    expect(warned(MAXFILES_PATTERN)).toBe(true);
  });

  it("floors a fractional maxFiles, with a warning", () => {
    const { container, onValueChange } = setup({ maxFiles: 1.9 });
    pick(container, [makeFile("a"), makeFile("b")]);
    expect(onValueChange.mock.calls[0]?.[0]).toHaveLength(1);
    expect(warned(MAXFILES_PATTERN)).toBe(true);
  });

  it("treats NaN as unset with a warning, +Infinity as unset and -Infinity as zero", () => {
    const nan = setup({ maxFiles: Number.NaN });
    pick(nan.container, [makeFile("a"), makeFile("b")]);
    expect(nan.onValueChange.mock.calls[0]?.[0]).toHaveLength(2);
    expect(warned(MAXFILES_PATTERN)).toBe(true);
    cleanup();
    warn.mockClear();

    const inf = setup({ maxFiles: Number.POSITIVE_INFINITY });
    pick(inf.container, [makeFile("a"), makeFile("b")]);
    expect(inf.onValueChange.mock.calls[0]?.[0]).toHaveLength(2);
    expect(warned(MAXFILES_PATTERN)).toBe(false);
    cleanup();

    const negInf = setup({ maxFiles: Number.NEGATIVE_INFINITY });
    pick(negInf.container, [makeFile("a")]);
    expect(negInf.onValueChange).not.toHaveBeenCalled();
    expect(negInf.onFilesRejected.mock.calls[0]?.[0][0].errors[0].code).toBe(
      "too-many-files"
    );
  });

  it("never computes room below zero for an over-limit controlled value", () => {
    const { container, onValueChange, onFilesRejected } = setup({
      maxFiles: 1,
      value: [makeFile("a"), makeFile("b"), makeFile("c")],
    });
    pick(container, [makeFile("d")]);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onFilesRejected.mock.calls[0]?.[0][0].errors[0].code).toBe(
      "too-many-files"
    );
    // No room is 0, not negative: the zone does not open the picker.
    const opened = vi.fn();
    picker(container).click = opened;
    fireEvent.click(zone(container));
    expect(opened).not.toHaveBeenCalled();
  });

  it("frees capacity when the limit rises again", () => {
    const a = makeFile("a");
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <Uploader
        maxFiles={0}
        multiple
        onValueChange={onValueChange}
        value={[a]}
      />
    );
    pick(container, [makeFile("b")]);
    expect(onValueChange).not.toHaveBeenCalled();
    rerender(
      <Uploader
        maxFiles={2}
        multiple
        onValueChange={onValueChange}
        value={[a]}
      />
    );
    pick(container, [makeFile("b")]);
    expect(onValueChange.mock.calls[0]?.[0].map((f: File) => f.name)).toEqual([
      "a",
      "b",
    ]);
  });

  it("treats a negative or non-finite size limit as unset, with a warning", () => {
    const { container, onValueChange } = setup({
      maxSize: -1,
      minSize: Number.POSITIVE_INFINITY,
    });
    pick(container, [makeFile("a", { size: 100 })]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(warned(MAXSIZE_PATTERN)).toBe(true);
    expect(warned(MINSIZE_PATTERN)).toBe(true);
  });

  it("ignores maxFiles in single mode, including zero, with a warning", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader maxFiles={0} onValueChange={onValueChange} />
    );
    pick(container, [makeFile("a")]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(warned(MAXFILES_PATTERN)).toBe(true);
  });
});

describe("development warnings", () => {
  it("are silent in a production build", () => {
    vi.stubEnv("NODE_ENV", "production");
    try {
      render(<Uploader maxFiles={-1} maxSize={-1} multiple />);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe("single mode", () => {
  it("passes validate a provisional list without the file being replaced", () => {
    const seen: string[][] = [];
    const { container } = render(
      <Uploader
        defaultValue={[makeFile("old")]}
        validate={(_file, provisional) => {
          seen.push(provisional.map((f) => f.name));
          return null;
        }}
      />
    );
    pick(container, [makeFile("new")]);
    expect(seen).toEqual([[]]);
  });

  it("takes the first acceptable file and rejects the other acceptable ones", () => {
    const onValueChange = vi.fn();
    const onFilesRejected = vi.fn();
    const { container } = render(
      <Uploader
        maxSize={5}
        onFilesRejected={onFilesRejected}
        onValueChange={onValueChange}
      />
    );
    pick(container, [
      makeFile("big", { size: 9 }),
      makeFile("a", { size: 1 }),
      makeFile("b", { size: 1 }),
    ]);
    expect(onValueChange.mock.calls[0]?.[0].map((f: File) => f.name)).toEqual([
      "a",
    ]);
    const rejections = onFilesRejected.mock.calls[0]?.[0];
    expect(
      rejections.map((r: { name: string; errors: { code: string }[] }) => [
        r.name,
        r.errors[0]?.code,
      ])
    ).toEqual([
      ["big", "file-too-large"],
      ["b", "too-many-files"],
    ]);
  });

  it("keeps the current file when nothing passes", () => {
    const current = makeFile("current");
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader
        defaultValue={[current]}
        maxSize={5}
        onValueChange={onValueChange}
      />
    );
    pick(container, [makeFile("big", { size: 9 })]);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(names(container)).toEqual(["current"]);
  });

  it("does nothing when the same file is picked again", async () => {
    const current = makeFile("same");
    const onValueChange = vi.fn();
    const onFilesRejected = vi.fn();
    const { container } = render(
      <Uploader
        defaultValue={[current]}
        onFilesRejected={onFilesRejected}
        onValueChange={onValueChange}
      />
    );
    pick(container, [makeFile("same")]);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onFilesRejected).not.toHaveBeenCalled();
    await new Promise((r) => setTimeout(r, 200));
    expect(status(container).textContent).toBe("");
  });

  it("reports a replacement and announces it as one message", async () => {
    const old = makeFile("old");
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader defaultValue={[old]} onValueChange={onValueChange} />
    );
    const next = makeFile("new");
    pick(container, [next]);
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({
      reason: "replace",
      added: [next],
      removed: [old],
    });
    await waitFor(() =>
      expect(status(container)).toHaveTextContent(
        "new added, replacing the previous file."
      )
    );
  });
});

// ---------------------------------------------------------------------------
// Events and composition
// ---------------------------------------------------------------------------

describe("opening the picker", () => {
  function clicks(container: HTMLElement) {
    const spy = vi.fn();
    picker(container).click = spy;
    return spy;
  }

  it("opens once from a zone click and once from the trigger", () => {
    const { container } = render(<Uploader />);
    const spy = clicks(container);
    fireEvent.click(zone(container));
    expect(spy).toHaveBeenCalledTimes(1);
    fireEvent.click(trigger(container));
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("sends ancestors one click per activation, not a second from the picker", () => {
    const onClick = vi.fn();
    const { container } = render(<Uploader onClick={onClick} />);
    const opened = vi.fn();
    picker(container).addEventListener("click", (event) => {
      // jsdom would otherwise start a file selection; the click still bubbles.
      event.preventDefault();
      opened();
    });
    fireEvent.click(trigger(container));
    expect(opened).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    fireEvent.click(zone(container));
    expect(opened).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("does not open from a remove button or another control in the zone", () => {
    const a = makeFile("a");
    const { container } = render(
      <FileUpload defaultValue={[a]}>
        <FileUploadDropzone>
          <FileUploadTrigger>Choose</FileUploadTrigger>
          <a href="#x">Read the upload policy</a>
          <span contentEditable suppressContentEditableWarning>
            edit
          </span>
          <FileUploadList>{() => <DefaultRow />}</FileUploadList>
        </FileUploadDropzone>
      </FileUpload>
    );
    const spy = clicks(container);
    fireEvent.click(screen.getByText("Read the upload policy"));
    fireEvent.click(screen.getByText("edit"));
    fireEvent.click(
      container.querySelector(
        '[data-slot="file-upload-item-remove"]'
      ) as HTMLElement
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it.each([
    [
      "preventDefault",
      (e: BaseUIEvent<React.MouseEvent>) => e.preventDefault(),
    ],
    [
      "preventBaseUIHandler",
      (e: BaseUIEvent<React.MouseEvent>) => e.preventBaseUIHandler(),
    ],
  ])(
    "a consumer onClick calling %s stops the zone and the trigger",
    (_, stop) => {
      const { container } = render(
        <FileUpload>
          <FileUploadDropzone onClick={stop}>
            <FileUploadTrigger onClick={stop}>Choose</FileUploadTrigger>
          </FileUploadDropzone>
        </FileUpload>
      );
      const spy = clicks(container);
      fireEvent.click(zone(container));
      fireEvent.click(trigger(container));
      expect(spy).not.toHaveBeenCalled();
    }
  );

  it("does not open from the zone when no room is left", () => {
    const { container } = render(<Uploader maxFiles={0} multiple />);
    const spy = clicks(container);
    fireEvent.click(zone(container));
    expect(spy).not.toHaveBeenCalled();
  });

  it("does not open while disabled, and disables both inputs", () => {
    const { container } = render(<Uploader disabled name="files" />);
    const spy = clicks(container);
    fireEvent.click(zone(container));
    expect(spy).not.toHaveBeenCalled();
    expect(trigger(container)).toBeDisabled();
    expect(picker(container)).toBeDisabled();
    expect(formInput(container)).toBeDisabled();
    expect(root(container)).toHaveAttribute("data-disabled");
    expect(zone(container)).toHaveAttribute("data-disabled");
  });

  it("warns about a zone without a trigger", () => {
    render(
      <FileUpload>
        <FileUploadDropzone>Drop</FileUploadDropzone>
      </FileUpload>
    );
    expect(warned(FILEUPLOADTRIGGER_PATTERN)).toBe(true);
  });

  it("does not warn when the trigger sits beside the zone", () => {
    render(
      <FileUpload aria-label="Files">
        <FileUploadDropzone>Drop here</FileUploadDropzone>
        <FileUploadTrigger>Choose</FileUploadTrigger>
      </FileUpload>
    );
    expect(warned(FILEUPLOADTRIGGER_PATTERN)).toBe(false);
  });
});

describe("drag and drop", () => {
  it("adds dropped files", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader multiple onValueChange={onValueChange} />
    );
    drop(zone(container), [makeFile("a")]);
    expect(onValueChange.mock.calls[0]?.[1].reason).toBe("add");
    expect(names(container)).toEqual(["a"]);
  });

  it("rejects a dropped directory with a null file", () => {
    const onFilesRejected = vi.fn();
    const { container } = render(
      <Uploader multiple onFilesRejected={onFilesRejected} />
    );
    fireEvent.drop(zone(container), {
      dataTransfer: dataTransfer([
        {
          kind: "file",
          type: "",
          getAsFile: () => makeFile("folder", { size: 0, type: "" }),
          webkitGetAsEntry: () => ({ isDirectory: true, name: "folder" }),
        },
        { kind: "string", type: "text/plain", getAsFile: () => null },
      ]),
    });
    expect(onFilesRejected.mock.calls[0]?.[0]).toEqual([
      {
        file: null,
        name: "folder",
        errors: [{ code: "file-is-directory", message: expect.any(String) }],
      },
    ]);
  });

  it("does not take a zero-byte file without an entry API for a directory", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader multiple onValueChange={onValueChange} />
    );
    const empty = makeFile("empty", { size: 0, type: "" });
    fireEvent.drop(zone(container), {
      dataTransfer: dataTransfer([
        { kind: "file", type: "", getAsFile: () => empty },
      ]),
    });
    expect(onValueChange.mock.calls[0]?.[0]).toEqual([empty]);
  });

  it("tracks the drag across child enter and leave", () => {
    const { container } = render(<Uploader />);
    const z = zone(container);
    const child = screen.getByText("Drop files");
    const dt = dataTransfer([]);
    fireEvent.dragEnter(z, { dataTransfer: dt });
    fireEvent.dragEnter(child, { dataTransfer: dt });
    fireEvent.dragLeave(z, { dataTransfer: dt });
    expect(z).toHaveAttribute("data-dragging");
    expect(root(container)).toHaveAttribute("data-dragging");
    fireEvent.dragLeave(child, { dataTransfer: dt });
    expect(z).not.toHaveAttribute("data-dragging");
    fireEvent.dragLeave(child, { dataTransfer: dt });
    fireEvent.dragEnter(z, { dataTransfer: dt });
    expect(z).toHaveAttribute("data-dragging");
    drop(z, []);
    expect(z).not.toHaveAttribute("data-dragging");
  });

  it("ignores a text drag", () => {
    const { container } = render(<Uploader />);
    const z = zone(container);
    const dt = dataTransfer([], ["text/plain"]);
    fireEvent.dragEnter(z, { dataTransfer: dt });
    const over = fireEvent.dragOver(z, { dataTransfer: dt });
    expect(z).not.toHaveAttribute("data-dragging");
    expect(over).toBe(true);
  });

  it("accepts a file dragover with the copy effect", () => {
    const { container } = render(<Uploader />);
    const dt = dataTransfer([]);
    const notPrevented = fireEvent.dragOver(zone(container), {
      dataTransfer: dt,
    });
    expect(notPrevented).toBe(false);
    expect(dt.dropEffect).toBe("copy");
  });

  it("clears the drag when the window loses focus", () => {
    const { container } = render(<Uploader />);
    fireEvent.dragEnter(zone(container), { dataTransfer: dataTransfer([]) });
    expect(zone(container)).toHaveAttribute("data-dragging");
    act(() => {
      window.dispatchEvent(new Event("blur"));
    });
    expect(zone(container)).not.toHaveAttribute("data-dragging");
  });

  it("still adds files when a consumer onDrop calls preventDefault", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <FileUpload multiple onValueChange={onValueChange}>
        <FileUploadDropzone onDrop={(e) => e.preventDefault()}>
          <FileUploadTrigger>Choose</FileUploadTrigger>
        </FileUploadDropzone>
      </FileUpload>
    );
    drop(zone(container), [makeFile("a")]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it("adds nothing when a consumer onDrop calls preventBaseUIHandler", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <FileUpload multiple onValueChange={onValueChange}>
        <FileUploadDropzone onDrop={(e) => e.preventBaseUIHandler()}>
          <FileUploadTrigger>Choose</FileUploadTrigger>
        </FileUploadDropzone>
      </FileUpload>
    );
    drop(zone(container), [makeFile("a")]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("lets only the innermost of nested uploaders take a drop", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <FileUpload multiple onValueChange={outer}>
        <FileUploadDropzone>
          <FileUploadTrigger>Outer</FileUploadTrigger>
          <FileUpload multiple onValueChange={inner}>
            <FileUploadDropzone data-testid="inner">
              <FileUploadTrigger>Inner</FileUploadTrigger>
            </FileUploadDropzone>
          </FileUpload>
        </FileUploadDropzone>
      </FileUpload>
    );
    drop(screen.getByTestId("inner"), [makeFile("a")]);
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it("rejects a drop at zero capacity and announces it once", async () => {
    const onFilesRejected = vi.fn();
    const { container } = render(
      <Uploader maxFiles={0} multiple onFilesRejected={onFilesRejected} />
    );
    drop(zone(container), [makeFile("a")]);
    expect(onFilesRejected).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(status(container)).toHaveTextContent("a was not added.")
    );
    expect(status(container).textContent).toBe("a was not added.");
  });

  it("prevents the default on a file dragover while disabled, with the none effect", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader disabled onValueChange={onValueChange} />
    );
    const dt = dataTransfer([]);
    dt.dropEffect = "copy";
    expect(fireEvent.dragOver(zone(container), { dataTransfer: dt })).toBe(
      false
    );
    expect(dt.dropEffect).toBe("none");
    expect(zone(container)).not.toHaveAttribute("data-dragging");
    expect(
      fireEvent.drop(zone(container), {
        dataTransfer: dataTransfer([fileItem(makeFile("a"))]),
      })
    ).toBe(false);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("keeps the none effect of a disabled uploader inside an enabled one", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <FileUpload multiple onValueChange={outer}>
        <FileUploadDropzone>
          <FileUploadTrigger>Outer</FileUploadTrigger>
          <FileUpload disabled multiple onValueChange={inner}>
            <FileUploadDropzone data-testid="inner">
              <FileUploadTrigger>Inner</FileUploadTrigger>
            </FileUploadDropzone>
          </FileUpload>
        </FileUploadDropzone>
      </FileUpload>
    );
    const dt = dataTransfer([]);
    expect(
      fireEvent.dragOver(screen.getByTestId("inner"), { dataTransfer: dt })
    ).toBe(false);
    expect(dt.dropEffect).toBe("none");
    drop(screen.getByTestId("inner"), [makeFile("a")]);
    expect(inner).not.toHaveBeenCalled();
    expect(outer).not.toHaveBeenCalled();
  });

  it("ignores drops while disabled", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader disabled onValueChange={onValueChange} />
    );
    drop(zone(container), [makeFile("a")]);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("paste", () => {
  function paste(target: HTMLElement, files: File[]) {
    return fireEvent.paste(target, { clipboardData: { files } });
  }

  it("is off by default", () => {
    const onValueChange = vi.fn();
    const { container } = render(<Uploader onValueChange={onValueChange} />);
    trigger(container).focus();
    paste(trigger(container), [makeFile("a")]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("takes pasted files when on and focus is inside, and consumes the paste", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader allowPaste multiple onValueChange={onValueChange} />
    );
    trigger(container).focus();
    const notPrevented = paste(trigger(container), [makeFile("a")]);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(notPrevented).toBe(false);
  });

  it("consumes a paste even when every file is rejected", () => {
    const onFilesRejected = vi.fn();
    const { container } = render(
      <Uploader accept=".pdf" allowPaste onFilesRejected={onFilesRejected} />
    );
    trigger(container).focus();
    expect(paste(trigger(container), [makeFile("a.txt")])).toBe(false);
    expect(onFilesRejected).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["a textarea", <textarea aria-label="note" key="e" />],
    ["a text input", <input aria-label="note" key="e" />],
    [
      "a contenteditable element",
      // biome-ignore lint/a11y/useSemanticElements: the case under test is a contenteditable element
      <div
        aria-label="note"
        contentEditable
        key="e"
        role="textbox"
        tabIndex={0}
      />,
    ],
  ])("leaves a paste into %s alone", (_, editable) => {
    const onValueChange = vi.fn();
    render(
      <FileUpload allowPaste onValueChange={onValueChange}>
        {editable}
        <FileUploadTrigger>Choose</FileUploadTrigger>
      </FileUpload>
    );
    const target = screen.getByLabelText("note");
    target.focus();
    expect(paste(target, [makeFile("a")])).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("stops when a consumer onPaste calls preventBaseUIHandler", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader
        allowPaste
        onPaste={(e) => e.preventBaseUIHandler()}
        onValueChange={onValueChange}
      />
    );
    trigger(container).focus();
    paste(trigger(container), [makeFile("a")]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("lets only the innermost of nested uploaders take a paste", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <FileUpload allowPaste multiple onValueChange={outer}>
        <FileUploadTrigger>Outer</FileUploadTrigger>
        <FileUpload allowPaste multiple onValueChange={inner}>
          <FileUploadTrigger>Inner</FileUploadTrigger>
        </FileUpload>
      </FileUpload>
    );
    const innerTrigger = screen.getByRole("button", { name: "Inner" });
    innerTrigger.focus();
    expect(paste(innerTrigger, [makeFile("a")])).toBe(false);
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it("stops when a consumer onPaste calls preventDefault", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader
        allowPaste
        onPaste={(e) => e.preventDefault()}
        onValueChange={onValueChange}
      />
    );
    trigger(container).focus();
    paste(trigger(container), [makeFile("a")]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("ignores a paste with no files", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader allowPaste onValueChange={onValueChange} />
    );
    trigger(container).focus();
    expect(paste(trigger(container), [])).toBe(true);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("builds a paste proposal from the committed value while a transition suspends", async () => {
    const a = makeFile("a");
    const b = makeFile("b");
    const c = makeFile("c");
    const changed = vi.fn();
    const blocked = new Promise<void>(() => undefined);
    let begin: () => void = () => undefined;

    function Gate({ hold }: { hold: boolean }) {
      if (hold) {
        throw blocked;
      }
      return null;
    }

    function App() {
      const [state, setState] = useState({ files: [a], hold: false });
      begin = () => {
        startTransition(() => setState({ files: [b], hold: true }));
      };
      return (
        <Suspense fallback={<p>Loading</p>}>
          <Uploader
            allowPaste
            multiple
            onValueChange={changed}
            value={state.files}
          />
          <Gate hold={state.hold} />
        </Suspense>
      );
    }

    const { container } = render(<App />);
    await act(async () => {
      begin();
    });
    expect(names(container)).toEqual(["a"]);
    root(container).focus();
    fireEvent.paste(root(container), { clipboardData: { files: [c] } });
    expect(changed).toHaveBeenLastCalledWith(
      [a, c],
      expect.objectContaining({ reason: "add", added: [c], removed: [] })
    );
    // Deep equality treats any two Files as equal: compare the names too.
    expect(changed.mock.lastCall?.[0].map((file: File) => file.name)).toEqual([
      "a",
      "c",
    ]);
  });
});

describe("remove", () => {
  it.each([
    [
      "preventDefault",
      (e: BaseUIEvent<React.MouseEvent>) => e.preventDefault(),
    ],
    [
      "preventBaseUIHandler",
      (e: BaseUIEvent<React.MouseEvent>) => e.preventBaseUIHandler(),
    ],
  ])("a consumer onClick calling %s stops the removal", (_, stop) => {
    const onValueChange = vi.fn();
    const { container } = render(
      <FileUpload defaultValue={[makeFile("a")]} onValueChange={onValueChange}>
        <FileUploadList>
          {() => (
            <FileUploadItem>
              <FileUploadItemRemove onClick={stop} />
            </FileUploadItem>
          )}
        </FileUploadList>
      </FileUpload>
    );
    fireEvent.click(
      container.querySelector(
        '[data-slot="file-upload-item-remove"]'
      ) as HTMLElement
    );
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables the remove buttons of a disabled uploader", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <Uploader
        defaultValue={[makeFile("a")]}
        disabled
        onValueChange={onValueChange}
      />
    );
    const button = container.querySelector(
      '[data-slot="file-upload-item-remove"]'
    ) as HTMLButtonElement;
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(rows(container)).toHaveLength(1);
  });

  it("names the button after the file, and lets aria-label win", () => {
    render(
      <FileUpload defaultValue={[makeFile("a.txt")]} multiple>
        <FileUploadList>
          {() => (
            <FileUploadItem>
              <FileUploadItemRemove />
              <FileUploadItemRemove aria-label="Delete it" />
            </FileUploadItem>
          )}
        </FileUploadList>
      </FileUpload>
    );
    expect(screen.getByRole("button", { name: "Remove a.txt" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Delete it" })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Accessibility: invalid, descriptions, required
// ---------------------------------------------------------------------------

describe("invalid state and descriptions", () => {
  it("turns aria-invalid into data-invalid and renders it nowhere", () => {
    const { container } = render(<Uploader aria-invalid />);
    expect(root(container)).toHaveAttribute("data-invalid");
    expect(zone(container)).toHaveAttribute("data-invalid");
    expect(container.querySelector("[aria-invalid]")).toBeNull();
  });

  it("marks the root invalid for every aria-invalid value but false", () => {
    for (const value of ["grammar", "spelling", true, "true"] as const) {
      const { container, unmount } = render(<Uploader aria-invalid={value} />);
      expect(root(container)).toHaveAttribute("data-invalid");
      expect(zone(container)).toHaveAttribute("data-invalid");
      expect(root(container)).not.toHaveAttribute("aria-invalid");
      unmount();
    }
    for (const value of [false, "false", undefined] as const) {
      const { container, unmount } = render(<Uploader aria-invalid={value} />);
      expect(root(container)).not.toHaveAttribute("data-invalid");
      unmount();
    }
  });

  it("uses a bare invalid attribute on the root and zone", () => {
    const { container, rerender } = render(<Uploader aria-invalid="grammar" />);
    for (const element of [root(container), zone(container)]) {
      expect(element).toHaveAttribute("data-invalid", "");
      expect(element.matches('[data-invalid="true"]')).toBe(false);
    }
    rerender(<Uploader aria-invalid={false} />);
    expect(root(container)).not.toHaveAttribute("data-invalid");
    expect(zone(container)).not.toHaveAttribute("data-invalid");
  });

  it("merges aria-describedby from the root and the trigger without duplicates", () => {
    const { container } = render(
      <FileUpload aria-describedby="hint shared">
        <FileUploadTrigger aria-describedby="own shared">
          Choose
        </FileUploadTrigger>
      </FileUpload>
    );
    expect(trigger(container).getAttribute("aria-describedby")).toBe(
      "hint shared own"
    );
    expect(root(container)).not.toHaveAttribute("aria-describedby");
  });
});

describe("required", () => {
  function invalidate(container: HTMLElement) {
    fireEvent.invalid(formInput(container));
  }

  it("shows the error part, describes the trigger and announces once", async () => {
    const { container } = render(<Uploader required withError />);
    invalidate(container);
    const errorEl = container.querySelector<HTMLElement>(
      '[data-slot="file-upload-error"]'
    ) as HTMLElement;
    expect(errorEl).toHaveTextContent("Choose at least one file.");
    expect(trigger(container).getAttribute("aria-describedby")).toContain(
      errorEl.id
    );
    expect(root(container)).toHaveAttribute("data-invalid", "");
    expect(zone(container)).toHaveAttribute("data-invalid", "");
    await waitFor(() =>
      expect(status(container)).toHaveTextContent("Choose at least one file.")
    );
    // A second invalid event does not announce again.
    status(container).textContent = "";
    invalidate(container);
    await new Promise((r) => setTimeout(r, 200));
    expect(status(container).textContent).toBe("");
  });

  it("announces once for two invalid events in the same task", async () => {
    const { container } = render(<Uploader required withError />);
    act(() => {
      // Two checkValidity() calls before React renders in between.
      formInput(container).dispatchEvent(new Event("invalid"));
      formInput(container).dispatchEvent(new Event("invalid"));
    });
    await waitFor(() =>
      expect(status(container).textContent).toBe("Choose at least one file.")
    );
  });

  it("describes the trigger by a consumer's id on the error part", () => {
    function App({ id, part = true }: { id?: string; part?: boolean }) {
      return (
        <FileUpload aria-label="Files" required>
          <FileUploadDropzone>
            <FileUploadTrigger>Choose</FileUploadTrigger>
          </FileUploadDropzone>
          {part ? <FileUploadError id={id} /> : null}
        </FileUpload>
      );
    }
    const { container, rerender } = render(<App id="required-error" />);
    invalidate(container);
    const ids = () =>
      (trigger(container).getAttribute("aria-describedby") ?? "").split(" ");
    expect(ids()).toContain("required-error");
    expect(document.getElementById("required-error")).toHaveTextContent(
      "Choose at least one file."
    );
    for (const id of ids()) {
      expect(document.getElementById(id)).not.toBeNull();
    }

    rerender(<App id="renamed-required" />);
    expect(ids()).toEqual(["renamed-required"]);
    expect(document.getElementById("renamed-required")).not.toBeNull();

    rerender(<App part={false} />);
    expect(trigger(container)).not.toHaveAttribute("aria-describedby");
  });

  it("does not move focus", () => {
    const { container } = render(
      <>
        <button type="button">Elsewhere</button>
        <Uploader required withError />
      </>
    );
    screen.getByText("Elsewhere").focus();
    invalidate(container);
    expect(document.activeElement).toBe(screen.getByText("Elsewhere"));
  });

  it("announces but shows nothing when the app does not render the error part", async () => {
    const { container } = render(<Uploader required />);
    invalidate(container);
    expect(
      container.querySelector('[data-slot="file-upload-error"]')
    ).toBeNull();
    expect(trigger(container)).not.toHaveAttribute("aria-describedby");
    await waitFor(() =>
      expect(status(container)).toHaveTextContent("Choose at least one file.")
    );
  });

  it("lets children override the error text", () => {
    const { container } = render(
      <FileUpload required>
        <FileUploadTrigger>Choose</FileUploadTrigger>
        <FileUploadError>Add a file first.</FileUploadError>
      </FileUpload>
    );
    invalidate(container);
    expect(
      container.querySelector('[data-slot="file-upload-error"]')
    ).toHaveTextContent("Add a file first.");
  });

  it("is not entered while the committed value has files", () => {
    const { container } = render(
      <Uploader defaultValue={[makeFile("a")]} required withError />
    );
    invalidate(container);
    expect(
      container.querySelector('[data-slot="file-upload-error"]')
    ).toBeNull();
    expect(root(container)).not.toHaveAttribute("data-invalid");
  });

  it("shows each uploader's own error", () => {
    const { container } = render(
      <form>
        <Uploader required withError />
        <Uploader required withError />
      </form>
    );
    const inputs = container.querySelectorAll<HTMLInputElement>(
      "input[data-file-upload-form-input]"
    );
    fireEvent.invalid(inputs[1] as HTMLInputElement);
    const errors = container.querySelectorAll(
      '[data-slot="file-upload-error"]'
    );
    expect(errors).toHaveLength(1);
    expect(
      container.querySelectorAll('[data-slot="file-upload"]')[1]
    ).toContainElement(errors[0] as HTMLElement);
  });

  it.each([
    [
      "a committed file",
      (p: FileUploadProps) => ({ ...p, value: [makeFile("a")] }),
    ],
    ["required={false}", (p: FileUploadProps) => ({ ...p, required: false })],
    ["disabled", (p: FileUploadProps) => ({ ...p, disabled: true })],
  ])("clears on %s and keeps the app's aria-invalid", (_, change) => {
    const base: FileUploadProps = {
      "aria-invalid": true,
      required: true,
      value: [],
    };
    const { container, rerender } = render(<Uploader {...base} withError />);
    invalidate(container);
    expect(
      container.querySelector('[data-slot="file-upload-error"]')
    ).not.toBeNull();
    rerender(<Uploader {...change(base)} withError />);
    expect(
      container.querySelector('[data-slot="file-upload-error"]')
    ).toBeNull();
    expect(root(container)).toHaveAttribute("data-invalid");
  });

  it("clears without the app's aria-invalid", () => {
    const { container, rerender } = render(
      <Uploader required value={[]} withError />
    );
    invalidate(container);
    expect(root(container)).toHaveAttribute("data-invalid");
    rerender(<Uploader required={false} value={[]} withError />);
    expect(root(container)).not.toHaveAttribute("data-invalid");
  });

  it("forwards focus from the form input to the trigger", () => {
    const { container } = render(<Uploader required />);
    formInput(container).focus();
    expect(document.activeElement).toBe(trigger(container));
  });

  it("can be entered again after an invalid event batched with a commit", () => {
    let set: (files: File[]) => void = () => undefined;
    function Parent() {
      const [files, setFiles] = useState<File[]>([]);
      set = setFiles;
      return (
        <Uploader
          multiple
          onValueChange={setFiles}
          required
          value={files}
          withError
        />
      );
    }
    const { container } = render(<Parent />);
    act(() => {
      // One handler: a validity check, then the app sets a file.
      formInput(container).dispatchEvent(new Event("invalid"));
      set([makeFile("a")]);
    });
    expect(
      container.querySelector('[data-slot="file-upload-error"]')
    ).toBeNull();
    act(() => set([]));
    invalidate(container);
    expect(
      container.querySelector('[data-slot="file-upload-error"]')
    ).not.toBeNull();
  });

  it("enters the error from the committed empty value while a transition suspends", async () => {
    const blocked = new Promise<void>(() => undefined);
    let begin: () => void = () => undefined;

    function Gate({ hold }: { hold: boolean }) {
      if (hold) {
        throw blocked;
      }
      return null;
    }

    function App() {
      const [state, setState] = useState<{ files: File[]; hold: boolean }>({
        files: [],
        hold: false,
      });
      begin = () => {
        startTransition(() => setState({ files: [makeFile("a")], hold: true }));
      };
      return (
        <Suspense fallback={<p>Loading</p>}>
          <Uploader required value={state.files} withError />
          <Gate hold={state.hold} />
        </Suspense>
      );
    }

    const { container } = render(<App />);
    await act(async () => {
      begin();
    });
    expect(names(container)).toEqual([]);
    invalidate(container);
    expect(
      container.querySelector('[data-slot="file-upload-error"]')
    ).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Form bridge (what jsdom can show; the rest is in Storybook)
// ---------------------------------------------------------------------------

describe("form bridge", () => {
  it("renders the form input with its attributes and keeps the picker unnamed", () => {
    const { container } = render(
      <Uploader form="f" multiple name="files" required />
    );
    const input = formInput(container);
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("form", "f");
    expect(input).toHaveAttribute("tabindex", "-1");
    expect(input).toHaveAttribute("aria-hidden", "true");
    expect(input.multiple).toBe(true);
    expect(picker(container)).not.toHaveAttribute("name");
    expect(picker(container)).toHaveAttribute("tabindex", "-1");
    expect(picker(container)).toHaveAttribute("aria-hidden", "true");
  });

  it("passes accept and capture to the picker only", () => {
    const { container } = render(
      <Uploader accept="image/*" capture="environment" multiple />
    );
    expect(picker(container)).toHaveAttribute("accept", "image/*");
    expect(picker(container)).toHaveAttribute("capture", "environment");
    expect(picker(container).multiple).toBe(true);
    expect(formInput(container)).not.toHaveAttribute("accept");
  });

  it("attempts no write and logs nothing without name or required", () => {
    const { container } = render(<Uploader multiple />);
    pick(container, [makeFile("a")]);
    expect(error).not.toHaveBeenCalled();
    expect(root(container)).not.toHaveAttribute("data-form-bridge");
  });

  it("enters the unsupported state when DataTransfer cannot be constructed", () => {
    // jsdom has no DataTransfer.
    const { container, rerender } = render(<Uploader name="files" required />);
    expect(root(container)).toHaveAttribute("data-form-bridge", "unsupported");
    expect(formInput(container)).not.toHaveAttribute("name");
    expect(formInput(container)).not.toHaveAttribute("required");
    expect(error).toHaveBeenCalledTimes(1);
    rerender(<Uploader name="files" required />);
    expect(formInput(container)).not.toHaveAttribute("name");
  });

  it("enters the unsupported state when assigning files throws", () => {
    class FakeDataTransfer {
      readonly list: File[] = [];
      readonly items = { add: (f: File) => this.list.push(f) };
      get files() {
        return this.list as unknown as FileList;
      }
    }
    vi.stubGlobal("DataTransfer", FakeDataTransfer);
    try {
      const { container } = render(<Uploader multiple name="files" />);
      expect(root(container)).not.toHaveAttribute("data-form-bridge");
      pick(container, [makeFile("a")]);
      expect(root(container)).toHaveAttribute(
        "data-form-bridge",
        "unsupported"
      );
      expect(formInput(container)).not.toHaveAttribute("name");
      expect(error).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("reset", () => {
  function setup(props: FileUploadProps, onReset?: React.FormEventHandler) {
    const onValueChange = vi.fn();
    const utils = render(
      <form onReset={onReset}>
        <Uploader multiple onValueChange={onValueChange} withError {...props} />
      </form>
    );
    const form = utils.container.querySelector("form") as HTMLFormElement;
    return { ...utils, form, onValueChange };
  }

  it("empties an uncontrolled value and announces it as cleared", async () => {
    const a = makeFile("a");
    const { container, form, onValueChange } = setup({});
    pick(container, [a]);
    onValueChange.mockClear();
    act(() => form.reset());
    await waitFor(() => expect(rows(container)).toHaveLength(0));
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({
      reason: "reset",
      added: [],
      removed: [a],
    });
    await waitFor(() =>
      expect(status(container)).toHaveTextContent("All files removed.")
    );
  });

  it("returns to a non-empty default value and announces nothing", async () => {
    const d = makeFile("default");
    const { container, form, onValueChange } = setup({ defaultValue: [d] });
    const extra = makeFile("extra");
    pick(container, [extra]);
    await waitFor(() =>
      expect(status(container)).toHaveTextContent("extra added.")
    );
    status(container).textContent = "";
    onValueChange.mockClear();
    act(() => form.reset());
    await waitFor(() => expect(names(container)).toEqual(["default"]));
    expect(onValueChange.mock.calls[0]?.[1]).toMatchObject({
      reason: "reset",
      added: [],
      removed: [extra],
    });
    await new Promise((r) => setTimeout(r, 200));
    expect(status(container).textContent).toBe("");
  });

  it("asks a controlled parent to empty the value", async () => {
    const a = makeFile("a");
    const { form, onValueChange } = setup({ value: [a] });
    act(() => form.reset());
    await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(1));
    expect(onValueChange.mock.calls[0]).toEqual([
      [],
      expect.objectContaining({ reason: "reset", removed: [a], added: [] }),
    ]);
  });

  it("does nothing for a cancelled reset", async () => {
    const { container, form, onValueChange } = setup({}, (e) =>
      e.preventDefault()
    );
    pick(container, [makeFile("a")]);
    onValueChange.mockClear();
    act(() => form.reset());
    await new Promise((r) => setTimeout(r, 50));
    expect(rows(container)).toHaveLength(1);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clears the required error and the drag state but not the app's aria-invalid", async () => {
    const { container, form } = setup({ "aria-invalid": true, required: true });
    fireEvent.invalid(formInput(container));
    fireEvent.dragEnter(zone(container), { dataTransfer: dataTransfer([]) });
    expect(
      container.querySelector('[data-slot="file-upload-error"]')
    ).not.toBeNull();
    act(() => form.reset());
    await waitFor(() =>
      expect(
        container.querySelector('[data-slot="file-upload-error"]')
      ).toBeNull()
    );
    expect(zone(container)).not.toHaveAttribute("data-dragging");
    expect(root(container)).toHaveAttribute("data-invalid");
  });

  it("listens to an external form owner", async () => {
    const onValueChange = vi.fn();
    const a = makeFile("a");
    const { container } = render(
      <>
        <form id="outside" />
        <Uploader
          defaultValue={[a]}
          form="outside"
          multiple
          onValueChange={onValueChange}
        />
      </>
    );
    pick(container, [makeFile("extra")]);
    onValueChange.mockClear();
    act(() => (document.getElementById("outside") as HTMLFormElement).reset());
    await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(1));
    expect(onValueChange.mock.calls[0]?.[1].reason).toBe("reset");
  });

  describe("while a transition suspends", () => {
    const blocked = new Promise<void>(() => undefined);
    function Gate({ hold }: { hold: boolean }) {
      if (hold) {
        throw blocked;
      }
      return null;
    }

    async function resetAndRunTask(container: HTMLElement) {
      await act(async () => {
        (container.querySelector("form") as HTMLFormElement).reset();
        await new Promise((r) => setTimeout(r, 0));
      });
    }

    it("returns to the committed defaultValue", async () => {
      const a = makeFile("a");
      const b = makeFile("b");
      let begin: () => void = () => undefined;
      function App() {
        const [state, setState] = useState({ initial: [a], hold: false });
        begin = () => {
          startTransition(() => setState({ initial: [b], hold: true }));
        };
        return (
          <form>
            <Suspense fallback={<p>Loading</p>}>
              <Uploader defaultValue={state.initial} multiple />
              <Gate hold={state.hold} />
            </Suspense>
          </form>
        );
      }
      const { container } = render(<App />);
      pick(container, [makeFile("c")]);
      expect(names(container)).toEqual(["a", "c"]);
      await act(async () => {
        begin();
      });
      await resetAndRunTask(container);
      expect(names(container)).toEqual(["a"]);
    });

    it("writes nothing while the committed uploader has no name", async () => {
      const a = makeFile("a");
      let begin: () => void = () => undefined;
      function App() {
        const [state, setState] = useState<{
          name: string | undefined;
          hold: boolean;
        }>({ name: undefined, hold: false });
        begin = () => {
          startTransition(() => setState({ name: "files", hold: true }));
        };
        return (
          <form>
            <Suspense fallback={<p>Loading</p>}>
              <Uploader defaultValue={[a]} multiple name={state.name} />
              <Gate hold={state.hold} />
            </Suspense>
          </form>
        );
      }
      const { container } = render(<App />);
      await act(async () => {
        begin();
      });
      await resetAndRunTask(container);
      expect(root(container)).not.toHaveAttribute("data-form-bridge");
      expect(error).not.toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

describe("announcements", () => {
  it("announces a removal after a reset the parent refused", () => {
    vi.useFakeTimers();
    const a = makeFile("a");
    const b = makeFile("b");
    function Refusing() {
      const [files, setFiles] = useState([a, b]);
      return (
        <form>
          <Uploader
            multiple
            onValueChange={(next, details) => {
              if (details.reason !== "reset") {
                setFiles(next);
              }
            }}
            value={files}
          />
        </form>
      );
    }
    const { container } = render(<Refusing />);
    act(() => (container.querySelector("form") as HTMLFormElement).reset());
    act(() => {
      vi.advanceTimersToNextTimer();
    });
    expect(names(container)).toEqual(["a", "b"]);
    fireEvent.click(screen.getByRole("button", { name: "Remove a" }));
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(status(container).textContent).toBe("a removed.");
    fireEvent.click(screen.getByRole("button", { name: "Remove b" }));
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(status(container).textContent).toBe("b removed.");
  });

  it("announces committed additions and removals, one message per batch", async () => {
    const { container } = render(<Uploader multiple />);
    pick(container, [makeFile("a"), makeFile("b"), makeFile("c")]);
    await waitFor(() =>
      expect(status(container)).toHaveTextContent("3 files added.")
    );
    fireEvent.click(
      container.querySelector(
        '[data-slot="file-upload-item-remove"]'
      ) as HTMLElement
    );
    await waitFor(() =>
      expect(status(container)).toHaveTextContent("a removed.")
    );
  });

  it("announces a batch's rejection before its addition, as one update", async () => {
    const { container } = render(<Uploader maxSize={5} multiple />);
    pick(container, [
      makeFile("ok", { size: 1 }),
      makeFile("big", { size: 9 }),
    ]);
    await waitFor(() =>
      expect(status(container).textContent).toBe("big was not added. ok added.")
    );
  });

  it("keeps that order when a controlled parent commits synchronously", async () => {
    function Synchronous() {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <Uploader
          maxSize={5}
          multiple
          onValueChange={(next) => flushSync(() => setFiles(next))}
          value={files}
        />
      );
    }
    const { container } = render(<Synchronous />);
    pick(container, [
      makeFile("ok", { size: 1 }),
      makeFile("big", { size: 9 }),
    ]);
    await waitFor(() =>
      expect(status(container).textContent).toBe("big was not added. ok added.")
    );
  });

  it("speaks a repeated identical message again", async () => {
    const { container } = render(<Uploader maxSize={1} multiple />);
    const region = status(container);
    const texts: string[] = [];
    const observer = new MutationObserver(() =>
      texts.push(region.textContent ?? "")
    );
    observer.observe(region, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    pick(container, [makeFile("big", { size: 9 })]);
    await waitFor(() => expect(region).toHaveTextContent("big was not added."));
    pick(container, [makeFile("big", { size: 9 })]);
    await waitFor(() =>
      expect(texts.filter((t) => t === "big was not added.")).toHaveLength(2)
    );
    observer.disconnect();
    expect(texts).toContain("");
  });

  it("uses messages functions and lets null silence one announcement", async () => {
    const { container } = render(
      <Uploader
        maxSize={5}
        messages={{ added: (files) => `+${files.length}`, rejected: null }}
        multiple
      />
    );
    pick(container, [
      makeFile("ok", { size: 1 }),
      makeFile("big", { size: 9 }),
    ]);
    await waitFor(() => expect(status(container)).toHaveTextContent("+1"));
    await new Promise((r) => setTimeout(r, 200));
    expect(status(container).textContent).toBe("+1");
  });

  it("announces nothing and moves no focus when a controlled parent ignores a change", async () => {
    const a = makeFile("a");
    const { container } = render(
      <Uploader multiple onValueChange={() => undefined} value={[a]} />
    );
    const remove = container.querySelector<HTMLButtonElement>(
      '[data-slot="file-upload-item-remove"]'
    ) as HTMLButtonElement;
    remove.focus();
    fireEvent.click(remove);
    pick(container, [makeFile("b")]);
    await new Promise((r) => setTimeout(r, 200));
    expect(status(container).textContent).toBe("");
    expect(document.activeElement).toBe(remove);
  });

  it("announces when a delayed parent commits", async () => {
    function Delayed() {
      const [files, setFiles] = useState<File[]>([]);
      return (
        <Uploader
          multiple
          onValueChange={(next) => setTimeout(() => setFiles(next), 20)}
          value={files}
        />
      );
    }
    const { container } = render(<Delayed />);
    pick(container, [makeFile("late")]);
    expect(status(container).textContent).toBe("");
    await waitFor(() =>
      expect(status(container)).toHaveTextContent("late added.")
    );
  });

  describe("with a parent that commits proposals later, one by one", () => {
    /** Keeps every proposal; the test decides what to commit and when. */
    function setupDeferred() {
      const proposals: File[][] = [];
      let commit: (files: File[]) => void = () => undefined;
      function Deferred() {
        const [files, setFiles] = useState<File[]>([]);
        commit = setFiles;
        return (
          <Uploader
            multiple
            onValueChange={(next) => proposals.push(next)}
            value={files}
          />
        );
      }
      const utils = render(<Deferred />);
      const commitNow = (files: File[]) => act(() => commit(files));
      return { ...utils, proposals, commitNow };
    }
    const settle = () => act(() => new Promise((r) => setTimeout(r, 150)));

    it("announces each of two delayed proposals when it commits", async () => {
      const { container, proposals, commitNow } = setupDeferred();
      const a = makeFile("a");
      const b = makeFile("b");
      pick(container, [a]);
      pick(container, [b]);
      expect(proposals).toEqual([[a], [b]]);
      commitNow([a]);
      await settle();
      expect(status(container).textContent).toBe("a added.");
      // The second proposal as it was made: [b].
      commitNow(proposals[1] as File[]);
      await settle();
      expect(status(container).textContent).toBe("b added.");
    });

    it("announces a partial commit, then the rest", async () => {
      const { container, commitNow } = setupDeferred();
      const a = makeFile("a");
      const b = makeFile("b");
      pick(container, [a, b]);
      commitNow([a]);
      await settle();
      expect(status(container).textContent).toBe("a added.");
      commitNow([a, b]);
      await settle();
      expect(status(container).textContent).toBe("b added.");
    });

    it("forgets an older unresolved proposal once a newer one settles", async () => {
      const { container, commitNow } = setupDeferred();
      const a = makeFile("a");
      const b = makeFile("b");
      pick(container, [a]);
      pick(container, [b]);
      commitNow([b]);
      await settle();
      expect(status(container).textContent).toBe("b added.");
      // A later commit holding a is not announced: its proposal was discarded.
      status(container).textContent = "";
      commitNow([b, a]);
      await settle();
      expect(status(container).textContent).toBe("");
    });

    it("still announces the oldest of exactly fifty unresolved proposals", async () => {
      const { container, proposals, commitNow } = setupDeferred();
      const files = Array.from({ length: 50 }, (_, i) => makeFile(`f${i}`));
      for (const file of files) {
        pick(container, [file]);
      }
      expect(proposals).toHaveLength(50);
      commitNow(proposals[0] as File[]);
      await settle();
      expect(status(container).textContent).toBe("f0 added.");
    });

    it("keeps at most fifty unresolved proposals, dropping the oldest", async () => {
      const { container, proposals, commitNow } = setupDeferred();
      const files = Array.from({ length: 51 }, (_, i) => makeFile(`f${i}`));
      for (const file of files) {
        pick(container, [file]);
      }
      expect(proposals).toHaveLength(51);
      // The oldest was dropped: committing it now announces nothing.
      commitNow(proposals[0] as File[]);
      await settle();
      expect(status(container).textContent).toBe("");
      // A proposal still pending announces once when it commits.
      commitNow(proposals[1] as File[]);
      await settle();
      expect(status(container).textContent).toBe("f1 added.");
    });

    it("announces nothing for a value the app clears on its own", async () => {
      const { container, commitNow } = setupDeferred();
      const a = makeFile("a");
      pick(container, [a]);
      commitNow([a]);
      await settle();
      status(container).textContent = "";
      commitNow([]);
      await settle();
      expect(status(container).textContent).toBe("");
    });
  });

  function StatusRow({ status: s }: { status: FileUploadStatus }) {
    return (
      <FileUploadItem error="Network" status={s}>
        <FileUploadItemName />
      </FileUploadItem>
    );
  }

  it("announces no progress ticks", async () => {
    const file = makeFile("a.txt");
    function Ticking({ progress }: { progress: number }) {
      return (
        <FileUpload defaultValue={[file]}>
          <FileUploadList>
            {() => (
              <FileUploadItem progress={progress} status="uploading">
                <FileUploadItemProgress />
              </FileUploadItem>
            )}
          </FileUploadList>
        </FileUpload>
      );
    }
    const { container, rerender } = render(<Ticking progress={10} />);
    rerender(<Ticking progress={50} />);
    rerender(<Ticking progress={90} />);
    await act(() => new Promise((r) => setTimeout(r, 150)));
    expect(status(container).textContent).toBe("");
  });

  it("announces status transitions after mount, not a row that mounts as success", async () => {
    const a = makeFile("a");
    function App({ s }: { s: FileUploadStatus }) {
      return (
        <StrictMode>
          <FileUpload value={[a]}>
            <FileUploadList>{() => <StatusRow status={s} />}</FileUploadList>
          </FileUpload>
        </StrictMode>
      );
    }
    const { container, rerender } = render(<App s="success" />);
    await new Promise((r) => setTimeout(r, 200));
    expect(status(container).textContent).toBe("");
    rerender(<App s="uploading" />);
    rerender(<App s="error" />);
    await waitFor(() =>
      expect(status(container)).toHaveTextContent("a failed: Network")
    );
    rerender(<App s="success" />);
    await waitFor(() =>
      expect(status(container)).toHaveTextContent("a uploaded.")
    );
  });
});

// ---------------------------------------------------------------------------
// Rows: progress, error, name, size, hook
// ---------------------------------------------------------------------------

describe("row parts", () => {
  function Row(props: {
    status?: FileUploadStatus;
    progress?: number | null;
    error?: string;
    progressProps?: React.ComponentProps<typeof FileUploadItemProgress>;
    errorChildren?: React.ReactNode;
    withErrorPart?: boolean;
    name?: string;
  }) {
    const { withErrorPart = true } = props;
    return (
      <FileUpload
        defaultValue={[makeFile(props.name ?? "a.txt", { size: 1500 })]}
      >
        <FileUploadList>
          {() => (
            <FileUploadItem
              error={props.error}
              progress={props.progress}
              status={props.status}
            >
              <FileUploadItemName />
              <FileUploadItemSize />
              <FileUploadItemRemove />
              <FileUploadItemProgress {...props.progressProps} />
              {withErrorPart ? (
                <FileUploadItemError>{props.errorChildren}</FileUploadItemError>
              ) : null}
            </FileUploadItem>
          )}
        </FileUploadList>
      </FileUpload>
    );
  }

  function bar(container: HTMLElement) {
    return container.querySelector<HTMLElement>('[role="progressbar"]');
  }

  it("shows a finite upload value, clamped and named", () => {
    const { container, rerender } = render(
      <Row progress={42} status="uploading" />
    );
    expect(bar(container)).toHaveAttribute("aria-valuenow", "42");
    expect(bar(container)).toHaveAccessibleName("Upload progress for a.txt");
    expect(bar(container)).toHaveAttribute(
      "data-slot",
      "file-upload-item-progress"
    );
    rerender(<Row progress={140} status="uploading" />);
    expect(bar(container)).toHaveAttribute("aria-valuenow", "100");
    rerender(<Row progress={-5} status="uploading" />);
    expect(bar(container)).toHaveAttribute("aria-valuenow", "0");
  });

  it("is indeterminate for a non-finite upload value, with localisable text", () => {
    const { container } = render(
      <Row
        progress={null}
        progressProps={{
          getAriaValueText: (_formatted, value) =>
            value === null ? "Unbekannt" : `${value}`,
        }}
        status="uploading"
      />
    );
    expect(bar(container)).not.toHaveAttribute("aria-valuenow");
    expect(bar(container)).toHaveAttribute("aria-valuetext", "Unbekannt");
  });

  it("keeps a stopped value on error, in the destructive colour", () => {
    const { container } = render(<Row progress={30} status="error" />);
    expect(bar(container)).toHaveAttribute("aria-valuenow", "30");
    expect(bar(container)).toHaveAccessibleName("Upload progress for a.txt");
    expect(bar(container)?.className).toContain(
      "[--progress-indicator:var(--destructive)]"
    );
  });

  it("lets the consumer's color win over the error default", () => {
    const { container } = render(
      <Row progress={30} progressProps={{ color: "warning" }} status="error" />
    );
    expect(bar(container)?.className).toContain(
      "--progress-indicator:var(--warning"
    );
    expect(bar(container)?.className).not.toContain("var(--destructive)");
  });

  it.each([
    null,
    undefined,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])("renders no bar on error with progress %s", (progress) => {
    const { container } = render(<Row progress={progress} status="error" />);
    expect(bar(container)).toBeNull();
  });

  it.each(["idle", "success"] as const)("renders no bar while %s", (s) => {
    const { container } = render(<Row progress={50} status={s} />);
    expect(bar(container)).toBeNull();
  });

  it("shows the item error only on error, with the fallback text", () => {
    const { container, rerender } = render(
      <Row error="Boom" status="uploading" />
    );
    expect(
      container.querySelector('[data-slot="file-upload-item-error"]')
    ).toBeNull();
    rerender(<Row error="Boom" status="error" />);
    expect(
      container.querySelector('[data-slot="file-upload-item-error"]')
    ).toHaveTextContent("Boom");
    rerender(<Row status="error" />);
    expect(
      container.querySelector('[data-slot="file-upload-item-error"]')
    ).toHaveTextContent("Upload failed.");
    rerender(<Row errorChildren="Custom" status="error" />);
    expect(
      container.querySelector('[data-slot="file-upload-item-error"]')
    ).toHaveTextContent("Custom");
  });

  it("describes the remove button by a shown error, and never by an absent one", () => {
    const { container, rerender } = render(<Row error="Boom" status="error" />);
    const remove = () =>
      container.querySelector(
        '[data-slot="file-upload-item-remove"]'
      ) as HTMLElement;
    const errorEl = container.querySelector(
      '[data-slot="file-upload-item-error"]'
    ) as HTMLElement;
    expect(remove().getAttribute("aria-describedby")).toBe(errorEl.id);
    rerender(<Row error="Boom" status="error" withErrorPart={false} />);
    expect(remove()).not.toHaveAttribute("aria-describedby");
    rerender(<Row error="Boom" status="idle" />);
    expect(remove()).not.toHaveAttribute("aria-describedby");
  });

  it.each([
    ["report.pdf", ["report", ".pdf"]],
    [".env", [".env"]],
    ["trailing.", ["trailing."]],
    ["noext", ["noext"]],
    ["archive.verylongextension", ["archive.verylongextension"]],
  ])("splits %s into its parts", (name, parts) => {
    const { container } = render(<Row name={name} />);
    const el = container.querySelector<HTMLElement>(
      '[data-slot="file-upload-item-name"]'
    ) as HTMLElement;
    expect(el).toHaveAttribute("title", name);
    expect(el).toHaveAttribute("dir", "auto");
    expect(el.textContent).toBe(name);
    expect(Array.from(el.children).map((c) => c.textContent)).toEqual(parts);
  });

  it("formats the size with a 1000 divisor, and takes formatSize and children", () => {
    const { container } = render(<Row />);
    expect(
      container.querySelector('[data-slot="file-upload-item-size"]')
    ).toHaveTextContent(
      `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(1.5)} kB`
    );
    cleanup();
    const file = makeFile("a", { size: 999 });
    render(
      <FileUpload defaultValue={[file]}>
        <FileUploadList>
          {() => (
            <FileUploadItem>
              <FileUploadItemSize
                data-testid="fmt"
                formatSize={(b) => `${b}!`}
              />
              <FileUploadItemSize data-testid="child">
                custom
              </FileUploadItemSize>
            </FileUploadItem>
          )}
        </FileUploadList>
      </FileUpload>
    );
    expect(screen.getByTestId("fmt")).toHaveTextContent("999!");
    expect(screen.getByTestId("child")).toHaveTextContent("custom");
  });

  it("describes the remove button and the hook by a consumer's error id", () => {
    const hookIds: (string | undefined)[] = [];
    function Probe() {
      hookIds.push(useFileUploadItem().errorId);
      return null;
    }
    function App({ id, part = true }: { id?: string; part?: boolean }) {
      return (
        <FileUpload defaultValue={[makeFile("a.txt")]}>
          <FileUploadList>
            {() => (
              <FileUploadItem error="Boom" status="error">
                <Probe />
                <FileUploadItemRemove />
                {part ? <FileUploadItemError id={id} /> : null}
              </FileUploadItem>
            )}
          </FileUploadList>
        </FileUpload>
      );
    }
    const { container, rerender } = render(<App id="custom-error" />);
    const remove = () =>
      container.querySelector(
        '[data-slot="file-upload-item-remove"]'
      ) as HTMLElement;
    const described = () => remove().getAttribute("aria-describedby");
    expect(described()).toBe("custom-error");
    expect(document.getElementById("custom-error")).toHaveTextContent("Boom");
    expect(hookIds.at(-1)).toBe("custom-error");

    rerender(<App id="renamed-error" />);
    expect(described()).toBe("renamed-error");
    expect(document.getElementById("renamed-error")).toHaveTextContent("Boom");
    expect(hookIds.at(-1)).toBe("renamed-error");

    rerender(<App id="renamed-error" part={false} />);
    expect(remove()).not.toHaveAttribute("aria-describedby");
    expect(hookIds.at(-1)).toBeUndefined();
  });

  it("gives useFileUploadItem the row's metadata and error id", () => {
    const file = makeFile("a.txt", { size: 3, type: "text/plain" });
    const seen: ReturnType<typeof useFileUploadItem>[] = [];
    function Probe() {
      seen.push(useFileUploadItem());
      return null;
    }
    render(
      <FileUpload defaultValue={[file]}>
        <FileUploadList>
          {() => (
            <FileUploadItem error="x" progress={5} status="error">
              <Probe />
              <FileUploadItemError />
            </FileUploadItem>
          )}
        </FileUploadList>
      </FileUpload>
    );
    const last = seen.at(-1) as ReturnType<typeof useFileUploadItem>;
    expect(last).toMatchObject({
      name: "a.txt",
      size: 3,
      type: "text/plain",
      file,
      status: "error",
      progress: 5,
    });
    expect(typeof last.errorId).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// FileUploadList node form
// ---------------------------------------------------------------------------

describe("list node form", () => {
  it("warns for a row whose file is not in the value", async () => {
    render(
      <FileUpload value={[]}>
        <FileUploadList>
          <FileUploadItem file={makeFile("stray")} />
        </FileUploadList>
      </FileUpload>
    );
    await waitFor(() => expect(warned(NOT_IN_THE_VALUE_PATTERN)).toBe(true));
  });

  it("keeps the file's name out of that warning", async () => {
    render(
      <FileUpload value={[]}>
        <FileUploadList>
          <FileUploadItem file={makeFile("private-7f3a.pdf")} />
        </FileUploadList>
      </FileUpload>
    );
    await waitFor(() => expect(warned(NOT_IN_THE_VALUE_PATTERN)).toBe(true));
    const logged = warn.mock.calls.flat().map(String).join("\n");
    expect(logged).not.toContain("private-7f3a");
  });

  it("warns for a row with no file", async () => {
    render(
      <FileUpload value={[]}>
        <FileUploadList>
          <FileUploadItem />
        </FileUploadList>
      </FileUpload>
    );
    await waitFor(() => expect(warned(FILE_PATTERN)).toBe(true));
  });

  it("does not warn when the app's rows lag the value by one render", async () => {
    const a = makeFile("a");
    const b = makeFile("b");
    function Lagging() {
      const [value, setValue] = useState<File[]>([a, b]);
      const [rowsState, setRows] = useState<File[]>([a, b]);
      useEffect(() => {
        setRows(value);
      }, [value]);
      return (
        <FileUpload multiple onValueChange={setValue} value={value}>
          <FileUploadList>
            {rowsState.map((f) => (
              <FileUploadItem file={f} key={f.name}>
                <FileUploadItemRemove />
              </FileUploadItem>
            ))}
          </FileUploadList>
        </FileUpload>
      );
    }
    const { container } = render(<Lagging />);
    fireEvent.click(
      container.querySelector(
        '[data-slot="file-upload-item-remove"]'
      ) as HTMLElement
    );
    await waitFor(() => expect(rows(container)).toHaveLength(1));
    await new Promise((r) => setTimeout(r, 100));
    expect(warned(NOT_IN_THE_VALUE_PATTERN)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Focus repair
// ---------------------------------------------------------------------------

describe("focus repair", () => {
  function setup(props: FileUploadProps = {}, triggerProps = {}) {
    const files = [makeFile("a"), makeFile("b"), makeFile("c")];
    function App(p: FileUploadProps) {
      const [value, setValue] = useState(p.defaultValue ?? files);
      return (
        <FileUpload
          multiple
          onValueChange={setValue}
          value={p.value ?? value}
          {...p}
        >
          <FileUploadTrigger {...triggerProps}>Choose</FileUploadTrigger>
          <FileUploadList>{() => <DefaultRow />}</FileUploadList>
        </FileUpload>
      );
    }
    const utils = render(<App {...props} />);
    const remove = (name: string) =>
      screen.getByRole("button", { name: `Remove ${name}` });
    return { ...utils, App, remove, files };
  }

  it("moves to the next row's remove button", () => {
    const { remove } = setup();
    remove("a").focus();
    fireEvent.click(remove("a"));
    expect(document.activeElement).toBe(remove("b"));
  });

  it("moves to the previous row when the last row goes", () => {
    const { remove } = setup();
    remove("c").focus();
    fireEvent.click(remove("c"));
    expect(document.activeElement).toBe(remove("b"));
  });

  it("moves to the trigger when the only row goes", () => {
    const { remove, container } = setup({ defaultValue: [makeFile("solo")] });
    remove("solo").focus();
    fireEvent.click(remove("solo"));
    expect(document.activeElement).toBe(trigger(container));
  });

  it("moves to the root when the trigger is disabled", () => {
    const { remove, container } = setup(
      { defaultValue: [makeFile("solo")] },
      { disabled: true }
    );
    remove("solo").focus();
    fireEvent.click(remove("solo"));
    expect(document.activeElement).toBe(root(container));
    expect(root(container)).toHaveAttribute("tabindex", "-1");
  });

  it("does not move focus when a row without focus goes", () => {
    const { remove } = setup();
    remove("a").focus();
    fireEvent.click(remove("c"));
    expect(document.activeElement).toBe(remove("a"));
  });

  it("repairs focus only when a delayed parent commits the removal", async () => {
    const a = makeFile("a");
    const b = makeFile("b");
    function Delayed() {
      const [value, setValue] = useState([a, b]);
      return (
        <FileUpload
          multiple
          onValueChange={(next) => setTimeout(() => setValue(next), 30)}
          value={value}
        >
          <FileUploadTrigger>Choose</FileUploadTrigger>
          <FileUploadList>{() => <DefaultRow />}</FileUploadList>
        </FileUpload>
      );
    }
    render(<Delayed />);
    const removeA = screen.getByRole("button", { name: "Remove a" });
    removeA.focus();
    fireEvent.click(removeA);
    expect(document.activeElement).toBe(removeA);
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Remove b" })
      )
    );
  });

  describe("when the app's own rows follow the value one render later", () => {
    const a = makeFile("a");
    const b = makeFile("b");
    /** A child with its own row list; only it re-renders when it syncs. */
    function Rows({ value }: { value: File[] }) {
      const [rowsState, setRows] = useState(value);
      useEffect(() => setRows(value), [value]);
      return (
        <FileUploadList>
          {rowsState.map((file) => (
            <FileUploadItem file={file} key={file.name}>
              <FileUploadItemRemove />
            </FileUploadItem>
          ))}
        </FileUploadList>
      );
    }
    function App({ value }: { value: File[] }) {
      return (
        <FileUpload aria-label="Files" multiple value={value}>
          <FileUploadTrigger>Choose</FileUploadTrigger>
          <Rows value={value} />
        </FileUpload>
      );
    }

    it("moves to the surviving row's remove button", async () => {
      const { rerender } = render(<App value={[a, b]} />);
      screen.getByRole("button", { name: "Remove a" }).focus();
      rerender(<App value={[b]} />);
      await waitFor(() => expect(rows(document.body)).toHaveLength(1));
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Remove b" })
      );
    });

    it("moves to the trigger when the last row goes", async () => {
      const { rerender, container } = render(<App value={[a]} />);
      screen.getByRole("button", { name: "Remove a" }).focus();
      rerender(<App value={[]} />);
      await waitFor(() => expect(rows(document.body)).toHaveLength(0));
      expect(document.activeElement).toBe(trigger(container));
    });
  });

  it("repairs focus when the app removes the focused row", () => {
    const a = makeFile("a");
    const b = makeFile("b");
    function App({ value }: { value: File[] }) {
      return (
        <FileUpload multiple value={value}>
          <FileUploadTrigger>Choose</FileUploadTrigger>
          <FileUploadList>{() => <DefaultRow />}</FileUploadList>
        </FileUpload>
      );
    }
    const { rerender } = render(<App value={[a, b]} />);
    screen.getByRole("button", { name: "Remove a" }).focus();
    rerender(<App value={[b]} />);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Remove b" })
    );
  });
});

// ---------------------------------------------------------------------------
// Document drop guard
// ---------------------------------------------------------------------------

describe("document drop guard", () => {
  function docDragOver(init: object = {}) {
    const event = new Event("dragover", { bubbles: true, cancelable: true });
    Object.assign(event, { dataTransfer: dataTransfer([]), ...init });
    document.body.dispatchEvent(event);
    return event;
  }

  it("is off by default", () => {
    render(<Uploader />);
    expect(docDragOver().defaultPrevented).toBe(false);
  });

  it("prevents stray file drops while mounted and enabled", () => {
    const { rerender, unmount } = render(<Uploader preventDocumentDrop />);
    const event = docDragOver();
    expect(event.defaultPrevented).toBe(true);
    expect(
      (event as unknown as { dataTransfer: { dropEffect: string } })
        .dataTransfer.dropEffect
    ).toBe("none");
    rerender(<Uploader disabled preventDocumentDrop />);
    expect(docDragOver().defaultPrevented).toBe(false);
    rerender(<Uploader preventDocumentDrop />);
    unmount();
    expect(docDragOver().defaultPrevented).toBe(false);
  });

  it("keeps the guard while another guarded uploader is mounted", () => {
    const { rerender } = render(
      <>
        <Uploader preventDocumentDrop />
        <Uploader preventDocumentDrop />
      </>
    );
    rerender(<Uploader preventDocumentDrop />);
    expect(docDragOver().defaultPrevented).toBe(true);
  });

  it("skips non-file drags and file inputs", () => {
    render(<Uploader preventDocumentDrop />);
    const text = new Event("dragover", { bubbles: true, cancelable: true });
    Object.assign(text, { dataTransfer: dataTransfer([], ["text/plain"]) });
    document.body.dispatchEvent(text);
    expect(text.defaultPrevented).toBe(false);

    const native = document.createElement("input");
    native.type = "file";
    document.body.append(native);
    const onInput = new Event("dragover", { bubbles: true, cancelable: true });
    Object.assign(onInput, { dataTransfer: dataTransfer([]) });
    native.dispatchEvent(onInput);
    expect(onInput.defaultPrevented).toBe(false);
    native.remove();
  });
});

// ---------------------------------------------------------------------------
// Form mirror: every route a value can change by
// ---------------------------------------------------------------------------

describe("form mirror", () => {
  type SetterMode = "works" | "does nothing" | "throws";

  class FakeDataTransfer {
    readonly list: File[] = [];
    readonly items = { add: (file: File) => this.list.push(file) };
    get files() {
      return [...this.list] as unknown as FileList;
    }
  }

  /**
   * A storing `files` accessor on every input (jsdom's setter only takes a
   * real FileList), a `value = ""` that clears it, and the browser's clear
   * of a form's file inputs after an uncancelled reset event.
   */
  function installFileStore() {
    const store = new WeakMap<HTMLInputElement, File[]>();
    let mode: SetterMode = "works";
    const proto = HTMLInputElement.prototype;
    const files = Object.getOwnPropertyDescriptor(proto, "files");
    const value = Object.getOwnPropertyDescriptor(proto, "value");
    Object.defineProperty(proto, "files", {
      configurable: true,
      get(this: HTMLInputElement) {
        return (store.get(this) ?? []) as unknown as FileList;
      },
      set(this: HTMLInputElement, next: FileList) {
        if (mode === "throws") {
          throw new TypeError("files cannot be set");
        }
        if (mode === "works") {
          store.set(this, Array.from(next as unknown as File[]));
        }
      },
    });
    Object.defineProperty(proto, "value", {
      configurable: true,
      get(this: HTMLInputElement) {
        return value?.get?.call(this);
      },
      set(this: HTMLInputElement, next: string) {
        if (this.type === "file" && next === "") {
          store.set(this, []);
        } else {
          value?.set?.call(this, next);
        }
      },
    });
    const onReset = (event: Event) => {
      if (event.defaultPrevented) {
        return;
      }
      for (const element of Array.from(
        (event.target as HTMLFormElement).elements
      )) {
        if (element instanceof HTMLInputElement && element.type === "file") {
          store.set(element, []);
        }
      }
    };
    document.addEventListener("reset", onReset);
    vi.stubGlobal("DataTransfer", FakeDataTransfer);
    return {
      names: (input: HTMLInputElement) =>
        (store.get(input) ?? []).map((file) => file.name),
      setMode: (next: SetterMode) => {
        mode = next;
      },
      restore: () => {
        document.removeEventListener("reset", onReset);
        if (files) {
          Object.defineProperty(proto, "files", files);
        }
        if (value) {
          Object.defineProperty(proto, "value", value);
        }
        vi.unstubAllGlobals();
      },
    };
  }

  let fileStore: ReturnType<typeof installFileStore>;
  beforeEach(() => {
    // Fake timers: the reset's queued task runs exactly when a test says.
    vi.useFakeTimers();
    fileStore = installFileStore();
  });
  afterEach(() => {
    fileStore.restore();
  });

  type Policy = (
    next: File[],
    details: FileUploadChangeDetails,
    commit: (files: File[]) => void
  ) => void;

  let setOutside: (files: File[]) => void = () => undefined;
  function Controlled({
    initial,
    policy,
  }: {
    initial: File[];
    policy: Policy;
  }) {
    const [files, setFiles] = useState(initial);
    setOutside = setFiles;
    return (
      <form>
        <Uploader
          multiple
          name="files"
          onValueChange={(next, details) => policy(next, details, setFiles)}
          value={files}
        />
      </form>
    );
  }

  const a = makeFile("a");
  const b = makeFile("b");
  const c = makeFile("c");
  const d = makeFile("d");

  /** Runs the next queued task, reading the input in it, before React renders again. */
  function afterQueuedTask(read: () => void) {
    act(() => {
      vi.advanceTimersToNextTimer();
      read();
    });
  }

  interface Route {
    /** What the input must hold once the change is committed. */
    expected: string[];
    /**
     * Whether the change needs a write. When the browser already emptied the
     * input and the committed value is empty, nothing is written, so a
     * failing setter cannot fail there.
     */
    needsWrite: boolean;
    run: (container: HTMLElement) => Promise<void> | void;
    setup: () => ReturnType<typeof render>;
  }

  const reset = (container: HTMLElement) =>
    act(() => (container.querySelector("form") as HTMLFormElement).reset());

  const routes: Record<string, Route> = {
    "an addition": {
      setup: () =>
        render(
          <form>
            <Uploader multiple name="files" />
          </form>
        ),
      run: (container) => pick(container, [a]),
      expected: ["a"],
      needsWrite: true,
    },
    "the removal of the last file": {
      setup: () => {
        const utils = render(
          <form>
            <Uploader multiple name="files" />
          </form>
        );
        pick(utils.container, [a]);
        return utils;
      },
      run: () => {
        fireEvent.click(screen.getByRole("button", { name: "Remove a" }));
      },
      expected: [],
      needsWrite: true,
    },
    "a single-mode replacement": {
      setup: () => {
        const utils = render(
          <form>
            <Uploader name="file" />
          </form>
        );
        pick(utils.container, [a]);
        return utils;
      },
      run: (container) => pick(container, [b]),
      expected: ["b"],
      needsWrite: true,
    },
    "a reset of an uncontrolled value": {
      setup: () => {
        const utils = render(
          <form>
            <Uploader defaultValue={[d]} multiple name="files" />
          </form>
        );
        pick(utils.container, [a]);
        return utils;
      },
      run: (container) => reset(container),
      expected: ["d"],
      needsWrite: true,
    },
    "a reset a controlled parent accepts synchronously": {
      setup: () =>
        render(
          <Controlled
            initial={[a]}
            policy={(next, _, commit) => flushSync(() => commit(next))}
          />
        ),
      run: (container) => reset(container),
      expected: [],
      needsWrite: false,
    },
    "a reset a controlled parent answers synchronously with other files": {
      setup: () =>
        render(
          <Controlled
            initial={[a]}
            policy={(next, details, commit) =>
              flushSync(() => commit(details.reason === "reset" ? [c] : next))
            }
          />
        ),
      run: (container) => reset(container),
      expected: ["c"],
      needsWrite: true,
    },
    "a reset a controlled parent refuses": {
      setup: () =>
        render(
          <Controlled
            initial={[a]}
            policy={(next, details, commit) => {
              if (details.reason !== "reset") {
                commit(next);
              }
            }}
          />
        ),
      run: (container) => reset(container),
      expected: ["a"],
      needsWrite: true,
    },
    "an outside value change during the reset": {
      setup: () =>
        render(<Controlled initial={[a]} policy={() => undefined} />),
      run: (container) => {
        reset(container);
        act(() => setOutside([b]));
      },
      expected: ["b"],
      needsWrite: true,
    },
  };

  describe.each(Object.entries(routes))("after %s", (_, route) => {
    it("holds the committed files once the change has run", async () => {
      const { container } = route.setup();
      await route.run(container);
      let held: string[] = [];
      afterQueuedTask(() => {
        held = fileStore.names(formInput(container));
      });
      expect(held).toEqual(route.expected);
      expect(names(container)).toEqual(route.expected);
      expect(root(container)).not.toHaveAttribute("data-form-bridge");
      expect(error).not.toHaveBeenCalled();
    });

    it.each(["does nothing", "throws"] as const)(
      "latches the unsupported state once when the setter %s",
      async (mode) => {
        const { container } = route.setup();
        fileStore.setMode(mode);
        await route.run(container);
        let held: string[] = [];
        afterQueuedTask(() => {
          held = fileStore.names(formInput(container));
        });
        if (route.needsWrite) {
          expect(root(container)).toHaveAttribute(
            "data-form-bridge",
            "unsupported"
          );
          expect(held).toEqual([]);
          expect(formInput(container)).not.toHaveAttribute("name");
          expect(error).toHaveBeenCalledTimes(1);
        } else {
          expect(root(container)).not.toHaveAttribute("data-form-bridge");
          expect(held).toEqual(route.expected);
          expect(error).not.toHaveBeenCalled();
        }
      }
    );
  });

  it("follows a reset a controlled parent accepts a task later", async () => {
    const { container } = render(
      <Controlled
        initial={[a]}
        policy={(next, _, commit) => {
          setTimeout(() => commit(next), 0);
        }}
      />
    );
    reset(container);
    let held: string[] = [];
    afterQueuedTask(() => {
      held = fileStore.names(formInput(container));
    });
    // Not committed yet: the input holds what the list shows.
    expect(held).toEqual(["a"]);
    expect(names(container)).toEqual(["a"]);
    // The parent's own task commits the reset.
    act(() => {
      vi.advanceTimersToNextTimer();
    });
    expect(names(container)).toEqual([]);
    expect(fileStore.names(formInput(container))).toEqual([]);
    expect(error).not.toHaveBeenCalled();
  });

  it.each(["does nothing", "throws"] as const)(
    "latches the unsupported state once when the setter %s and the parent accepts a reset a task later",
    async (mode) => {
      const { container } = render(
        <Controlled
          initial={[a]}
          policy={(next, _, commit) => {
            setTimeout(() => commit(next), 0);
          }}
        />
      );
      fileStore.setMode(mode);
      reset(container);
      afterQueuedTask(() => undefined);
      act(() => {
        vi.advanceTimersToNextTimer();
      });
      expect(names(container)).toEqual([]);
      expect(root(container)).toHaveAttribute(
        "data-form-bridge",
        "unsupported"
      );
      expect(fileStore.names(formInput(container))).toEqual([]);
      expect(error).toHaveBeenCalledTimes(1);
    }
  );

  it("holds the value after name is removed, the form resets and name returns", () => {
    const ui = (name?: string) => (
      <form>
        <Uploader defaultValue={[a]} multiple name={name} />
      </form>
    );
    const { container, rerender } = render(ui("files"));
    expect(fileStore.names(formInput(container))).toEqual(["a"]);
    rerender(ui(undefined));
    reset(container);
    afterQueuedTask(() => undefined);
    rerender(ui("files"));
    expect(names(container)).toEqual(["a"]);
    expect(fileStore.names(formInput(container))).toEqual(["a"]);
  });

  it("holds the value after a reset whose onValueChange throws", () => {
    const { container } = render(
      <Controlled
        initial={[a]}
        policy={() => {
          throw new Error("app handler failed");
        }}
      />
    );
    reset(container);
    expect(() => afterQueuedTask(() => undefined)).toThrow(
      "app handler failed"
    );
    expect(names(container)).toEqual(["a"]);
    expect(fileStore.names(formInput(container))).toEqual(["a"]);
  });
});

// ---------------------------------------------------------------------------
// Nested uploaders: the outer one never acts on the inner one's events
// ---------------------------------------------------------------------------

describe("nested uploaders", () => {
  const outerChange = vi.fn();
  const outerRejected = vi.fn();
  const innerChange = vi.fn();
  const innerRejected = vi.fn();
  beforeEach(() => {
    for (const spy of [
      outerChange,
      outerRejected,
      innerChange,
      innerRejected,
    ]) {
      spy.mockClear();
    }
  });

  const stop = (event: { preventBaseUIHandler: () => void }) =>
    event.preventBaseUIHandler();

  const cases: Record<
    string,
    {
      inner?: Partial<FileUploadProps>;
      zone?: React.ComponentProps<typeof FileUploadDropzone>;
      /** What the inner uploader itself does with the event. */
      takes: "adds" | "rejects" | "nothing";
    }
  > = {
    "the inner one takes it": { takes: "adds" },
    "the inner one is disabled": {
      inner: { disabled: true },
      takes: "nothing",
    },
    "the inner one is full": { inner: { maxFiles: 0 }, takes: "rejects" },
    "the inner one's consumer cancels it": {
      inner: { onPaste: stop },
      zone: { onClick: stop, onDrop: stop },
      takes: "nothing",
    },
  };

  function Nested({
    inner,
    zone: zoneProps,
  }: {
    inner?: Partial<FileUploadProps>;
    zone?: React.ComponentProps<typeof FileUploadDropzone>;
  }) {
    return (
      <FileUpload
        allowPaste
        aria-label="Outer"
        multiple
        onFilesRejected={outerRejected}
        onValueChange={outerChange}
      >
        <FileUploadDropzone>
          <FileUploadTrigger>Outer</FileUploadTrigger>
          <FileUpload
            allowPaste
            aria-label="Inner"
            multiple
            onFilesRejected={innerRejected}
            onValueChange={innerChange}
            {...inner}
          >
            <FileUploadDropzone data-testid="inner-zone" {...zoneProps}>
              <p>Inner zone</p>
              <FileUploadTrigger>Inner</FileUploadTrigger>
            </FileUploadDropzone>
            <p>Inner, outside its zone</p>
          </FileUpload>
        </FileUploadDropzone>
      </FileUpload>
    );
  }

  function pickers() {
    const [innerPicker, outerPicker] = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        "input[data-file-upload-picker]"
      )
    );
    const inner = vi.fn();
    const outer = vi.fn();
    (innerPicker as HTMLInputElement).click = inner;
    (outerPicker as HTMLInputElement).click = outer;
    return { inner, outer };
  }

  function expectInner(takes: "adds" | "rejects" | "nothing") {
    expect(innerChange).toHaveBeenCalledTimes(takes === "adds" ? 1 : 0);
    expect(innerRejected).toHaveBeenCalledTimes(takes === "rejects" ? 1 : 0);
  }

  describe.each(Object.entries(cases))(
    "when %s",
    (_, { inner, zone: zoneProps, takes }) => {
      it("the outer one ignores a drop", () => {
        render(<Nested inner={inner} zone={zoneProps} />);
        drop(screen.getByTestId("inner-zone"), [makeFile("a")]);
        expectInner(takes);
        expect(outerChange).not.toHaveBeenCalled();
        expect(outerRejected).not.toHaveBeenCalled();
      });

      it("the outer one ignores a paste", () => {
        render(<Nested inner={inner} zone={zoneProps} />);
        const innerRoot = screen.getByRole("group", { name: "Inner" });
        innerRoot.focus();
        fireEvent.paste(innerRoot, {
          clipboardData: { files: [makeFile("a")] },
        });
        expectInner(takes);
        expect(outerChange).not.toHaveBeenCalled();
        expect(outerRejected).not.toHaveBeenCalled();
      });

      it("the outer one opens nothing for a click", () => {
        render(<Nested inner={inner} zone={zoneProps} />);
        const opened = pickers();
        fireEvent.click(screen.getByText("Inner zone"));
        expect(opened.inner).toHaveBeenCalledTimes(takes === "adds" ? 1 : 0);
        expect(opened.outer).not.toHaveBeenCalled();
      });
    }
  );

  describe("outside the inner one's zone, the outer zone still owns", () => {
    const outside = () => screen.getByText("Inner, outside its zone");

    it("a file dragover", () => {
      render(<Nested />);
      const dt = dataTransfer([]);
      const notPrevented = fireEvent.dragOver(outside(), { dataTransfer: dt });
      expect(notPrevented).toBe(false);
      expect(dt.dropEffect).toBe("copy");
    });

    it("a drop", () => {
      render(<Nested />);
      const notPrevented = fireEvent.drop(outside(), {
        dataTransfer: dataTransfer([fileItem(makeFile("a"))]),
      });
      expect(notPrevented).toBe(false);
      expect(outerChange).toHaveBeenCalledTimes(1);
      expect(innerChange).not.toHaveBeenCalled();
    });

    it("a click", () => {
      render(<Nested />);
      const opened = pickers();
      fireEvent.click(outside());
      expect(opened.outer).toHaveBeenCalledTimes(1);
      expect(opened.inner).not.toHaveBeenCalled();
    });
  });

  it.each([false, true])(
    "does not start the outer drag for an inner enter (disabled=%s)",
    (disabled) => {
      const { container } = render(<Nested inner={{ disabled }} />);
      fireEvent.dragEnter(screen.getByTestId("inner-zone"), {
        dataTransfer: dataTransfer([fileItem(makeFile("a"))]),
      });
      expect(root(container)).not.toHaveAttribute("data-dragging");
    }
  );

  it("does not decrement the outer drag counter for an inner leave", () => {
    const { container } = render(<Nested />);
    const transfer = dataTransfer([fileItem(makeFile("a"))]);
    fireEvent.dragEnter(zone(container), { dataTransfer: transfer });
    expect(root(container)).toHaveAttribute("data-dragging");
    fireEvent.dragLeave(screen.getByTestId("inner-zone"), {
      dataTransfer: transfer,
    });
    expect(root(container)).toHaveAttribute("data-dragging");
    fireEvent.dragLeave(zone(container), { dataTransfer: transfer });
    expect(root(container)).not.toHaveAttribute("data-dragging");
  });

  it("the outer zone's drag state ends while the drag is over the inner zone", () => {
    render(<Nested />);
    const outer = screen.getByRole("group", { name: "Outer" });
    const inner = screen.getByRole("group", { name: "Inner" });
    const outside = screen.getByText("Inner, outside its zone");
    const innerZone = screen.getByTestId("inner-zone");
    fireEvent.dragEnter(outside, { dataTransfer: dataTransfer([]) });
    expect(outer).toHaveAttribute("data-dragging");
    // The pointer moves onto the inner zone: enter the new target, leave the old.
    fireEvent.dragEnter(innerZone, { dataTransfer: dataTransfer([]) });
    fireEvent.dragLeave(outside, { dataTransfer: dataTransfer([]) });
    expect(outer).not.toHaveAttribute("data-dragging");
    expect(inner).toHaveAttribute("data-dragging");
    // And back out.
    fireEvent.dragEnter(outside, { dataTransfer: dataTransfer([]) });
    fireEvent.dragLeave(innerZone, { dataTransfer: dataTransfer([]) });
    expect(outer).toHaveAttribute("data-dragging");
    expect(inner).not.toHaveAttribute("data-dragging");
  });

  it("the outer one ignores a paste when the inner one leaves paste off", () => {
    render(<Nested inner={{ allowPaste: false }} />);
    const innerRoot = screen.getByRole("group", { name: "Inner" });
    innerRoot.focus();
    fireEvent.paste(innerRoot, { clipboardData: { files: [makeFile("a")] } });
    expect(innerChange).not.toHaveBeenCalled();
    expect(outerChange).not.toHaveBeenCalled();
  });

  it.each([
    ["disabled", { disabled: true }],
    ["full", { maxFiles: 0 }],
  ] as const)(
    "a %s inner one still keeps a file drop from opening the file",
    (_, inner) => {
      render(<Nested inner={inner} />);
      const notPrevented = fireEvent.drop(screen.getByTestId("inner-zone"), {
        dataTransfer: dataTransfer([fileItem(makeFile("a"))]),
      });
      expect(notPrevented).toBe(false);
    }
  );
});

describe("the picker's own click", () => {
  it("reaches a native ancestor listener once per activation", () => {
    const { container } = render(
      <div data-testid="ancestor">
        <Uploader />
      </div>
    );
    const ancestor = vi.fn();
    const onRoot = vi.fn();
    screen.getByTestId("ancestor").addEventListener("click", ancestor);
    root(container).addEventListener("click", onRoot);
    const opened = vi.fn();
    picker(container).addEventListener("click", (event) => {
      // jsdom would otherwise start a file selection.
      event.preventDefault();
      opened();
    });
    fireEvent.click(trigger(container));
    expect(opened).toHaveBeenCalledTimes(1);
    expect(ancestor).toHaveBeenCalledTimes(1);
    expect(onRoot).toHaveBeenCalledTimes(1);
    fireEvent.click(zone(container));
    expect(opened).toHaveBeenCalledTimes(2);
    expect(ancestor).toHaveBeenCalledTimes(2);
    expect(onRoot).toHaveBeenCalledTimes(2);
  });
});

describe("messages passed as undefined", () => {
  it("keep their English defaults", async () => {
    const { container } = render(
      <Uploader
        defaultValue={[makeFile("a.txt")]}
        messages={{
          removeLabel: undefined,
          removed: undefined,
          progressLabel: undefined,
          rejection: undefined,
        }}
        multiple
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Remove a.txt" }));
    await waitFor(() =>
      expect(status(container)).toHaveTextContent("a.txt removed.")
    );
  });

  it("keep the required text", () => {
    const { container } = render(
      <Uploader messages={{ required: undefined }} required withError />
    );
    fireEvent.invalid(formInput(container));
    expect(
      container.querySelector('[data-slot="file-upload-error"]')
    ).toHaveTextContent("Choose at least one file.");
  });
});

it("treats aria-invalid={null} like an absent aria-invalid", () => {
  const { container } = render(
    <Uploader aria-invalid={null as unknown as undefined} />
  );
  expect(root(container)).not.toHaveAttribute("data-invalid");
  expect(zone(container)).not.toHaveAttribute("data-invalid");
});
