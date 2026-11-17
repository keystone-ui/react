"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import type { BaseUIEvent } from "@base-ui/react/types";
import type { VariantProps } from "class-variance-authority";
import { X as XIcon } from "lucide-react";
import type * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";

import { Button, type ButtonProps } from "./button";
import { itemVariants } from "./item";
import { Progress, type ProgressProps } from "./progress";
import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FileUploadStatus = "idle" | "uploading" | "success" | "error";

type FileRejectionCode =
  | "file-invalid-type"
  | "file-too-large"
  | "file-too-small"
  | "file-exists"
  | "too-many-files"
  | "file-is-directory"
  | "custom";

interface FileRejection {
  errors: { code: FileRejectionCode; message: string }[];
  /** `null` only for `"file-is-directory"`. */
  file: File | null;
  name: string;
}

interface FileUploadChangeDetails {
  added: File[];
  /** The change, drop, paste, click or reset event behind the change. */
  event: Event;
  reason: "add" | "replace" | "remove" | "reset";
  removed: File[];
}

interface FileUploadMessages {
  /** Announced when files are added. `null` turns the announcement off. */
  added: ((files: File[]) => string) | null;
  /** Announced when a form reset empties the value. */
  cleared: string;
  /** Announced when a row's status becomes `"error"`. */
  itemFailed: ((name: string, error?: string) => string) | null;
  /** The visible error text of a failed row that has no `error`. */
  itemFailedText: (name: string) => string;
  /** Announced when a row's status becomes `"success"`. */
  itemSucceeded: ((name: string) => string) | null;
  /** The accessible name of a row's progress bar. */
  progressLabel: (name: string) => string;
  /** Announced for rejected files. `null` turns the announcement off. */
  rejected: ((rejections: FileRejection[]) => string) | null;
  /** The visible text of each rejection error (`errors[].message`). */
  rejection: (code: FileRejectionCode, name: string) => string;
  /** Announced when files are removed. `null` turns the announcement off. */
  removed: ((files: File[]) => string) | null;
  /** The accessible name of a row's remove button. */
  removeLabel: (name: string) => string;
  /** Announced, as one message, when single mode replaces its file. */
  replaced: (name: string) => string;
  /** The required error's visible text and its announcement. */
  required: string;
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

function filesPhrase(files: File[], verb: string) {
  return files.length === 1
    ? `${files[0]?.name} ${verb}.`
    : `${files.length} files ${verb}.`;
}

const DEFAULT_MESSAGES: FileUploadMessages = {
  added: (files) => filesPhrase(files, "added"),
  removed: (files) => filesPhrase(files, "removed"),
  replaced: (name) => `${name} added, replacing the previous file.`,
  cleared: "All files removed.",
  rejected: (rejections) =>
    rejections.length === 1
      ? `${rejections[0]?.name} was not added.`
      : `${rejections.length} files were not added.`,
  rejection: (code, name) => {
    switch (code) {
      case "file-invalid-type":
        return `${name} is not an accepted file type.`;
      case "file-too-large":
        return `${name} is too large.`;
      case "file-too-small":
        return `${name} is too small.`;
      case "file-exists":
        return `${name} has already been added.`;
      case "too-many-files":
        return `${name} was not added: too many files.`;
      case "file-is-directory":
        return `${name} is a folder.`;
      default:
        return `${name} was not accepted.`;
    }
  },
  required: "Choose at least one file.",
  itemSucceeded: (name) => `${name} uploaded.`,
  itemFailed: (name, error) =>
    error ? `${name} failed: ${error}` : `${name} failed.`,
  itemFailedText: () => "Upload failed.",
  progressLabel: (name) => `Upload progress for ${name}`,
  removeLabel: (name) => `Remove ${name}`,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMPTY: File[] = [];
const MAX_PENDING = 50;
/** Clear, then set in a later update, so a repeated message is a new one. */
const ANNOUNCE_DELAY = 100;
const SIZE_UNITS = ["B", "kB", "MB", "GB", "TB"];
const EXTENSION_BOUND = 8;
const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, [contenteditable]:not([contenteditable="false"]), [role="button"], [data-slot="file-upload-trigger"]';
const EDITABLE_SELECTOR =
  'input, textarea, [contenteditable]:not([contenteditable="false"])';
const ROOT_SELECTOR = '[data-slot="file-upload"]';
const ZONE_SELECTOR = '[data-slot="file-upload-dropzone"]';
const UPPERCASE_ASCII = /[A-Z]/g;
const WHITESPACE = /\s+/;

// Module-scoped, so the package needs no Node types; bundlers replace the
// literal `process.env.NODE_ENV`, as they do for Base UI's own checks.
declare const process: { env: { NODE_ENV?: string } };

/** Bundlers replace the literal `process.env.NODE_ENV`, as for Base UI's own checks. */
function devWarn(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`FileUpload: ${message}`);
  }
}

function asciiLower(value: string) {
  return value.replace(UPPERCASE_ASCII, (c) => c.toLowerCase());
}

function sameMetadata(a: File, b: File) {
  return (
    a.name === b.name &&
    a.size === b.size &&
    a.lastModified === b.lastModified &&
    a.type === b.type
  );
}

function metadataKey(file: File) {
  return `${file.name}\u0000${file.size}\u0000${file.lastModified}\u0000${file.type}`;
}

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

function mergeIds(...lists: (string | undefined | null | false)[]) {
  const ids: string[] = [];
  for (const list of lists) {
    if (!list) {
      continue;
    }
    for (const id of list.split(WHITESPACE)) {
      if (id && !ids.includes(id)) {
        ids.push(id);
      }
    }
  }
  return ids.length > 0 ? ids.join(" ") : undefined;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    (ref as React.RefObject<T | null>).current = value;
  }
}

/** Removes every reference in `remove` once per occurrence. */
function without(files: File[], remove: File[]) {
  const pending = [...remove];
  return files.filter((file) => {
    const index = pending.indexOf(file);
    if (index === -1) {
      return true;
    }
    pending.splice(index, 1);
    return false;
  });
}

/** The files of `files` also in `others`, matched once per occurrence. */
function common(files: File[], others: File[]) {
  const pool = [...others];
  return files.filter((file) => {
    const index = pool.indexOf(file);
    if (index === -1) {
      return false;
    }
    pool.splice(index, 1);
    return true;
  });
}

function isFileDrag(event: { dataTransfer: DataTransfer | null }) {
  const types = event.dataTransfer?.types;
  return types ? Array.from(types).includes("Files") : false;
}

