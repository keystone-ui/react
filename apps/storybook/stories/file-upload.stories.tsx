import { Button } from "@keystoneui/react/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@keystoneui/react/field";
import {
  FileUpload,
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
} from "@keystoneui/react/file-upload";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
} from "@keystoneui/react/item";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileText as FileTextIcon, Upload as UploadIcon } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { flushSync } from "react-dom";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/FileUpload",
  component: FileUpload,
  parameters: {
    docs: {
      description: {
        component: `
Chooses files, validates them and keeps the list. It never uploads: the app
does that and tells each row its \`status\` and \`progress\`.

\`\`\`tsx
import {
  FileUpload, FileUploadDropzone, FileUploadItem, FileUploadItemName,
  FileUploadItemRemove, FileUploadItemSize, FileUploadList, FileUploadTrigger,
} from "@keystoneui/react/file-upload";
\`\`\`
        `,
      },
    },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

// Behaviour tests and review aids: out of the sidebar and the docs page,
// still run by Vitest (they keep Storybook's default `test` tag).
const TEST_ONLY: Story["tags"] = ["!dev", "!autodocs"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type RealUser = typeof import("vitest/browser").userEvent;

/** Vitest's real (Playwright) input; absent when Storybook runs the play. */
const realUser = () =>
  (globalThis as { __realUserEvent?: RealUser }).__realUserEvent;

const nextTask = () => new Promise((r) => setTimeout(r, 0));

function makeFile(name: string, content = "content", lastModified = 1) {
  return new File([content], name, { type: "text/plain", lastModified });
}

function transfer(files: File[]) {
  const dt = new DataTransfer();
  for (const file of files) {
    dt.items.add(file);
  }
  return dt;
}

function dispatchDrag(
  target: Element,
  type: string,
  dataTransfer: DataTransfer
) {
  const event = new DragEvent(type, {
    bubbles: true,
    cancelable: true,
    dataTransfer,
  });
  target.dispatchEvent(event);
  return event;
}

/**
 * Chromium ignores `dropEffect` writes on a constructed DataTransfer outside
 * a real drag, so record them on the instance instead.
 */
function recordDropEffect(dt: DataTransfer, initial = "none") {
  let effect = initial;
  Object.defineProperty(dt, "dropEffect", {
    configurable: true,
    get: () => effect,
    set: (value: string) => {
      effect = value;
    },
  });
  return () => effect;
}

function dropFiles(target: Element, files: File[]) {
  const dt = transfer(files);
  dispatchDrag(target, "dragenter", dt);
  dispatchDrag(target, "dragover", dt);
  return dispatchDrag(target, "drop", dt);
}

function q<T extends Element = HTMLElement>(
  root: ParentNode,
  selector: string
) {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing ${selector}`);
  }
  return element;
}

/** A button by accessible name. */
const button = (scope: ReturnType<typeof within>, label: string) =>
  scope.getByRole("button", { name: label });

const slot = (root: ParentNode, name: string) =>
  q(root, `[data-slot="${name}"]`);

const formInput = (root: ParentNode) =>
  q<HTMLInputElement>(root, "input[data-file-upload-form-input]");

const rowNames = (root: ParentNode) =>
  Array.from(
    root.querySelectorAll('[data-slot="file-upload-item-name"]'),
    (el) => el.textContent
  );

/** Resolves a CSS colour expression in the element's own context. */
function resolveColor(context: Element, color: string) {
  const probe = document.createElement("span");
  probe.style.color = color;
  context.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}

function entriesText(form: HTMLFormElement, name: string) {
  const entries = new FormData(form).getAll(name) as File[];
  return Promise.all(entries.map(async (f) => `${f.name}:${await f.text()}`));
}

function Row() {
  return (
    <FileUploadItem>
      <ItemMedia variant="icon">
        <FileTextIcon aria-hidden />
      </ItemMedia>
      <ItemContent>
        <FileUploadItemName />
        <FileUploadItemSize />
      </ItemContent>
      <ItemActions>
        <FileUploadItemRemove />
      </ItemActions>
      <FileUploadItemProgress />
      <FileUploadItemError />
    </FileUploadItem>
  );
}

function Zone({ label = "Choose files" }: { label?: string }) {
  return (
    <FileUploadDropzone>
      <UploadIcon aria-hidden className="size-5" />
      <p>Drag files here, or</p>
      <FileUploadTrigger render={<Button size="sm" variant="outline" />}>
        {label}
      </FileUploadTrigger>
    </FileUploadDropzone>
  );
}

function Basic(props: FileUploadProps) {
  return (
    <FileUpload aria-label="Attachments" className="w-96" {...props}>
      <Zone />
      <FileUploadList>{() => <Row />}</FileUploadList>
      <FileUploadError />
    </FileUpload>
  );
}

// ---------------------------------------------------------------------------
// Default: drop handling and drag state
// ---------------------------------------------------------------------------

/**
 * A constructed `DataTransfer` drop adds files; entering and leaving a child
 * keeps the drag state; a text drag is ignored; the drag-over border is
 * `--primary`. Synthetic events prove the handlers, not the OS defaults.
 */
export const Default: Story = {
  render: () => <Basic multiple />,
  play: async ({ canvasElement }) => {
    const zone = slot(canvasElement, "file-upload-dropzone");
    const child = within(zone).getByText("Drag files here, or");

    const textDrag = new DataTransfer();
    textDrag.setData("text/plain", "hello");
    dispatchDrag(zone, "dragenter", textDrag);
    const over = dispatchDrag(zone, "dragover", textDrag);
    await expect(over.defaultPrevented).toBe(false);
    await expect(zone).not.toHaveAttribute("data-dragging");

    const dt = transfer([makeFile("a.txt")]);
    await expect(Array.from(dt.types)).toContain("Files");
    dispatchDrag(zone, "dragenter", dt);
    dispatchDrag(child, "dragenter", dt);
    dispatchDrag(zone, "dragleave", dt);
    await waitFor(() => expect(zone).toHaveAttribute("data-dragging"));
    // Resolved outside waitFor: it re-runs on every DOM mutation, and the
    // probe element is one.
    const primary = resolveColor(zone, "var(--primary)");
    await waitFor(() =>
      expect(getComputedStyle(zone).borderTopColor).toBe(primary)
    );
    const effect = recordDropEffect(dt);
    const fileOver = dispatchDrag(zone, "dragover", dt);
    await expect(fileOver.defaultPrevented).toBe(true);
    await expect(effect()).toBe("copy");

    dispatchDrag(zone, "drop", dt);
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["a.txt"]));
    await expect(zone).not.toHaveAttribute("data-dragging");
  },
};

// ---------------------------------------------------------------------------
// With Field: rejections spoken by FieldError
// ---------------------------------------------------------------------------

function WithFieldDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ message: string }[]>([]);
  return (
    <Field className="w-96">
      <FieldLabel id="attachments-label">Attachments</FieldLabel>
      <FileUpload
        accept=".pdf,image/*"
        aria-describedby="attachments-hint attachments-error"
        aria-invalid={errors.length > 0}
        aria-labelledby="attachments-label"
        maxFiles={3}
        maxSize={10_000_000}
        messages={{ rejected: null }}
        multiple
        onFilesRejected={(rejections) =>
          setErrors(rejections.flatMap((r) => r.errors))
        }
        onValueChange={(next) => {
          setFiles(next);
          setErrors([]);
        }}
        value={files}
      >
        <Zone />
        <FileUploadList>{() => <Row />}</FileUploadList>
      </FileUpload>
      <FieldDescription id="attachments-hint">
        PDF or images, up to 10 MB each.
      </FieldDescription>
      <FieldError errors={errors} id="attachments-error" />
    </Field>
  );
}

/**
 * Rejections go to `FieldError`; the root's `aria-invalid` becomes
 * `data-invalid` with a `--destructive` border, and is rendered nowhere.
 */
export const WithField: Story = {
  render: () => <WithFieldDemo />,
  play: async ({ canvasElement }) => {
    const zone = slot(canvasElement, "file-upload-dropzone");
    const trigger = slot(canvasElement, "file-upload-trigger");
    await expect(trigger.getAttribute("aria-describedby")).toBe(
      "attachments-hint attachments-error"
    );
    dropFiles(zone, [makeFile("notes.txt")]);
    await waitFor(() =>
      expect(canvasElement).toHaveTextContent("not an accepted file type")
    );
    await expect(zone).toHaveAttribute("data-invalid");
    await expect(canvasElement.querySelector("[aria-invalid]")).toBeNull();
    const destructive = resolveColor(zone, "var(--destructive)");
    await waitFor(() =>
      expect(getComputedStyle(zone).borderTopColor).toBe(destructive)
    );
  },
};

// ---------------------------------------------------------------------------
// Row layout
// ---------------------------------------------------------------------------

function LayoutRow({
  file,
  status,
  progress,
  error,
  testId,
}: {
  file: File;
  status?: FileUploadStatus;
  progress?: number;
  error?: string;
  testId: string;
}) {
  return (
    <FileUploadItem
      data-testid={testId}
      error={error}
      file={file}
      progress={progress}
      status={status}
    >
      <ItemMedia variant="icon">
        <FileTextIcon aria-hidden />
      </ItemMedia>
      <ItemContent>
        <FileUploadItemName />
        <FileUploadItemSize />
      </ItemContent>
      <ItemActions>
        <FileUploadItemRemove />
      </ItemActions>
      <FileUploadItemProgress />
      <FileUploadItemError />
    </FileUploadItem>
  );
}

const layoutFiles = [
  makeFile("plain.pdf"),
  makeFile("uploading.pdf"),
  makeFile("failed.pdf"),
  makeFile("a-very-long-file-name-that-keeps-going-and-going-past-the-row.pdf"),
];

/**
 * Icon, content and actions share line 1; progress and error each take a
 * full line; a row with neither is one line; a long name truncates and the
 * remove button stays inside the row.
 */
export const RowLayout: Story = {
  tags: TEST_ONLY,
  render: () => (
    <FileUpload
      aria-label="Layout"
      className="w-96"
      multiple
      value={layoutFiles}
    >
      <FileUploadList>
        <LayoutRow file={layoutFiles[0] as File} testId="plain" />
        <LayoutRow
          file={layoutFiles[1] as File}
          progress={40}
          status="uploading"
          testId="uploading"
        />
        <LayoutRow
          error="The server refused the file."
          file={layoutFiles[2] as File}
          progress={60}
          status="error"
          testId="failed"
        />
        <LayoutRow file={layoutFiles[3] as File} testId="long" />
      </FileUploadList>
    </FileUpload>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const parts = (row: HTMLElement) => ({
      row: row.getBoundingClientRect(),
      media: slot(row, "item-media").getBoundingClientRect(),
      content: slot(row, "item-content").getBoundingClientRect(),
      actions: slot(row, "item-actions").getBoundingClientRect(),
    });
    const sameLine = (a: DOMRect, b: DOMRect) =>
      a.top < b.bottom && b.top < a.bottom;

    for (const id of ["plain", "uploading", "failed", "long"]) {
      const p = parts(canvas.getByTestId(id));
      // biome-ignore lint/performance/noAwaitInLoops: one row at a time
      await expect(sameLine(p.media, p.content)).toBe(true);
      await expect(sameLine(p.content, p.actions)).toBe(true);
    }

    // A row with neither progress nor error is one line.
    const plain = canvas.getByTestId("plain");
    const plainParts = parts(plain);
    const style = getComputedStyle(plain);
    const inner =
      plainParts.row.height -
      Number.parseFloat(style.paddingTop) -
      Number.parseFloat(style.paddingBottom) -
      Number.parseFloat(style.borderTopWidth) -
      Number.parseFloat(style.borderBottomWidth);
    await expect(Math.abs(inner - plainParts.content.height)).toBeLessThan(1);

    // Progress takes a full line under line 1.
    const uploading = canvas.getByTestId("uploading");
    const up = parts(uploading);
    const bar = slot(
      uploading,
      "file-upload-item-progress"
    ).getBoundingClientRect();
    await expect(bar.top).toBeGreaterThanOrEqual(up.content.bottom);
    await expect(Math.abs(bar.left - up.media.left)).toBeLessThan(1);
    await expect(Math.abs(bar.right - up.actions.right)).toBeLessThan(1);

    // Error takes its own full line under the progress.
    const failed = canvas.getByTestId("failed");
    const fp = parts(failed);
    const failedBar = slot(
      failed,
      "file-upload-item-progress"
    ).getBoundingClientRect();
    const error = slot(
      failed,
      "file-upload-item-error"
    ).getBoundingClientRect();
    await expect(failedBar.top).toBeGreaterThanOrEqual(fp.content.bottom);
    await expect(error.top).toBeGreaterThanOrEqual(failedBar.bottom);
    await expect(Math.abs(error.left - fp.media.left)).toBeLessThan(1);
    await expect(Math.abs(error.right - fp.actions.right)).toBeLessThan(1);
    await expect(
      getComputedStyle(slot(failed, "progress-indicator")).backgroundColor
    ).toBe(resolveColor(failed, "var(--destructive)"));

    // A long name truncates; the remove button stays inside the row.
    const long = canvas.getByTestId("long");
    const lp = parts(long);
    const base = q(slot(long, "file-upload-item-name"), "span");
    await expect(base.scrollWidth).toBeGreaterThan(base.clientWidth);
    await expect(lp.actions.right).toBeLessThanOrEqual(lp.row.right);
    await expect(
      slot(long, "file-upload-item-remove").getBoundingClientRect().right
    ).toBeLessThanOrEqual(lp.row.right);
    await expect(
      within(slot(long, "file-upload-item-name")).getByText(".pdf")
    ).toBeVisible();
  },
};

// ---------------------------------------------------------------------------
// Form submit: the bridge with a real FileList
// ---------------------------------------------------------------------------

function FormDemo({
  defaultValue,
  cancelReset = false,
}: {
  defaultValue?: File[];
  cancelReset?: boolean;
}) {
  return (
    <form
      className="flex w-96 flex-col gap-3"
      data-testid="form"
      encType="multipart/form-data"
      onReset={(event) => {
        if (cancelReset) {
          event.preventDefault();
        }
      }}
      onSubmit={(event) => event.preventDefault()}
    >
      <Basic defaultValue={defaultValue} multiple name="files" />
      <div className="flex gap-2">
        <Button type="reset" variant="outline">
          Reset
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}

/**
 * Picked bytes reach `FormData` (by content, so a same-named stale file would
 * fail); an empty value submits the one empty-name entry; a reset button and
 * `form.reset()` both re-write the input in a later task.
 */
export const FormSubmit: Story = {
  render: () => <FormDemo />,
  play: async ({ canvasElement }) => {
    const form = q<HTMLFormElement>(canvasElement, "form");
    const zone = slot(canvasElement, "file-upload-dropzone");

    // Nothing chosen: one entry, a File with an empty name.
    const empty = new FormData(form).getAll("files") as File[];
    await expect(empty).toHaveLength(1);
    await expect(empty[0]?.name).toBe("");
    await expect(empty[0]?.type).toBe("application/octet-stream");

    dropFiles(zone, [makeFile("a.txt", "one", 1), makeFile("b.txt", "two", 2)]);
    await waitFor(() =>
      expect(rowNames(canvasElement)).toEqual(["a.txt", "b.txt"])
    );
    await waitFor(async () =>
      expect(await entriesText(form, "files")).toEqual([
        "a.txt:one",
        "b.txt:two",
      ])
    );

    // Removing one updates the submitted entries.
    q<HTMLButtonElement>(canvasElement, '[aria-label="Remove a.txt"]').click();
    await waitFor(async () =>
      expect(await entriesText(form, "files")).toEqual(["b.txt:two"])
    );

    // A reset button: the input is empty in the same task (the documented
    // gap), and the queued re-write in the next task keeps it empty, since
    // the value is now empty.
    q<HTMLButtonElement>(canvasElement, 'button[type="reset"]').click();
    const inGap = formInput(canvasElement).files?.length;
    await nextTask();
    // The next task holds the empty entry, never the removed file.
    const afterOneTask = (new FormData(form).getAll("files") as File[]).map(
      (f) => f.name
    );
    await expect(inGap).toBe(0);
    await expect(afterOneTask).toEqual([""]);
    await waitFor(() => expect(rowNames(canvasElement)).toEqual([]));
    await expect(formInput(canvasElement).files?.length).toBe(0);
  },
};

/**
 * A reset returns to a non-empty `defaultValue`: in the same task as
 * `form.reset()` the input is empty (unsupported read), and in a later task
 * it equals the list again. Measured for the button and for `form.reset()`.
 */
export const FormResetToDefault: Story = {
  tags: TEST_ONLY,
  name: "Form Reset To Default",
  render: () => <FormDemo defaultValue={[makeFile("kept.txt", "kept", 1)]} />,
  play: async ({ canvasElement }) => {
    const form = q<HTMLFormElement>(canvasElement, "form");
    const zone = slot(canvasElement, "file-upload-dropzone");
    await waitFor(async () =>
      expect(await entriesText(form, "files")).toEqual(["kept.txt:kept"])
    );

    for (const how of ["button", "method"] as const) {
      dropFiles(zone, [makeFile(`extra-${how}.txt`, "x", 5)]);
      // biome-ignore lint/performance/noAwaitInLoops: each reset runs after the last
      await waitFor(() => expect(rowNames(canvasElement)).toHaveLength(2));

      if (how === "button") {
        q<HTMLButtonElement>(canvasElement, 'button[type="reset"]').click();
      } else {
        form.reset();
      }
      // Same task: the browser has emptied the input. Read synchronously,
      // so no extra task slips in before the next one.
      const inGap = formInput(canvasElement).files?.length;
      await nextTask();
      const afterOneTask = await entriesText(form, "files");
      await expect(inGap).toBe(0);
      // The next task already holds the default, never the pre-reset files.
      await expect(afterOneTask).toEqual(["kept.txt:kept"]);
      await waitFor(() =>
        expect(rowNames(canvasElement)).toEqual(["kept.txt"])
      );
    }
  },
};

/** A cancelled reset leaves the files and the input as they were. */
export const FormResetCancelled: Story = {
  tags: TEST_ONLY,
  name: "Form Reset Cancelled",
  render: () => <FormDemo cancelReset />,
  play: async ({ canvasElement }) => {
    const form = q<HTMLFormElement>(canvasElement, "form");
    dropFiles(slot(canvasElement, "file-upload-dropzone"), [
      makeFile("a.txt", "one"),
    ]);
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["a.txt"]));
    form.reset();
    await nextTask();
    await nextTask();
    await expect(rowNames(canvasElement)).toEqual(["a.txt"]);
    await expect(await entriesText(form, "files")).toEqual(["a.txt:one"]);
  },
};

function ControlledRefusingReset() {
  const [files, setFiles] = useState<File[]>([makeFile("kept.txt", "kept")]);
  return (
    <form className="w-96" data-testid="form">
      <Basic
        multiple
        name="files"
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

/** A controlled parent that refuses a reset keeps its files in the input. */
export const FormResetRefused: Story = {
  tags: TEST_ONLY,
  name: "Form Reset Refused",
  render: () => <ControlledRefusingReset />,
  play: async ({ canvasElement }) => {
    const form = q<HTMLFormElement>(canvasElement, "form");
    await waitFor(async () =>
      expect(await entriesText(form, "files")).toEqual(["kept.txt:kept"])
    );
    form.reset();
    await nextTask();
    await nextTask();
    await waitFor(async () =>
      expect(await entriesText(form, "files")).toEqual(["kept.txt:kept"])
    );
    await expect(rowNames(canvasElement)).toEqual(["kept.txt"]);
  },
};

function ControlledAcceptingReset() {
  const [files, setFiles] = useState<File[]>([]);
  return (
    <form className="flex w-96 flex-col gap-3" data-testid="form">
      <Basic
        multiple
        name="files"
        onValueChange={(next) => flushSync(() => setFiles(next))}
        value={files}
      />
      <Button type="reset" variant="outline">
        Reset
      </Button>
    </form>
  );
}

/**
 * A controlled parent that commits a reset synchronously, inside
 * `onValueChange`: in the task after the reset the list is empty and the
 * form submits no file, for the button and for `form.reset()`.
 */
export const FormResetAccepted: Story = {
  tags: TEST_ONLY,
  name: "Form Reset Accepted",
  render: () => <ControlledAcceptingReset />,
  play: async ({ canvasElement }) => {
    const form = q<HTMLFormElement>(canvasElement, "form");
    const zone = slot(canvasElement, "file-upload-dropzone");
    for (const how of ["button", "method"] as const) {
      dropFiles(zone, [makeFile(`old-${how}.txt`, "old", 3)]);
      // biome-ignore lint/performance/noAwaitInLoops: each reset runs after the last
      await waitFor(async () =>
        expect(await entriesText(form, "files")).toEqual([`old-${how}.txt:old`])
      );
      if (how === "button") {
        q<HTMLButtonElement>(canvasElement, 'button[type="reset"]').click();
      } else {
        form.reset();
      }
      await nextTask();
      // Read at once: a later render of the root would hide a stale write.
      const submitted = (new FormData(form).getAll("files") as File[]).map(
        (f) => f.name
      );
      const shown = rowNames(canvasElement);
      await expect(shown).toEqual([]);
      await expect(submitted).toEqual([""]);
    }
  },
};

/** A same-named replacement must reach FormData, not just keep the label. */
export const FormSingleReplace: Story = {
  tags: TEST_ONLY,
  name: "Form Single Replace",
  render: () => (
    <form className="w-96">
      <Basic name="file" />
    </form>
  ),
  play: async ({ canvasElement }) => {
    const form = q<HTMLFormElement>(canvasElement, "form");
    const zone = slot(canvasElement, "file-upload-dropzone");
    dropFiles(zone, [makeFile("same.txt", "one", 1)]);
    await waitFor(async () =>
      expect(await entriesText(form, "file")).toEqual(["same.txt:one"])
    );
    dropFiles(zone, [makeFile("same.txt", "two", 2)]);
    await waitFor(async () =>
      expect(await entriesText(form, "file")).toEqual(["same.txt:two"])
    );
  },
};

// ---------------------------------------------------------------------------
// Form ownership, disabled, remount, two uploaders
// ---------------------------------------------------------------------------

function OwnershipDemo() {
  const [mounted, setMounted] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  return (
    <div className="flex w-96 flex-col gap-3">
      <form data-testid="outside" id="outside-form" />
      <Basic
        form="outside-form"
        multiple
        onValueChange={setFiles}
        value={files}
      />
      <form data-testid="two">
        <Basic multiple name="first" required />
        <Basic disabled multiple name="second" />
        {mounted ? (
          <Basic
            data-testid="remount"
            multiple
            name="third"
            onValueChange={setFiles}
            value={files}
          />
        ) : null}
      </form>
      <Button onClick={() => setMounted((m) => !m)} variant="outline">
        Toggle third
      </Button>
    </div>
  );
}

/**
 * An external `form` owner resets an unnamed, non-required uploader; a
 * disabled uploader contributes no entry; `required` fails `checkValidity()`
 * without moving focus and shows only that uploader's error; a form input
 * that mounts after files were chosen is populated.
 */
export const FormOwnership: Story = {
  tags: TEST_ONLY,
  name: "Form Ownership",
  render: () => <OwnershipDemo />,
  play: async ({ canvasElement }) => {
    const outside = q<HTMLFormElement>(
      canvasElement,
      '[data-testid="outside"]'
    );
    const two = q<HTMLFormElement>(canvasElement, '[data-testid="two"]');
    const zones = canvasElement.querySelectorAll(
      '[data-slot="file-upload-dropzone"]'
    );
    const roots = canvasElement.querySelectorAll('[data-slot="file-upload"]');

    // External owner, no name, no required.
    dropFiles(zones[0] as Element, [makeFile("shared.txt", "s")]);
    await waitFor(() =>
      expect(rowNames(roots[0] as Element)).toEqual(["shared.txt"])
    );
    outside.reset();
    await waitFor(() => expect(rowNames(roots[0] as Element)).toEqual([]));

    // required: checkValidity fails, focus stays, only the first shows an error.
    const elsewhere = button(within(canvasElement), "Toggle third");
    elsewhere.focus();
    await expect(two.checkValidity()).toBe(false);
    await expect(document.activeElement).toBe(elsewhere);
    await waitFor(() =>
      expect(
        (roots[1] as Element).querySelector('[data-slot="file-upload-error"]')
      ).not.toBeNull()
    );
    await expect(
      (roots[2] as Element).querySelector('[data-slot="file-upload-error"]')
    ).toBeNull();
    // Repeated checks keep one visible message.
    await expect(two.checkValidity()).toBe(false);
    await expect(
      (roots[1] as Element).querySelectorAll('[data-slot="file-upload-error"]')
    ).toHaveLength(1);

    // Disabled contributes nothing.
    await expect(new FormData(two).has("second")).toBe(false);

    // Remount after a selection: the new input is populated.
    dropFiles(zones[0] as Element, [makeFile("late.txt", "late")]);
    await waitFor(async () =>
      expect(await entriesText(two, "third")).toEqual(["late.txt:late"])
    );
    elsewhere.click();
    await waitFor(() => expect(new FormData(two).has("third")).toBe(false));
    elsewhere.click();
    await waitFor(async () =>
      expect(await entriesText(two, "third")).toEqual(["late.txt:late"])
    );
  },
};

// ---------------------------------------------------------------------------
// Unsupported bridge
// ---------------------------------------------------------------------------

function StubbedBridge({
  stub,
}: {
  stub: "setter" | "constructor" | "after" | "clear";
}) {
  const [shown, setShown] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  return (
    <form className="flex w-96 flex-col gap-3" data-testid={`form-${stub}`}>
      <Button onClick={() => setShown(true)} variant="outline">
        Mount {stub}
      </Button>
      {shown ? (
        <Basic
          multiple
          name="files"
          onValueChange={setFiles}
          required
          value={files}
        />
      ) : null}
      <output data-testid="count">{files.length}</output>
    </form>
  );
}

/**
 * With the `files` setter stubbed to a no-op, the first selection after an
 * empty mount fails the check: `data-form-bridge="unsupported"`, `name` and
 * `required` removed, the input empty, and rerenders do not restore them.
 * With the constructor stubbed out, the same happens at mount.
 */
export const UnsupportedBridge: Story = {
  tags: TEST_ONLY,
  name: "Unsupported Bridge",
  render: () => (
    <div className="flex flex-col gap-6">
      <StubbedBridge stub="setter" />
      <StubbedBridge stub="constructor" />
      <StubbedBridge stub="after" />
      <StubbedBridge stub="clear" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const errors: unknown[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => errors.push(args[0]);
    try {
      // Setter that does nothing.
      button(canvas, "Mount setter").click();
      const form = q<HTMLFormElement>(
        canvasElement,
        '[data-testid="form-setter"]'
      );
      await waitFor(() => slot(form, "file-upload"));
      const input = formInput(form);
      Object.defineProperty(input, "files", {
        configurable: true,
        get: () => new DataTransfer().files,
        set: () => undefined,
      });
      await expect(slot(form, "file-upload")).not.toHaveAttribute(
        "data-form-bridge"
      );
      dropFiles(slot(form, "file-upload-dropzone"), [makeFile("a.txt")]);
      await waitFor(() =>
        expect(slot(form, "file-upload")).toHaveAttribute(
          "data-form-bridge",
          "unsupported"
        )
      );
      await expect(input).not.toHaveAttribute("name");
      await expect(input.required).toBe(false);
      await expect(form.checkValidity()).toBe(true);
      // The app still has the value.
      await expect(q(form, '[data-testid="count"]')).toHaveTextContent("1");
      dropFiles(slot(form, "file-upload-dropzone"), [makeFile("b.txt")]);
      await waitFor(() =>
        expect(q(form, '[data-testid="count"]')).toHaveTextContent("2")
      );
      await expect(input).not.toHaveAttribute("name");
      await expect(new FormData(form).has("files")).toBe(false);
      await expect(errors).toHaveLength(1);

      // Constructor stubbed out.
      const saved = globalThis.DataTransfer;
      (globalThis as { DataTransfer?: unknown }).DataTransfer = undefined;
      try {
        button(canvas, "Mount constructor").click();
        const second = q<HTMLFormElement>(
          canvasElement,
          '[data-testid="form-constructor"]'
        );
        await waitFor(() =>
          expect(slot(second, "file-upload")).toHaveAttribute(
            "data-form-bridge",
            "unsupported"
          )
        );
        await expect(formInput(second)).not.toHaveAttribute("name");
        await expect(formInput(second).required).toBe(false);
        await expect(formInput(second).files?.length).toBe(0);
        await expect(new FormData(second).has("files")).toBe(false);
        await expect(second.checkValidity()).toBe(true);
      } finally {
        globalThis.DataTransfer = saved;
      }
      await expect(errors).toHaveLength(2);

      // A failure after an earlier successful write empties the input.
      button(canvas, "Mount after").click();
      const third = q<HTMLFormElement>(
        canvasElement,
        '[data-testid="form-after"]'
      );
      await waitFor(() => slot(third, "file-upload"));
      dropFiles(slot(third, "file-upload-dropzone"), [
        makeFile("ok.txt", "ok"),
      ]);
      await waitFor(async () =>
        expect(await entriesText(third, "files")).toEqual(["ok.txt:ok"])
      );
      const thirdInput = formInput(third);
      const real = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "files"
      );
      Object.defineProperty(thirdInput, "files", {
        configurable: true,
        get: () => real?.get?.call(thirdInput),
        set: () => undefined,
      });
      dropFiles(slot(third, "file-upload-dropzone"), [
        makeFile("next.txt", "n"),
      ]);
      await waitFor(() =>
        expect(slot(third, "file-upload")).toHaveAttribute(
          "data-form-bridge",
          "unsupported"
        )
      );
      await expect(thirdInput.files?.length).toBe(0);
      await expect(new FormData(third).has("files")).toBe(false);
      await expect(errors).toHaveLength(3);

      // Removing the last file when the clear does not take: unlike a
      // reset, a removal gets no clearing from the browser, so the check
      // must cover the empty write too.
      button(canvas, "Mount clear").click();
      const fourth = q<HTMLFormElement>(
        canvasElement,
        '[data-testid="form-clear"]'
      );
      await waitFor(() => slot(fourth, "file-upload"));
      dropFiles(slot(fourth, "file-upload-dropzone"), [
        makeFile("gone.txt", "gone"),
      ]);
      await waitFor(async () =>
        expect(await entriesText(fourth, "files")).toEqual(["gone.txt:gone"])
      );
      const fourthInput = formInput(fourth);
      Object.defineProperty(fourthInput, "files", {
        configurable: true,
        get: () => real?.get?.call(fourthInput),
        set: () => undefined,
      });
      q<HTMLButtonElement>(fourth, '[aria-label="Remove gone.txt"]').click();
      await waitFor(() =>
        expect(q(fourth, '[data-testid="count"]')).toHaveTextContent("0")
      );
      await waitFor(() =>
        expect(slot(fourth, "file-upload")).toHaveAttribute(
          "data-form-bridge",
          "unsupported"
        )
      );
      await expect(fourthInput.files?.length).toBe(0);
      await expect(new FormData(fourth).has("files")).toBe(false);
      // A later render does not bring name or required back.
      dropFiles(slot(fourth, "file-upload-dropzone"), [makeFile("new.txt")]);
      await waitFor(() =>
        expect(q(fourth, '[data-testid="count"]')).toHaveTextContent("1")
      );
      await expect(fourthInput).not.toHaveAttribute("name");
      await expect(fourthInput.required).toBe(false);
      await expect(errors).toHaveLength(4);
    } finally {
      console.error = original;
    }
  },
};

// ---------------------------------------------------------------------------
// Required validation
// ---------------------------------------------------------------------------

/**
 * An unnamed `required` uploader takes part in validation; an earlier invalid
 * field does not stop the uploader's own error; during the reset gap a
 * `checkValidity()` fails (the input is empty) but the required error is not
 * shown while the value still has files.
 */
export const RequiredValidation: Story = {
  tags: TEST_ONLY,
  name: "Required Validation",
  render: () => (
    <div className="flex w-96 flex-col gap-6">
      <form data-testid="unnamed">
        <input aria-label="Title" data-testid="title" required />
        <Basic multiple required />
      </form>
      <form data-testid="gap">
        <Basic
          defaultValue={[makeFile("kept.txt", "kept")]}
          multiple
          name="files"
          required
        />
      </form>
      <form data-testid="report">
        <Basic multiple name="report" required />
      </form>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const unnamed = q<HTMLFormElement>(
      canvasElement,
      '[data-testid="unnamed"]'
    );
    const title = q<HTMLInputElement>(canvasElement, '[data-testid="title"]');
    title.focus();
    await expect(unnamed.checkValidity()).toBe(false);
    await expect(formInput(unnamed).validity.valueMissing).toBe(true);
    await waitFor(() =>
      expect(slot(unnamed, "file-upload-error")).toHaveTextContent(
        "Choose at least one file."
      )
    );
    await expect(document.activeElement).toBe(title);
    title.value = "Report";
    dropFiles(slot(unnamed, "file-upload-dropzone"), [makeFile("a.txt")]);
    await waitFor(() => expect(unnamed.checkValidity()).toBe(true));
    await expect(
      unnamed.querySelector('[data-slot="file-upload-error"]')
    ).toBeNull();

    const gap = q<HTMLFormElement>(canvasElement, '[data-testid="gap"]');
    await waitFor(async () =>
      expect(await entriesText(gap, "files")).toEqual(["kept.txt:kept"])
    );
    gap.reset();
    // Read in the same task, before the queued re-write: React flushes a
    // discrete event's update synchronously, and one microtask covers the rest.
    const validInGap = gap.checkValidity();
    await Promise.resolve();
    const errorInGap = gap.querySelector('[data-slot="file-upload-error"]');
    const invalidInGap = slot(gap, "file-upload").hasAttribute("data-invalid");
    await expect(validInGap).toBe(false);
    await expect(errorInGap).toBeNull();
    await expect(invalidInGap).toBe(false);
    await nextTask();
    await nextTask();
    await expect(
      gap.querySelector('[data-slot="file-upload-error"]')
    ).toBeNull();
    await expect(slot(gap, "file-upload")).not.toHaveAttribute("data-invalid");
    await waitFor(() => expect(gap.checkValidity()).toBe(true));

    // Interactive validation: when the browser focuses the hidden form
    // input, focus moves on to the trigger.
    const report = q<HTMLFormElement>(canvasElement, '[data-testid="report"]');
    await expect(report.reportValidity()).toBe(false);
    await expect(document.activeElement).toBe(
      slot(report, "file-upload-trigger")
    );
  },
};

// ---------------------------------------------------------------------------
// Nested, paste, document guard
// ---------------------------------------------------------------------------

function NestedPair({
  id,
  inner,
  zone,
}: {
  id: string;
  inner?: Partial<FileUploadProps>;
  zone?: ComponentProps<typeof FileUploadDropzone>;
}) {
  return (
    <FileUpload
      allowPaste
      aria-label={`Outer ${id}`}
      className="w-96"
      data-testid={`outer-${id}`}
      multiple
    >
      <FileUploadDropzone>
        <FileUploadTrigger render={<Button size="sm" variant="outline" />}>
          Outer {id}
        </FileUploadTrigger>
        <FileUpload
          allowPaste
          aria-label={`Inner ${id}`}
          data-testid={`inner-${id}`}
          multiple
          {...inner}
        >
          <FileUploadDropzone {...zone}>
            <p>Inner zone {id}</p>
            <FileUploadTrigger render={<Button size="sm" variant="outline" />}>
              Inner {id}
            </FileUploadTrigger>
          </FileUploadDropzone>
          <FileUploadList>{() => <Row />}</FileUploadList>
        </FileUpload>
      </FileUploadDropzone>
      <FileUploadList>{() => <Row />}</FileUploadList>
    </FileUpload>
  );
}

const ownList = (root: Element) =>
  Array.from(
    root.querySelectorAll(
      ':scope > [data-slot="file-upload-list"] [data-slot="file-upload-item-name"]'
    ),
    (el) => el.textContent
  );

/** Counts the picker's clicks and keeps it from opening. */
function countPickerClicks(root: Element) {
  const count = { value: 0 };
  q(root, ":scope > input[data-file-upload-picker]").addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      count.value += 1;
    }
  );
  return count;
}

/**
 * Only the innermost uploader acts on a drop, paste or click inside it,
 * whether it takes the event, is disabled or its consumer cancels it; the
 * picker's own click reaches a native ancestor listener once per activation.
 */
export const Nested: Story = {
  tags: TEST_ONLY,
  render: () => (
    <div className="flex flex-col gap-6" data-testid="ancestor">
      <NestedPair id="takes" />
      <NestedPair
        id="cancelled"
        inner={{ onPaste: (event) => event.preventBaseUIHandler() }}
        zone={{
          onClick: (event) => event.preventBaseUIHandler(),
          onDrop: (event) => event.preventBaseUIHandler(),
        }}
      />
      <NestedPair id="disabled" inner={{ disabled: true }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const root = (testId: string) =>
      q(canvasElement, `[data-testid="${testId}"]`);
    const zoneOf = (testId: string) =>
      q(root(testId), ':scope > [data-slot="file-upload-dropzone"]');
    const paste = (target: HTMLElement) => {
      target.focus();
      target.dispatchEvent(
        new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: transfer([makeFile("pasted.txt")]),
        })
      );
    };

    // The inner uploader takes the drop; the outer one does not.
    dropFiles(zoneOf("inner-takes"), [makeFile("in.txt")]);
    await waitFor(() =>
      expect(ownList(root("inner-takes"))).toEqual(["in.txt"])
    );
    await expect(ownList(root("outer-takes"))).toEqual([]);

    // The inner consumer cancels: neither uploader takes the file.
    const cancelledClicks = countPickerClicks(root("outer-cancelled"));
    dropFiles(zoneOf("inner-cancelled"), [makeFile("dropped.txt")]);
    paste(root("inner-cancelled"));
    q(root("inner-cancelled"), "p").click();
    await nextTask();
    await expect(ownList(root("inner-cancelled"))).toEqual([]);
    await expect(ownList(root("outer-cancelled"))).toEqual([]);
    await expect(cancelledClicks.value).toBe(0);

    // A disabled inner uploader: the outer one takes nothing and opens nothing.
    const disabledClicks = countPickerClicks(root("outer-disabled"));
    dropFiles(zoneOf("inner-disabled"), [makeFile("dropped.txt")]);
    paste(root("inner-disabled"));
    q(root("inner-disabled"), "p").click();
    await nextTask();
    await expect(ownList(root("outer-disabled"))).toEqual([]);
    await expect(disabledClicks.value).toBe(0);

    // One click per activation for a native listener on an ancestor.
    const ancestor = root("ancestor");
    let seen = 0;
    const count = () => {
      seen += 1;
    };
    ancestor.addEventListener("click", count);
    const takesClicks = countPickerClicks(root("outer-takes"));
    try {
      button(within(canvasElement), "Outer takes").click();
      await expect(takesClicks.value).toBe(1);
      await expect(seen).toBe(1);
      zoneOf("outer-takes").click();
      await expect(takesClicks.value).toBe(2);
      await expect(seen).toBe(2);
    } finally {
      ancestor.removeEventListener("click", count);
    }

    // A file drag entering an inner zone shows no drag state on the outer zone.
    const enterTakes = transfer([makeFile("drag.txt")]);
    dispatchDrag(zoneOf("inner-takes"), "dragenter", enterTakes);
    await waitFor(() =>
      expect(zoneOf("inner-takes")).toHaveAttribute("data-dragging")
    );
    await expect(zoneOf("outer-takes")).not.toHaveAttribute("data-dragging");
    dispatchDrag(zoneOf("inner-takes"), "dragleave", enterTakes);
    await waitFor(() =>
      expect(zoneOf("inner-takes")).not.toHaveAttribute("data-dragging")
    );

    dispatchDrag(
      zoneOf("inner-disabled"),
      "dragenter",
      transfer([makeFile("drag.txt")])
    );
    await nextTask();
    await expect(zoneOf("inner-disabled")).not.toHaveAttribute("data-dragging");
    await expect(zoneOf("outer-disabled")).not.toHaveAttribute("data-dragging");
  },
};

/**
 * Paste is opt-in. A paste into an editable child is untouched; a file paste
 * on a non-editable target inside is consumed.
 */
export const Paste: Story = {
  tags: TEST_ONLY,
  render: () => (
    <FileUpload allowPaste aria-label="Paste" className="w-96" multiple>
      <textarea aria-label="Note" className="rounded-md border p-2" />
      <Zone />
      <FileUploadList>{() => <Row />}</FileUploadList>
    </FileUpload>
  ),
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByLabelText("Note");
    const trigger = slot(canvasElement, "file-upload-trigger");
    const paste = (target: HTMLElement) => {
      const dt = transfer([makeFile("pasted.png")]);
      dt.setData("text/plain", "caption");
      const event = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: dt,
      });
      target.dispatchEvent(event);
      return event;
    };
    textarea.focus();
    await expect(paste(textarea).defaultPrevented).toBe(false);
    await expect(rowNames(canvasElement)).toEqual([]);
    trigger.focus();
    await expect(paste(trigger).defaultPrevented).toBe(true);
    await waitFor(() =>
      expect(rowNames(canvasElement)).toEqual(["pasted.png"])
    );
  },
};

function GuardDemo() {
  const [mounted, setMounted] = useState(true);
  const [disabled, setDisabled] = useState(false);
  return (
    <div className="flex w-96 flex-col gap-3">
      <input aria-label="Native file input" data-testid="native" type="file" />
      <Button onClick={() => setDisabled((d) => !d)} variant="outline">
        Toggle disabled
      </Button>
      <Button onClick={() => setMounted((m) => !m)} variant="outline">
        Toggle mounted
      </Button>
      {mounted ? <Basic disabled={disabled} preventDocumentDrop /> : null}
    </div>
  );
}

/**
 * The opted-in page guard prevents stray file drops, skips events already
 * prevented and file inputs, and lives only while mounted and enabled.
 */
export const DocumentGuard: Story = {
  tags: TEST_ONLY,
  name: "Document Guard",
  render: () => <GuardDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stray = () =>
      dispatchDrag(document.body, "dragover", transfer([makeFile("x")]));

    const strayTransfer = transfer([makeFile("x")]);
    const strayEffect = recordDropEffect(strayTransfer, "copy");
    const event = dispatchDrag(document.body, "dragover", strayTransfer);
    await expect(event.defaultPrevented).toBe(true);
    await expect(strayEffect()).toBe("none");

    const native = q(canvasElement, '[data-testid="native"]');
    await expect(
      dispatchDrag(native, "dragover", transfer([makeFile("x")]))
        .defaultPrevented
    ).toBe(false);

    const accepted = transfer([makeFile("x")]);
    const already = new DragEvent("dragover", {
      bubbles: true,
      cancelable: true,
      dataTransfer: accepted,
    });
    const acceptedEffect = recordDropEffect(accepted, "copy");
    already.preventDefault();
    document.body.dispatchEvent(already);
    await expect(acceptedEffect()).toBe("copy");

    button(canvas, "Toggle disabled").click();
    await waitFor(() => expect(stray().defaultPrevented).toBe(false));
    button(canvas, "Toggle disabled").click();
    await waitFor(() => expect(stray().defaultPrevented).toBe(true));
    button(canvas, "Toggle mounted").click();
    await waitFor(() => expect(stray().defaultPrevented).toBe(false));
  },
};

// ---------------------------------------------------------------------------
// States: disabled, focus, single, eager upload, edit form
// ---------------------------------------------------------------------------

/** Disabled: the zone is at opacity 0.5 and both inputs are disabled. */
export const Disabled: Story = {
  render: () => (
    <Basic defaultValue={[makeFile("chosen.pdf")]} disabled name="files" />
  ),
  play: async ({ canvasElement }) => {
    const zone = slot(canvasElement, "file-upload-dropzone");
    await expect(getComputedStyle(zone).opacity).toBe("0.5");
    await expect(getComputedStyle(zone).cursor).toBe("not-allowed");
    await expect(formInput(canvasElement)).toBeDisabled();
    await expect(
      q<HTMLInputElement>(canvasElement, "input[data-file-upload-picker]")
    ).toBeDisabled();
  },
};

/** The trigger is the keyboard path: Tab reaches it with a 2px outline. */
export const TriggerFocus: Story = {
  tags: TEST_ONLY,
  name: "Trigger Focus",
  render: () => <Basic />,
  play: async ({ canvasElement }) => {
    const trigger = slot(canvasElement, "file-upload-trigger");
    const user = realUser();
    if (!user) {
      // Storybook's own runner: a synthetic Tab proves the order, not the
      // focus-visible outline, which needs real keyboard input.
      await userEvent.tab();
      await expect(document.activeElement).toBe(trigger);
      return;
    }
    await user.tab();
    await expect(document.activeElement).toBe(trigger);
    await expect(getComputedStyle(trigger).outlineWidth).toBe("2px");
    await expect(getComputedStyle(trigger).outlineStyle).toBe("solid");
  },
};

/** Single mode replaces its file and keeps one row. */
export const Single: Story = {
  render: () => <Basic />,
  play: async ({ canvasElement }) => {
    const zone = slot(canvasElement, "file-upload-dropzone");
    dropFiles(zone, [makeFile("first.pdf")]);
    await waitFor(() => expect(rowNames(canvasElement)).toEqual(["first.pdf"]));
    dropFiles(zone, [makeFile("second.pdf")]);
    await waitFor(() =>
      expect(rowNames(canvasElement)).toEqual(["second.pdf"])
    );
  },
};

function EagerDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState(
    () =>
      new Map<
        File,
        { status: FileUploadStatus; progress: number; error?: string }
      >()
  );
  const update = (
    file: File,
    next: { status: FileUploadStatus; progress: number; error?: string }
  ) => setState((prev) => new Map(prev).set(file, next));
  return (
    <FileUpload
      aria-label="Eager"
      className="w-96"
      multiple
      onValueChange={(next, details) => {
        setFiles(next);
        for (const file of details.added) {
          update(file, { status: "uploading", progress: 30 });
          setTimeout(
            () =>
              update(
                file,
                file.name.startsWith("bad")
                  ? { status: "error", progress: 30, error: "Network error" }
                  : { status: "success", progress: 100 }
              ),
            50
          );
        }
      }}
      value={files}
    >
      <Zone />
      <FileUploadList>
        {(file) => {
          const u = state.get(file);
          return (
            <FileUploadItem
              error={u?.error}
              progress={u?.progress}
              status={u?.status}
            >
              <ItemContent>
                <FileUploadItemName />
                <FileUploadItemSize />
              </ItemContent>
              <ItemActions>
                <FileUploadItemRemove />
              </ItemActions>
              <FileUploadItemProgress />
              <FileUploadItemError />
            </FileUploadItem>
          );
        }}
      </FileUploadList>
    </FileUpload>
  );
}

/** Status and progress come from the app; transitions are announced. */
export const EagerUpload: Story = {
  name: "Eager Upload",
  render: () => <EagerDemo />,
  play: async ({ canvasElement }) => {
    dropFiles(slot(canvasElement, "file-upload-dropzone"), [
      makeFile("good.pdf"),
      makeFile("bad.pdf"),
    ]);
    await waitFor(() =>
      expect(
        canvasElement.querySelectorAll('[role="progressbar"]')
      ).toHaveLength(2)
    );
    await waitFor(() =>
      expect(
        q(canvasElement, '[data-slot="file-upload-item-error"]')
      ).toHaveTextContent("Network error")
    );
    const remove = q<HTMLButtonElement>(
      canvasElement,
      '[aria-label="Remove bad.pdf"]'
    );
    await expect(remove.getAttribute("aria-describedby")).toBe(
      q(canvasElement, '[data-slot="file-upload-item-error"]').id
    );
    await waitFor(() =>
      expect(q(canvasElement, '[role="status"]').textContent).toMatch(
        /good\.pdf uploaded\.|bad\.pdf failed: Network error/
      )
    );
  },
};

const SAVED = [
  { id: "1", fileName: "contract.pdf" },
  { id: "2", fileName: "invoice.pdf" },
];

function EditFormDemo() {
  const [saved, setSaved] = useState(SAVED);
  const [files, setFiles] = useState<File[]>([]);
  const limit = 2;
  const remaining = Math.max(0, limit - saved.length);
  return (
    <div className="flex w-96 flex-col gap-3">
      <ItemGroup>
        {saved.map((s) => (
          <Item key={s.id} role="listitem" size="sm">
            <ItemContent>{s.fileName}</ItemContent>
            <ItemActions>
              <Button
                onClick={() =>
                  setSaved((all) => all.filter((x) => x.id !== s.id))
                }
                size="sm"
                variant="ghost"
              >
                Delete {s.fileName}
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
      <Button onClick={() => setSaved(SAVED)} size="sm" variant="outline">
        Restore saved
      </Button>
      <FileUpload
        aria-label="New attachments"
        data-testid="new"
        maxFiles={remaining}
        multiple
        onValueChange={setFiles}
        required={saved.length === 0}
        value={files}
      >
        <FileUploadDropzone>
          <p>Drag files here, or</p>
          <FileUploadTrigger
            disabled={remaining === 0}
            render={<Button size="sm" variant="outline" />}
          >
            Choose files
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>{() => <Row />}</FileUploadList>
      </FileUpload>
    </div>
  );
}

/**
 * Saved attachments live in the app's own list; capacity counts new files.
 * At zero the trigger is disabled and a drop is rejected; deleting a saved
 * attachment frees a slot; restoring it lowers capacity without losing the
 * chosen file, which can still be removed.
 */
export const EditForm: Story = {
  name: "Edit Form",
  render: () => <EditFormDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = q(canvasElement, '[data-testid="new"]');
    const zone = slot(root, "file-upload-dropzone");
    await expect(slot(root, "file-upload-trigger")).toBeDisabled();
    dropFiles(zone, [makeFile("early.pdf")]);
    await expect(rowNames(root)).toEqual([]);

    button(canvas, "Delete contract.pdf").click();
    await waitFor(() =>
      expect(slot(root, "file-upload-trigger")).not.toBeDisabled()
    );
    dropFiles(zone, [makeFile("new.pdf")]);
    await waitFor(() => expect(rowNames(root)).toEqual(["new.pdf"]));
    dropFiles(zone, [makeFile("more.pdf")]);
    await expect(rowNames(root)).toEqual(["new.pdf"]);

    button(canvas, "Restore saved").click();
    await waitFor(() =>
      expect(slot(root, "file-upload-trigger")).toBeDisabled()
    );
    await expect(rowNames(root)).toEqual(["new.pdf"]);
    button(canvas, "Remove new.pdf").click();
    await waitFor(() => expect(rowNames(root)).toEqual([]));
  },
};

/**
 * Focus repair at zero capacity: the trigger is disabled, so removing the
 * only focused row moves focus to the root rather than losing it.
 */
export const FocusAtZeroCapacity: Story = {
  tags: TEST_ONLY,
  name: "Focus At Zero Capacity",
  render: () => {
    const [files, setFiles] = useState<File[]>([makeFile("only.pdf")]);
    return (
      <FileUpload
        aria-label="Zero capacity"
        className="w-96"
        maxFiles={0}
        multiple
        onValueChange={setFiles}
        value={files}
      >
        <FileUploadDropzone>
          <FileUploadTrigger
            disabled
            render={<Button size="sm" variant="outline" />}
          >
            Choose files
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>{() => <Row />}</FileUploadList>
      </FileUpload>
    );
  },
  play: async ({ canvasElement }) => {
    const remove = button(within(canvasElement), "Remove only.pdf");
    remove.focus();
    remove.click();
    await waitFor(() =>
      expect(document.activeElement).toBe(slot(canvasElement, "file-upload"))
    );
  },
};