function formatBytes(bytes: number) {
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < SIZE_UNITS.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value)} ${SIZE_UNITS[unit]}`;
}

/**
 * Nested uploaders. Rule: an uploader acts only on events that started in
 * its own zone, trigger or inputs and that no inner uploader handled or
 * cancelled. A zone's drag, drop and click count as its own when the
 * target's nearest zone is that zone; a paste, when the target's nearest
 * root is that root. So whatever an inner uploader does with an event in its
 * zone or root (takes it, rejects it, is disabled or full, or its consumer
 * cancels it), the outer one does nothing with that event.
 */
function isOwnEvent(event: React.SyntheticEvent, selector: string) {
  const target = event.target as Node | null;
  const element =
    target?.nodeType === Node.ELEMENT_NODE
      ? (target as Element)
      : (target?.parentElement ?? null);
  const owner = element?.closest(selector) ?? null;
  return owner === (event.currentTarget as Element).closest(selector);
}

function canConstructDataTransfer() {
  try {
    return typeof DataTransfer === "function" && Boolean(new DataTransfer());
  } catch {
    return false;
  }
}

/** Writes `files` into `input`; `false` when the write did not take. */
function writeFiles(input: HTMLInputElement, files: File[]) {
  try {
    const transfer = new DataTransfer();
    for (const file of files) {
      transfer.items.add(file);
    }
    input.files = transfer.files;
  } catch {
    return false;
  }
  // Checked for an empty write too: a removal gets no clearing from the
  // browser, so a clear that did not take would still submit the old file.
  const written = input.files;
  if (!written || written.length !== files.length) {
    return false;
  }
  return files.every((file, index) => {
    const entry = written[index];
    return entry !== undefined && (entry === file || sameMetadata(entry, file));
  });
}

// ---------------------------------------------------------------------------
// Limits and validation
// ---------------------------------------------------------------------------

function normalizeMaxFiles(maxFiles: number | undefined) {
  if (maxFiles === undefined || maxFiles === Number.POSITIVE_INFINITY) {
    return { limit: Number.POSITIVE_INFINITY };
  }
  if (Number.isNaN(maxFiles)) {
    return {
      limit: Number.POSITIVE_INFINITY,
      warning: "maxFiles is NaN and is treated as unset.",
    };
  }
  if (maxFiles < 0) {
    return {
      limit: 0,
      warning: `maxFiles is negative (${maxFiles}) and is treated as 0.`,
    };
  }
  if (!Number.isInteger(maxFiles)) {
    return {
      limit: Math.floor(maxFiles),
      warning: `maxFiles is not an integer (${maxFiles}) and is floored.`,
    };
  }
  return { limit: maxFiles };
}

function normalizeSize(value: number | undefined, prop: string) {
  if (value === undefined) {
    return { size: undefined };
  }
  if (!Number.isFinite(value) || value < 0) {
    return {
      size: undefined,
      warning: `${prop} must be a finite number of bytes, 0 or more; ${value} is treated as unset.`,
    };
  }
  return { size: value };
}

function parseAccept(accept: string | undefined) {
  if (!accept) {
    return null;
  }
  const tokens = accept
    .split(",")
    .map((token) => asciiLower(token.trim()))
    .filter(Boolean);
  return tokens.length > 0 ? tokens : null;
}

function matchesAccept(file: File, tokens: string[]) {
  const name = asciiLower(file.name);
  const type = asciiLower(file.type);
  return tokens.some((token) => {
    if (token === "*/*") {
      return true;
    }
    if (token.startsWith(".")) {
      return name.endsWith(token);
    }
    if (type === "") {
      return false;
    }
    if (token.endsWith("/*")) {
      return type.startsWith(token.slice(0, -1));
    }
    return type === token;
  });
}

type Candidate = { file: File } | { directory: string };

interface BatchOptions {
  accept: string[] | null;
  allowDuplicates: boolean;
  limit: number;
  maxSize: number | undefined;
  messages: FileUploadMessages;
  minSize: number | undefined;
  multiple: boolean;
  validate: FileUploadProps["validate"];
}

function rejectionOf(
  file: File | null,
  name: string,
  code: FileRejectionCode,
  messages: FileUploadMessages
): FileRejection {
  return {
    file,
    name,
    errors: [{ code, message: messages.rejection(code, name) }],
  };
}

/** Every failure of one file: type, size, duplicate and `validate`. */
function checkFile(
  file: File,
  provisional: File[],
  keys: Set<string>,
  options: BatchOptions
) {
  const errors: FileRejection["errors"] = [];
  const fail = (code: FileRejectionCode) =>
    errors.push({ code, message: options.messages.rejection(code, file.name) });
  if (options.accept && !matchesAccept(file, options.accept)) {
    fail("file-invalid-type");
  }
  if (options.maxSize !== undefined && file.size > options.maxSize) {
    fail("file-too-large");
  }
  if (options.minSize !== undefined && file.size < options.minSize) {
    fail("file-too-small");
  }
  if (!options.allowDuplicates && keys.has(metadataKey(file))) {
    fail("file-exists");
  }
  const custom = options.validate?.(file, [...provisional]);
  if (custom) {
    errors.push({ code: "custom", message: custom });
  }
  return errors;
}

/**
 * Checks one batch against the provisional list (the value plus the files
 * that passed so far), then applies capacity to the files that passed.
 */
function processBatch(
  candidates: Candidate[],
  current: File[],
  options: BatchOptions
) {
  const { messages } = options;
  // Single mode replaces its file, so the duplicate rule skips it.
  const provisional = options.multiple ? [...current] : [];
  const keys = new Set(provisional.map(metadataKey));
  const entries: ({ valid: File } | { rejected: FileRejection })[] = [];

  for (const candidate of candidates) {
    if ("directory" in candidate) {
      entries.push({
        rejected: rejectionOf(
          null,
          candidate.directory,
          "file-is-directory",
          messages
        ),
      });
      continue;
    }
    const { file } = candidate;
    const errors = checkFile(file, provisional, keys, options);
    if (errors.length > 0) {
      entries.push({ rejected: { file, name: file.name, errors } });
    } else {
      entries.push({ valid: file });
      provisional.push(file);
      keys.add(metadataKey(file));
    }
  }

  // Capacity applies only to files that passed every other check.
  let room = options.multiple ? Math.max(0, options.limit - current.length) : 1;
  const accepted: File[] = [];
  const rejections: FileRejection[] = [];
  for (const entry of entries) {
    if ("rejected" in entry) {
      rejections.push(entry.rejected);
    } else if (room > 0) {
      accepted.push(entry.valid);
      room -= 1;
    } else {
      rejections.push(
        rejectionOf(entry.valid, entry.valid.name, "too-many-files", messages)
      );
    }
  }
  return { accepted, rejections };
}

function readDataTransfer(transfer: DataTransfer | null): Candidate[] {
  if (!transfer) {
    return [];
  }
  const items = transfer.items ? Array.from(transfer.items) : [];
  if (items.length === 0) {
    return Array.from(transfer.files ?? []).map((file) => ({ file }));
  }
  const candidates: Candidate[] = [];
  for (const item of items) {
    if (item.kind !== "file") {
      continue;
    }
    const entry = item.webkitGetAsEntry?.() ?? null;
    const file = item.getAsFile();
    if (entry?.isDirectory) {
      candidates.push({ directory: entry.name || file?.name || "" });
    } else if (file) {
      candidates.push({ file });
    }
  }
  return candidates;
}

// ---------------------------------------------------------------------------
// Page-wide drop guard (opt-in)
// ---------------------------------------------------------------------------

const documentGuards = new WeakMap<
  Document,
  { count: number; remove: () => void }
>();

function guardDocumentDrop(event: DragEvent) {
  if (!isFileDrag(event) || event.defaultPrevented) {
    return;
  }
  const onFileInput = event
    .composedPath()
    .some(
      (node) =>
        (node as Element).tagName === "INPUT" &&
        (node as HTMLInputElement).type === "file"
    );
  if (onFileInput) {
    return;
  }
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "none";
  }
}

function acquireDocumentGuard(doc: Document) {
  const existing = documentGuards.get(doc);
  if (existing) {
    existing.count += 1;
  } else {
    doc.addEventListener("dragover", guardDocumentDrop);
    doc.addEventListener("drop", guardDocumentDrop);
    documentGuards.set(doc, {
      count: 1,
      remove: () => {
        doc.removeEventListener("dragover", guardDocumentDrop);
        doc.removeEventListener("drop", guardDocumentDrop);
      },
    });
  }
  return () => {
    const guard = documentGuards.get(doc);
    if (!guard) {
      return;
    }
    guard.count -= 1;
    if (guard.count === 0) {
      guard.remove();
      documentGuards.delete(doc);
    }
  };
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

interface FocusedRowRemoval {
  index: number;
  siblings: Element[];
}

interface FileUploadContextValue {
  announce: (message: string | null | undefined) => void;
  describedBy: string | undefined;
  disabled: boolean;
  dragging: boolean;
  focusedRowRemoved: (removal: FocusedRowRemoval) => void;
  invalid: boolean;
  messages: FileUploadMessages;
  openPicker: () => void;
  remaining: number;
  remove: (file: File, index: number | undefined, event: Event) => void;
  requiredError: boolean;
  /** The generated id, used when the error part has no `id` of its own. */
  requiredErrorId: string;
  /** The id of the mounted, showing error part, if any. */
  requiredErrorShownId: string | undefined;
  rowKey: (file: File, occurrence: number) => string;
  setRequiredErrorShownId: (id: string | undefined) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  value: File[];
  valueRef: React.RefObject<File[]>;
  zoneHandlers: Pick<
    React.ComponentProps<"div">,
    "onDragEnter" | "onDragLeave" | "onDragOver" | "onDrop"
  >;
}

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

function useFileUploadContext(part: string) {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error(`${part} must be used within <FileUpload>.`);
  }
  return context;
}

/** What `FileUploadList`'s function form gives each row. */
interface FileUploadListRowContextValue {
  file: File;
  index: number;
}

const FileUploadListRowContext =
  createContext<FileUploadListRowContextValue | null>(null);

interface FileUploadItemContextValue {
  error: string | undefined;
  /** The generated id, used when the error part has no `id` of its own. */
  errorElementId: string;
  /** The id of the mounted, showing error part, if any. */
  errorId: string | undefined;
  file: File | undefined;
  index: number | undefined;
  name: string;
  progress: number | null | undefined;
  setErrorShownId: (id: string | undefined) => void;
  size: number | undefined;
  status: FileUploadStatus;
  type: string;
}

const FileUploadItemContext = createContext<FileUploadItemContextValue | null>(
  null
);

function useItemContext(part: string) {
  const context = useContext(FileUploadItemContext);
  if (!context) {
    throw new Error(`${part} must be used within <FileUploadItem>.`);
  }
  return context;
}

/** What `useFileUploadItem()` returns. */
// biome-ignore lint/style/useConsistentTypeDefinitions: an interface would no longer be assignable to an index-signature type, as the inline return type was
type UseFileUploadItemReturn = {
  name: string;
  size: number | undefined;
  type: string;
  file: File | undefined;
  status: FileUploadStatus;
  progress: number | null | undefined;
  errorId: string | undefined;
};

/** The enclosing row's file metadata, status and the id of its shown error. */
function useFileUploadItem(): UseFileUploadItemReturn {
  const { name, size, type, file, status, progress, errorId } =
    useItemContext("useFileUploadItem");
  return { name, size, type, file, status, progress, errorId };
}

// ---------------------------------------------------------------------------
// FileUpload (root)
// ---------------------------------------------------------------------------

interface FileUploadProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onPaste"> {
  /** Like the native `accept`, and also enforced for drops and pastes. */
  accept?: string;
  /** @default false */
  allowDuplicates?: boolean;
  /** Take pasted files while focus is inside. @default false */
  allowPaste?: boolean;
  /**
   * Not rendered: every value but `false` / `"false"` becomes `data-invalid`
   * on the root and the zone.
   */
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  capture?: React.InputHTMLAttributes<HTMLInputElement>["capture"];
  /** The initial files (uncontrolled), and what a form reset returns to. */
  defaultValue?: File[];
  disabled?: boolean;
  form?: string;
  /** The most files the value may hold. Ignored without `multiple`. */
  maxFiles?: number;
  /** Bytes. */
  maxSize?: number;
  messages?: Partial<FileUploadMessages>;
  /** Bytes. */
  minSize?: number;
  /** @default false */
  multiple?: boolean;
  /** Submits the files with the form under this name. */
  name?: string;
  onFilesRejected?: (rejections: FileRejection[], event: Event) => void;
  /** Runs before the component's own; `preventDefault()` or `event.preventBaseUIHandler()` stops intake. */
  onPaste?: (event: BaseUIEvent<React.ClipboardEvent<HTMLDivElement>>) => void;
  onValueChange?: (files: File[], details: FileUploadChangeDetails) => void;
  /** Stop file drops outside any drop target from opening the file. @default false */
  preventDocumentDrop?: boolean;
  required?: boolean;
  /** Returns an error message, or `null` to accept the file. */
  validate?: (file: File, provisional: readonly File[]) => string | null;
  /** The chosen files (controlled). New files only. */
  value?: File[];
}

interface PendingChange {
  added: File[];
  reason: FileUploadChangeDetails["reason"];
  removed: File[];
}

/**
 * Matches a committed change against one proposal that asked for it and
 * returns what to announce: one message per change. The files it claims are
 * taken out of `actual`, so a later proposal cannot announce them again.
 */
function settlePending(
  pending: PendingChange,
  actual: { added: File[]; removed: File[] },
  value: File[],
  messages: FileUploadMessages
) {
  const added = common(pending.added, actual.added);
  const removed = common(pending.removed, actual.removed);
  actual.added = without(actual.added, added);
  actual.removed = without(actual.removed, removed);
  pending.added = without(pending.added, added);
  pending.removed = without(pending.removed, removed);
  // Settled, or nothing left that a later commit could still do for it.
  const settled =
    pending.added.every((file) => value.includes(file)) &&
    pending.removed.every((file) => !value.includes(file));
  if (added.length === 0 && removed.length === 0) {
    return { claimed: false, messages: [], settled };
  }
  if (pending.reason === "reset") {
    return {
      claimed: true,
      messages: value.length === 0 ? [messages.cleared] : [],
      settled,
    };
  }
  if (pending.reason === "replace" && added[0] && removed.length > 0) {
    return {
      claimed: true,
      messages: [messages.replaced(added[0].name)],
      settled,
    };
  }
  return {
    claimed: true,
    messages: [
      added.length > 0 ? messages.added?.(added) : null,
      removed.length > 0 ? messages.removed?.(removed) : null,
    ],
    settled,
  };
}

function FileUpload({
  className,
  value: valueProp,
  defaultValue,
  onValueChange,
  onFilesRejected,
  accept,
  multiple = false,
  maxFiles,
  maxSize: maxSizeProp,
  minSize: minSizeProp,
  allowDuplicates = false,
  validate,
  disabled = false,
  required = false,
  name,
  form,
  capture,
  allowPaste = false,
  preventDocumentDrop = false,
  messages: messagesProp,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  children,
  ref,
  ...props
}: FileUploadProps) {
  // A key passed as `undefined` keeps its default; only `null` silences.
  const messages = useMemo(() => {
    const merged: FileUploadMessages = { ...DEFAULT_MESSAGES };
    for (const key of Object.keys(
      messagesProp ?? {}
    ) as (keyof FileUploadMessages)[]) {
      const value = messagesProp?.[key];
      if (value !== undefined) {
        (merged as Record<keyof FileUploadMessages, unknown>)[key] = value;
      }
    }
    return merged;
  }, [messagesProp]);

  // Value ------------------------------------------------------------------
  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] = useState<File[]>(
    () => defaultValue ?? EMPTY
  );
  const rawValue = (isControlled ? valueProp : uncontrolled) ?? EMPTY;
  const value = useMemo(
    () => (multiple || rawValue.length <= 1 ? rawValue : rawValue.slice(0, 1)),
    [multiple, rawValue]
  );
  const valueRef = useRef(value);
  useLayoutEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Limits -----------------------------------------------------------------
  const { limit, warning: maxFilesWarning } = normalizeMaxFiles(
    multiple ? maxFiles : undefined
  );
  const maxSize = normalizeSize(maxSizeProp, "maxSize");
  const minSize = normalizeSize(minSizeProp, "minSize");
  const remaining = multiple
    ? Math.max(0, limit - value.length)
    : Number.POSITIVE_INFINITY;

  useEffect(() => {
    if (!multiple && maxFiles !== undefined) {
      devWarn(
        "maxFiles is ignored without multiple; single mode holds one file."
      );
    }
    for (const warning of [maxFilesWarning, maxSize.warning, minSize.warning]) {
      if (warning) {
        devWarn(warning);
      }
    }
  }, [multiple, maxFiles, maxFilesWarning, maxSize.warning, minSize.warning]);

  useEffect(() => {
    if (new Set(rawValue).size !== rawValue.length) {
      devWarn(
        "the same File appears more than once in the value; each File should appear at most once."
      );
    }
    if (!multiple && rawValue.length > 1) {
      devWarn(
        "the value holds more than one file without multiple; only the first is shown and submitted."
      );
    }
  }, [rawValue, multiple]);

  // Row keys ---------------------------------------------------------------
  const idsRef = useRef(new WeakMap<File, string>());
  const nextIdRef = useRef(0);
  const rowKey = useCallback((file: File, occurrence: number) => {
    let id = idsRef.current.get(file);
    if (!id) {
      nextIdRef.current += 1;
      id = `f${nextIdRef.current}`;
      idsRef.current.set(file, id);
    }
    return `${id}-${occurrence}`;
  }, []);

  // Announcements ----------------------------------------------------------
  const regionRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<string[]>([]);
  const announceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const announce = useCallback((message: string | null | undefined) => {
    if (!message) {
      return;
    }
    queueRef.current.push(message);
    if (regionRef.current) {
      regionRef.current.textContent = "";
    }
    clearTimeout(announceTimerRef.current);
    announceTimerRef.current = setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = queueRef.current.join(" ");
      }
      queueRef.current = [];
    }, ANNOUNCE_DELAY);
  }, []);
  useEffect(() => () => clearTimeout(announceTimerRef.current), []);

  // Proposals and commits --------------------------------------------------
  // Every proposal not yet committed, oldest first: a controlled parent may
  // commit several later, one by one.
  const pendingRef = useRef<PendingChange[]>([]);
  const propose = (next: File[], details: FileUploadChangeDetails) => {
    pendingRef.current.push({
      reason: details.reason,
      added: [...details.added],
      removed: [...details.removed],
    });
    // Bound retained proposals; if the parent later commits an evicted
    // proposal, its announcement is unavailable.
    if (pendingRef.current.length > MAX_PENDING) {
      pendingRef.current.shift();
    }
    if (!isControlled) {
      setUncontrolled(next);
    }
    onValueChange?.(next, details);
  };

  // Required error ---------------------------------------------------------
  const [requiredErrorState, setRequiredErrorState] = useState(false);
  const requiredError =
    requiredErrorState && required && !disabled && value.length === 0;
  const requiredErrorId = useId();
  const [requiredErrorShownId, setRequiredErrorShownId] = useState<
    string | undefined
  >(undefined);

  // Drag -------------------------------------------------------------------
  const dragCounterRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const endDrag = useCallback(() => {
    dragCounterRef.current = 0;
    setDragging(false);
  }, []);

  useEffect(() => {
    if (!dragging) {
      return;
    }
    window.addEventListener("drop", endDrag);
    window.addEventListener("blur", endDrag);
    return () => {
      window.removeEventListener("drop", endDrag);
      window.removeEventListener("blur", endDrag);
    };
  }, [dragging, endDrag]);

  // Elements ---------------------------------------------------------------
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const formInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Intake -----------------------------------------------------------------
  const intake = (candidates: Candidate[], event: Event) => {
    const current = valueRef.current;
    const { accepted, rejections } = processBatch(candidates, current, {
      multiple,
      limit,
      accept: parseAccept(accept),
      minSize: minSize.size,
      maxSize: maxSize.size,
      allowDuplicates,
      validate,
      messages,
    });
    // Spoken before "added", even when the parent commits synchronously
    // inside onValueChange; onFilesRejected still runs after onValueChange.
    if (rejections.length > 0) {
      announce(messages.rejected?.(rejections));
    }
    if (multiple) {
      if (accepted.length > 0) {
        propose([...current, ...accepted], {
          reason: "add",
          added: accepted,
          removed: [],
          event,
        });
      }
    } else {
      const next = accepted[0];
      const old = current[0];
      if (next && !(old && sameMetadata(old, next))) {
        propose(
          [next],
          old
            ? { reason: "replace", added: [next], removed: [old], event }
            : { reason: "add", added: [next], removed: [], event }
        );
      }
    }
    if (rejections.length > 0) {
      onFilesRejected?.(rejections, event);
    }
  };

  const openPicker = () => {
    if (!disabled) {
      pickerRef.current?.click();
    }
  };

  const remove = (file: File, index: number | undefined, event: Event) => {
    if (disabled) {
      return;
    }
    const current = valueRef.current;
    const at =
      index !== undefined && current[index] === file
        ? index
        : current.indexOf(file);
    if (at === -1) {
      return;
    }
    propose(
      current.filter((_, i) => i !== at),
      { reason: "remove", added: [], removed: [file], event }
    );
  };

  const onPickerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length > 0) {
      intake(
        files.map((file) => ({ file })),
        event.nativeEvent
      );
    }
  };

  const zoneHandlers: FileUploadContextValue["zoneHandlers"] = {
    onDragEnter: (event) => {
      if (!isFileDrag(event) || disabled || !isOwnEvent(event, ZONE_SELECTOR)) {
        return;
      }
      dragCounterRef.current += 1;
      setDragging(true);
    },
    onDragLeave: (event) => {
      if (!(isFileDrag(event) && isOwnEvent(event, ZONE_SELECTOR))) {
        return;
      }
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setDragging(false);
      }
    },
    onDragOver: (event) => {
      if (!(isFileDrag(event) && isOwnEvent(event, ZONE_SELECTOR))) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = disabled ? "none" : "copy";
      }
    },
    onDrop: (event) => {
      if (!(isFileDrag(event) && isOwnEvent(event, ZONE_SELECTOR))) {
        return;
      }
      endDrag();
      event.preventDefault();
      if (disabled) {
        return;
      }
      intake(readDataTransfer(event.dataTransfer), event.nativeEvent);
    },
  };

  const onPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (
      !allowPaste ||
      disabled ||
      event.defaultPrevented ||
      !isOwnEvent(event, ROOT_SELECTOR)
    ) {
      return;
    }
    const target = event.target as Element;
    if (target.closest?.(EDITABLE_SELECTOR)) {
      return;
    }
    const doc = rootRef.current?.ownerDocument ?? document;
    if (!rootRef.current?.contains(doc.activeElement)) {
      return;
    }
    const files = Array.from(event.clipboardData?.files ?? []);
    if (files.length === 0) {
      return;
    }
    event.preventDefault();
    intake(
      files.map((file) => ({ file })),
      event.nativeEvent
    );
  };

  // Commit effects: announcements, required error, focus repair -------------
  const committedRef = useRef(value);
  const focusRemovalRef = useRef<FocusedRowRemoval | null>(null);
  // A row can leave in a render of the app's own list alone; this update
  // makes the root render too, so the repair below runs after that commit.
  const [, setFocusRepairRequest] = useState(0);
  const focusedRowRemoved = useCallback((removal: FocusedRowRemoval) => {
    focusRemovalRef.current ??= removal;
    setFocusRepairRequest((n) => n + 1);
  }, []);

  useLayoutEffect(() => {
    const removal = focusRemovalRef.current;
    if (!removal) {
      return;
    }
    focusRemovalRef.current = null;
    if (!rootRef.current?.isConnected) {
      return;
    }
    const doc = rootRef.current.ownerDocument;
    const active = doc.activeElement;
    if (active && active !== doc.body && active.isConnected) {
      return;
    }
    const after = removal.siblings.slice(removal.index + 1);
    const before = removal.siblings.slice(0, removal.index).reverse();
    for (const row of [...after, ...before]) {
      if (!row.isConnected) {
        continue;
      }
      const button = row.querySelector<HTMLButtonElement>(
        '[data-slot="file-upload-item-remove"]'
      );
      if (button && !button.disabled) {
        button.focus();
        return;
      }
    }
    const trigger = triggerRef.current;
    if (
      trigger?.isConnected &&
      !trigger.matches(":disabled") &&
      trigger.getAttribute("aria-disabled") !== "true"
    ) {
      trigger.focus();
      return;
    }
    rootRef.current?.focus();
  });

  useLayoutEffect(() => {
    const previous = committedRef.current;
    if (previous === value) {
      return;
    }
    committedRef.current = value;
    if (value.length > 0) {
      setRequiredErrorState(false);
    }
    const pending = pendingRef.current;
    if (pending.length === 0) {
      // A value the app sets on its own is not announced.
      return;
    }
    const actual = {
      added: without(value, previous),
      removed: without(previous, value),
    };
    const spoken: (string | null | undefined)[] = [];
    const done = new Set<PendingChange>();
    let newestSettled = -1;
    // Claimed newest first: when two proposals name the same file, the older
    // one was refused or superseded and the commit answers the newer one.
    // Spoken oldest first.
    const results = [...pending]
      .reverse()
      .map((change) => settlePending(change, actual, value, messages))
      .reverse();
    pending.forEach((change, index) => {
      const result = results[index] as ReturnType<typeof settlePending>;
      spoken.push(...result.messages);
      if (result.settled) {
        done.add(change);
        if (result.claimed) {
          newestSettled = index;
        }
      }
    });
    // After a newer proposal settles, discard older unresolved proposals.
    // Their later commits will not be announced.
    pendingRef.current = pending.filter(
      (change, index) => index > newestSettled && !done.has(change)
    );
    for (const message of spoken) {
      announce(message);
    }
  }, [value, announce, messages]);

  useLayoutEffect(() => {
    if (requiredErrorState && (!required || disabled)) {
      setRequiredErrorState(false);
    }
  }, [requiredErrorState, required, disabled]);

  // Entered in this task already, before React renders the state: two
  // invalid events in one task still announce once.
  const requiredEnteredRef = useRef(false);
  useLayoutEffect(() => {
    if (!requiredError) {
      requiredEnteredRef.current = false;
    }
  });

  const onFormInputInvalid = () => {
    if (
      valueRef.current.length > 0 ||
      requiredError ||
      requiredEnteredRef.current
    ) {
      return;
    }
    requiredEnteredRef.current = true;
    setRequiredErrorState(true);
    announce(messages.required);
  };

  const onFormInputFocus = () => {
    const trigger = triggerRef.current;
    if (trigger?.isConnected && !trigger.matches(":disabled")) {
      trigger.focus();
    } else {
      rootRef.current?.focus();
    }
  };

  // Form bridge ------------------------------------------------------------
  // The form mirror. Rule: the form input holds the COMMITTED value as it is
  // when the write runs. No write uses a list captured earlier (before a
  // reset, a parent's commit or a render); every write, empty or not, is read
  // back, and the first one that did not take latches the unsupported state.
  const bridgeActive = Boolean(name) || required;
  const bridgeActiveRef = useRef(bridgeActive);
  useLayoutEffect(() => {
    bridgeActiveRef.current = bridgeActive;
  }, [bridgeActive]);
  const [unsupported, setUnsupported] = useState(false);
  // Read at write time: a write later in the same task must see a failure.
  const unsupportedRef = useRef(false);
  const constructorCheckedRef = useRef(false);
  const lastWrittenRef = useRef<{
    input: HTMLInputElement | null;
    files: File[];
  }>({ input: null, files: EMPTY });

  const failBridge = useCallback(() => {
    unsupportedRef.current = true;
    setUnsupported(true);
    const input = formInputRef.current;
    if (input) {
      try {
        input.value = "";
      } catch {
        // Nothing left to clear.
      }
    }
    console.error(
      "FileUpload: this browser cannot set a file input's files, so native form submission and `required` are off. Submit from `value` instead."
    );
  }, []);

  const writeFormInput = useCallback(
    (files: File[]) => {
      const input = formInputRef.current;
      if (!input) {
        return;
      }
      if (files.length === 0 && (input.files?.length ?? 0) === 0) {
        lastWrittenRef.current = { input, files };
        return;
      }
      if (writeFiles(input, files)) {
        lastWrittenRef.current = { input, files };
      } else {
        failBridge();
      }
    },
    [failBridge]
  );

  /** Writes the committed value, unless the bridge is off or failed. */
  const mirrorCommitted = useCallback(() => {
    if (bridgeActiveRef.current && !unsupportedRef.current) {
      writeFormInput(committedRef.current);
    }
  }, [writeFormInput]);

  useLayoutEffect(() => {
    if (!bridgeActive) {
      // Not mirrored while off: forget the last write, so turning the bridge
      // back on writes again (a reset may have emptied the input meanwhile).
      lastWrittenRef.current = { input: null, files: EMPTY };
      return;
    }
    if (unsupportedRef.current) {
      return;
    }
    if (!constructorCheckedRef.current) {
      constructorCheckedRef.current = true;
      if (!canConstructDataTransfer()) {
        failBridge();
        return;
      }
    }
    const last = lastWrittenRef.current;
    if (
      last.input === formInputRef.current &&
      last.files === committedRef.current
    ) {
      return;
    }
    mirrorCommitted();
  });

  // Reset: listen on the form input's actual owner ---------------------------
  const resetRef = useRef<(event: Event) => void>(() => undefined);
  const reset = (event: Event) => {
    setRequiredErrorState(false);
    endDrag();
    const current = valueRef.current;
    // Committed synchronously: the uncontrolled value, and a parent that
    // commits inside onValueChange. A parent that commits later, or refuses,
    // keeps the current value committed for now.
    try {
      flushSync(() => {
        if (isControlled) {
          if (current.length > 0) {
            propose([], {
              reason: "reset",
              added: [],
              removed: current,
              event,
            });
          }
        } else {
          const initial = defaultValue ?? EMPTY;
          const next = multiple ? initial : initial.slice(0, 1);
          const added = without(next, current);
          const removed = without(current, next);
          if (added.length > 0 || removed.length > 0) {
            propose(next, { reason: "reset", added, removed, event });
          }
        }
      });
    } finally {
      // The browser has emptied the input: write what is committed now, even
      // when the value did not change or the app's handler threw.
      mirrorCommitted();
    }
  };
  useLayoutEffect(() => {
    resetRef.current = reset;
  });

  const boundFormRef = useRef<HTMLFormElement | null>(null);
  const unbindRef = useRef<() => void>(() => undefined);
  useLayoutEffect(() => {
    const owner = formInputRef.current?.form ?? null;
    if (owner === boundFormRef.current) {
      return;
    }
    unbindRef.current();
    boundFormRef.current = owner;
    if (!owner) {
      unbindRef.current = () => undefined;
      return;
    }
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const onReset = (event: Event) => {
      // The reset event fires before the browser empties the inputs, and an
      // app's handler may still cancel it: decide in a later task.
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!event.defaultPrevented) {
          resetRef.current(event);
        }
      }, 0);
      timers.add(timer);
    };
    owner.addEventListener("reset", onReset);
    unbindRef.current = () => {
      owner.removeEventListener("reset", onReset);
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  });
  useEffect(
    () => () => {
      unbindRef.current();
      boundFormRef.current = null;
    },
    []
  );

  // The picker's own click is stopped at its target, so no ancestor's
  // bubbling listener, React or native, sees a second click for one
  // activation. Capture-phase listeners run before the target and still see
  // it; nothing at the target can take that back.
  useLayoutEffect(() => {
    const picker = pickerRef.current;
    if (!picker) {
      return;
    }
    const stop = (event: Event) => event.stopPropagation();
    picker.addEventListener("click", stop);
    return () => picker.removeEventListener("click", stop);
  }, []);

  // Document drop guard ----------------------------------------------------
  useEffect(() => {
    if (!preventDocumentDrop || disabled) {
      return;
    }
    return acquireDocumentGuard(rootRef.current?.ownerDocument ?? document);
  }, [preventDocumentDrop, disabled]);

  // Render -----------------------------------------------------------------
  // `null` from untyped code counts as absent.
  const invalid =
    ariaInvalid != null && ariaInvalid !== false && ariaInvalid !== "false";

  const context: FileUploadContextValue = {
    value,
    disabled,
    invalid: invalid || requiredError,
    dragging,
    remaining,
    messages,
    describedBy: ariaDescribedBy,
    requiredError,
    requiredErrorId,
    requiredErrorShownId: requiredError ? requiredErrorShownId : undefined,
    setRequiredErrorShownId,
    triggerRef,
    openPicker,
    remove,
    announce,
    focusedRowRemoved,
    zoneHandlers,
    rowKey,
    valueRef,
  };

  const rootProps = mergeProps<"div">({ onPaste }, props);

  return (
    <FileUploadContext.Provider value={context}>
      {/* biome-ignore lint/a11y/useSemanticElements: a group of controls, not a fieldset with a legend */}
      <div
        {...rootProps}
        className={cn(
          "flex w-full flex-col gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2",
          className
        )}
        data-disabled={disabled || undefined}
        data-dragging={dragging || undefined}
        data-form-bridge={unsupported ? "unsupported" : undefined}
        data-invalid={invalid || requiredError ? "" : undefined}
        data-slot="file-upload"
        ref={(element: HTMLDivElement | null) => {
          rootRef.current = element;
          setRef(ref, element);
        }}
        role="group"
        tabIndex={-1}
      >
        {children}
        <input
          accept={accept}
          aria-hidden
          capture={capture}
          className="sr-only"
          data-file-upload-picker=""
          disabled={disabled}
          multiple={multiple}
          onChange={onPickerChange}
          ref={pickerRef}
          tabIndex={-1}
          type="file"
        />
        <input
          aria-hidden
          className="sr-only"
          data-file-upload-form-input=""
          disabled={disabled}
          form={form}
          multiple={multiple}
          name={unsupported ? undefined : name}
          onFocus={onFormInputFocus}
          onInvalid={onFormInputInvalid}
          ref={formInputRef}
          required={unsupported ? false : required}
          tabIndex={-1}
          type="file"
        />
        <div
          aria-live="polite"
          className="sr-only"
          ref={regionRef}
          role="status"
        />
      </div>
    </FileUploadContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// FileUploadDropzone
// ---------------------------------------------------------------------------

type FileUploadDropzoneProps = Omit<
  React.ComponentProps<"div">,
  "onClick" | "onDrop"
> & {
  /** Runs before the component's own; `preventDefault()` or `event.preventBaseUIHandler()` keeps the picker closed. */
  onClick?: (event: BaseUIEvent<React.MouseEvent<HTMLDivElement>>) => void;
  /** Runs before the component's own; `event.preventBaseUIHandler()` stops intake. */
  onDrop?: (event: BaseUIEvent<React.DragEvent<HTMLDivElement>>) => void;
};

function FileUploadDropzone({
  className,
  ref,
  ...props
}: FileUploadDropzoneProps) {
  const context = useFileUploadContext("FileUploadDropzone");
  const {
    disabled,
    invalid,
    dragging,
    remaining,
    openPicker,
    zoneHandlers,
    triggerRef,
  } = context;

  useEffect(() => {
    // The uploader's own trigger, inside the zone or beside it.
    if (!triggerRef.current?.isConnected) {
      devWarn(
        "a FileUploadDropzone has no FileUploadTrigger; the trigger is the only keyboard path to the picker."
      );
    }
  }, [triggerRef]);

  const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || !isOwnEvent(event, ZONE_SELECTOR)) {
      return;
    }
    const interactive = (event.target as Element).closest?.(
      INTERACTIVE_SELECTOR
    );
    if (interactive && event.currentTarget.contains(interactive)) {
      return;
    }
    if (disabled || remaining === 0) {
      return;
    }
    openPicker();
  };

  const merged = mergeProps<"div">({ ...zoneHandlers, onClick }, props);

  return (
    <div
      {...merged}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-input border-dashed p-6 text-center text-muted-foreground text-sm transition-[border-color,background-color] duration-(--duration-fast,125ms) ease-(--ease-ks-out,cubic-bezier(0.23,1,0.32,1)) data-[disabled]:cursor-not-allowed data-[dragging]:border-primary data-[invalid]:border-destructive data-[dragging]:bg-primary/5 data-[disabled]:opacity-50",
        className
      )}
      data-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
      data-invalid={invalid ? "" : undefined}
      data-slot="file-upload-dropzone"
      ref={ref}
    />
  );
}

// ---------------------------------------------------------------------------
// FileUploadTrigger
// ---------------------------------------------------------------------------

type FileUploadTriggerProps = ButtonPrimitive.Props;

function FileUploadTrigger({
  className,
  disabled: disabledProp,
  ref,
  "aria-describedby": ownDescribedBy,
  ...props
}: FileUploadTriggerProps) {
  const context = useFileUploadContext("FileUploadTrigger");
  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.defaultPrevented) {
      return;
    }
    context.openPicker();
  };
  const describedBy = mergeIds(
    context.describedBy,
    ownDescribedBy,
    context.requiredErrorShownId
  );
  return (
    <ButtonPrimitive
      {...props}
      aria-describedby={describedBy}
      className={className}
      data-slot="file-upload-trigger"
      disabled={context.disabled || disabledProp}
      onClick={
        mergeProps<"button">({ onClick }, { onClick: props.onClick }).onClick
      }
      ref={(element: HTMLButtonElement | null) => {
        context.triggerRef.current = element;
        setRef(ref, element);
      }}
      type="button"
    />
  );
}

// ---------------------------------------------------------------------------
// FileUploadError
// ---------------------------------------------------------------------------

type FileUploadErrorProps = React.ComponentProps<"p">;

function FileUploadError({
  className,
  children,
  id: idProp,
  ...props
}: FileUploadErrorProps) {
  const { requiredError, requiredErrorId, setRequiredErrorShownId, messages } =
    useFileUploadContext("FileUploadError");
  // The id the element really has, so descriptions always resolve.
  const id = idProp ?? requiredErrorId;

  useLayoutEffect(() => {
    if (!requiredError) {
      return;
    }
    setRequiredErrorShownId(id);
    return () => setRequiredErrorShownId(undefined);
  }, [requiredError, id, setRequiredErrorShownId]);

  if (!requiredError) {
    return null;
  }
  return (
    <p
      className={cn("text-destructive text-sm", className)}
      data-slot="file-upload-error"
      {...props}
      id={id}
    >
      {children ?? messages.required}
    </p>
  );
}

// ---------------------------------------------------------------------------
// FileUploadList
// ---------------------------------------------------------------------------

interface FileUploadListProps
  extends Omit<React.ComponentProps<"ul">, "children"> {
  /**
   * A function of each file, or rows the app keys itself. Either way, every
   * child is a `FileUploadItem` for a file in the value.
   */
  children?: React.ReactNode | ((file: File, index: number) => React.ReactNode);
}

function FileUploadList({
  className,
  children,
  ...props
}: FileUploadListProps) {
  const { value, rowKey } = useFileUploadContext("FileUploadList");

  let rowsContent: React.ReactNode = children as React.ReactNode;
  if (typeof children === "function") {
    const seen = new Map<File, number>();
    rowsContent = value.map((file, index) => {
      const occurrence = seen.get(file) ?? 0;
      seen.set(file, occurrence + 1);
      return (
        <FileUploadListRowContext.Provider
          key={rowKey(file, occurrence)}
          value={{ file, index }}
        >
          {children(file, index)}
        </FileUploadListRowContext.Provider>
      );
    });
  }

  return (
    <ul
      className={cn("flex w-full flex-col gap-2", className)}
      data-slot="file-upload-list"
      // biome-ignore lint/a11y/noRedundantRoles: list-style: none drops list semantics in some screen readers
      role="list"
      {...props}
    >
      {rowsContent}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// FileUploadItem
// ---------------------------------------------------------------------------

interface FileUploadItemProps
  extends React.ComponentProps<"li">,
    VariantProps<typeof itemVariants> {
  /** Shown and announced on `status="error"`. */
  error?: string;
  /** Given by `FileUploadList`'s function form; required otherwise. */
  file?: File;
  /** 0-100. A non-finite value is indeterminate while uploading. */
  progress?: number | null;
  /** @default "idle" */
  status?: FileUploadStatus;
}

function FileUploadItem({
  className,
  file: fileProp,
  status = "idle",
  progress,
  error,
  variant = "outline",
  size = "default",
  ref,
  ...props
}: FileUploadItemProps) {
  const root = useFileUploadContext("FileUploadItem");
  const row = useContext(FileUploadListRowContext);
  const file = fileProp ?? row?.file;
  const index = fileProp && fileProp !== row?.file ? undefined : row?.index;
  const errorElementId = useId();
  const [errorShownId, setErrorShownId] = useState<string | undefined>(
    undefined
  );
  const itemRef = useRef<HTMLLIElement | null>(null);
  const name = file?.name ?? "";

  // Focus repair: report a row that leaves while it holds focus.
  const { focusedRowRemoved } = root;
  useLayoutEffect(
    () => () => {
      const element = itemRef.current;
      if (!element?.contains(element.ownerDocument.activeElement)) {
        return;
      }
      const siblings = element.parentElement
        ? Array.from(element.parentElement.children)
        : [element];
      focusedRowRemoved({ siblings, index: siblings.indexOf(element) });
    },
    [focusedRowRemoved]
  );

  // Status announcements, only for changes after the row mounted.
  const announcedStatus = useRef(status);
  const { announce, messages } = root;
  useEffect(() => {
    if (announcedStatus.current === status) {
      return;
    }
    announcedStatus.current = status;
    if (status === "success") {
      announce(messages.itemSucceeded?.(name));
    } else if (status === "error") {
      announce(messages.itemFailed?.(name, error));
    }
  }, [status, name, error, announce, messages]);

  // Development checks for the node form.
  const { valueRef, value } = root;
  useEffect(() => {
    if (!file) {
      devWarn(
        "FileUploadItem needs a file: pass `file`, or render it from FileUploadList's function form."
      );
      return;
    }
    if (value.includes(file)) {
      return;
    }
    // An app's own row list may lag the value by one render.
    const timer = setTimeout(() => {
      if (!valueRef.current.includes(file)) {
        devWarn(
          "a FileUploadItem is not in the value; only files in the value belong in FileUploadList."
        );
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [file, value, valueRef]);

  const isError = status === "error";
  const context: FileUploadItemContextValue = {
    name,
    size: file?.size,
    type: file?.type ?? "",
    file,
    index,
    status,
    progress,
    error: isError ? error : undefined,
    errorId: isError ? errorShownId : undefined,
    errorElementId,
    setErrorShownId,
  };

  return (
    <FileUploadItemContext.Provider value={context}>
      <li
        className={cn(itemVariants({ variant, size }), className)}
        data-size={size}
        data-slot="file-upload-item"
        data-status={status}
        data-variant={variant}
        ref={(element: HTMLLIElement | null) => {
          itemRef.current = element;
          setRef(ref, element);
        }}
        {...props}
      />
    </FileUploadItemContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// FileUploadItemName
// ---------------------------------------------------------------------------

function splitName(name: string) {
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) {
    return null;
  }
  const extension = name.slice(dot);
  if (extension.length > EXTENSION_BOUND) {
    return null;
  }
  return { base: name.slice(0, dot), extension };
}

type FileUploadItemNameProps = Omit<React.ComponentProps<"span">, "children">;

function FileUploadItemName({ className, ...props }: FileUploadItemNameProps) {
  const { name } = useItemContext("FileUploadItemName");
  const parts = splitName(name);
  return (
    <span
      className={cn("flex min-w-0 font-medium text-sm", className)}
      data-slot="file-upload-item-name"
      dir="auto"
      title={name}
      {...props}
    >
      {parts ? (
        <>
          <span className="min-w-0 truncate">{parts.base}</span>
          <span className="max-w-[8ch] shrink-0 truncate">
            {parts.extension}
          </span>
        </>
      ) : (
        <span className="min-w-0 truncate">{name}</span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// FileUploadItemSize
// ---------------------------------------------------------------------------

interface FileUploadItemSizeProps extends React.ComponentProps<"span"> {
  /** Formats the byte count. The default divides by 1000 (kB, MB, GB). */
  formatSize?: (bytes: number) => string;
}

function FileUploadItemSize({
  className,
  formatSize = formatBytes,
  children,
  ...props
}: FileUploadItemSizeProps) {
  const { size } = useItemContext("FileUploadItemSize");
  return (
    <span
      className={cn("text-muted-foreground text-xs tabular-nums", className)}
      data-slot="file-upload-item-size"
      {...props}
    >
      {children ?? (size === undefined ? null : formatSize(size))}
    </span>
  );
}

// ---------------------------------------------------------------------------
// FileUploadItemProgress
// ---------------------------------------------------------------------------

type FileUploadItemProgressProps = Omit<ProgressProps, "value" | "min" | "max">;

function FileUploadItemProgress({
  color,
  "aria-label": ariaLabel,
  ...props
}: FileUploadItemProgressProps) {
  const root = useFileUploadContext("FileUploadItemProgress");
  const { name, status, progress } = useItemContext("FileUploadItemProgress");
  const finite = typeof progress === "number" && Number.isFinite(progress);

  let value: number | null;
  if (status === "uploading") {
    value = finite ? clamp(progress) : null;
  } else if (status === "error" && finite) {
    value = clamp(progress);
  } else {
    return null;
  }

  return (
    <Progress
      aria-label={
        ariaLabel ??
        (props["aria-labelledby"]
          ? undefined
          : root.messages.progressLabel(name))
      }
      color={color ?? (status === "error" ? "destructive" : undefined)}
      data-slot="file-upload-item-progress"
      value={value}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// FileUploadItemError
// ---------------------------------------------------------------------------

type FileUploadItemErrorProps = React.ComponentProps<"p">;

function FileUploadItemError({
  className,
  children,
  id: idProp,
  ...props
}: FileUploadItemErrorProps) {
  const root = useFileUploadContext("FileUploadItemError");
  const { status, error, name, errorElementId, setErrorShownId } =
    useItemContext("FileUploadItemError");
  const shown = status === "error";
  // The id the element really has, so descriptions always resolve.
  const id = idProp ?? errorElementId;

  useLayoutEffect(() => {
    if (!shown) {
      return;
    }
    setErrorShownId(id);
    return () => setErrorShownId(undefined);
  }, [shown, id, setErrorShownId]);

  if (!shown) {
    return null;
  }
  return (
    <p
      className={cn("basis-full text-destructive text-sm", className)}
      data-slot="file-upload-item-error"
      {...props}
      id={id}
    >
      {children ?? error ?? root.messages.itemFailedText(name)}
    </p>
  );
}

// ---------------------------------------------------------------------------
// FileUploadItemRemove
// ---------------------------------------------------------------------------

type FileUploadItemRemoveProps = ButtonProps &
  React.RefAttributes<HTMLButtonElement>;

function FileUploadItemRemove({
  children,
  disabled,
  "aria-describedby": ownDescribedBy,
  ...props
}: FileUploadItemRemoveProps) {
  const root = useFileUploadContext("FileUploadItemRemove");
  const { file, index, name, errorId } = useItemContext("FileUploadItemRemove");
  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.defaultPrevented || !file) {
      return;
    }
    root.remove(file, index, event.nativeEvent);
  };
  return (
    <Button
      aria-describedby={mergeIds(ownDescribedBy, errorId)}
      aria-label={root.messages.removeLabel(name)}
      data-slot="file-upload-item-remove"
      size="icon-xs"
      variant="ghost"
      {...props}
      disabled={root.disabled || disabled}
      onClick={
        mergeProps<"button">({ onClick }, { onClick: props.onClick }).onClick
      }
    >
      {children ?? <XIcon aria-hidden />}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export type {
  FileRejection,
  FileRejectionCode,
  FileUploadChangeDetails,
  FileUploadDropzoneProps,
  FileUploadErrorProps,
  FileUploadItemErrorProps,
  FileUploadItemNameProps,
  FileUploadItemProgressProps,
  FileUploadItemProps,
  FileUploadItemRemoveProps,
  FileUploadItemSizeProps,
  FileUploadListProps,
  FileUploadMessages,
  FileUploadProps,
  FileUploadStatus,
  FileUploadTriggerProps,
  UseFileUploadItemReturn,
};
export {
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
  FileUploadTrigger,
  useFileUploadItem,
};
