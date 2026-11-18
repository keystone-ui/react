"use client";

import { Button } from "@keystoneui/react/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemError,
  FileUploadItemName,
  FileUploadItemProgress,
  FileUploadItemRemove,
  FileUploadItemSize,
  FileUploadList,
  type FileUploadStatus,
  FileUploadTrigger,
  useFileUploadItem,
} from "@keystoneui/react/file-upload";
import { ItemActions, ItemContent, ItemMedia } from "@keystoneui/react/item";
import { FileText, RotateCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** One row of the app's own upload state. The id keys the row. */
interface UploadEntry {
  /** Each try gets a new number; results from an older try are dropped. */
  attempt: number;
  error?: string;
  file: File;
  id: string;
  progress: number | null;
  status: FileUploadStatus;
}

/**
 * Applies a result only when it belongs to the entry's current attempt and
 * the file is still selected, so a slow first try cannot overwrite a retry.
 */
export function applyResult(
  entries: UploadEntry[],
  id: string,
  attempt: number,
  patch: Partial<UploadEntry>
) {
  return entries.map((entry) =>
    entry.id === id && entry.attempt === attempt
      ? { ...entry, ...patch }
      : entry
  );
}

function RetryButton({ onRetry }: { onRetry: () => void }) {
  const { name, status, errorId } = useFileUploadItem();
  if (status !== "error") {
    return null;
  }
  return (
    <Button
      aria-describedby={errorId}
      aria-label={`Retry ${name}`}
      onClick={onRetry}
      size="icon-xs"
      variant="ghost"
    >
      <RotateCcw aria-hidden />
    </Button>
  );
}

export default function FileUploadEagerUpload() {
  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  // The app owns transport: it stops its own work on unmount.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending) {
        clearTimeout(timer);
      }
    };
  }, []);

  // A stand-in for a real request: ticks progress, and fails files whose
  // name contains "fail" on their first try.
  function upload(id: string, file: File, attempt: number) {
    let progress = 0;
    const tick = () => {
      progress += 25;
      const done = progress >= 100;
      const failed = done && attempt === 1 && file.name.includes("fail");
      let status: FileUploadStatus = "uploading";
      if (failed) {
        status = "error";
      } else if (done) {
        status = "success";
      }
      setEntries((all) =>
        applyResult(all, id, attempt, {
          progress,
          status,
          error: failed ? "The server did not respond." : undefined,
        })
      );
      if (!done) {
        const timer = setTimeout(tick, 400);
        timers.current.add(timer);
      }
    };
    const timer = setTimeout(tick, 400);
    timers.current.add(timer);
  }

  function retry(id: string) {
    const entry = entries.find((e) => e.id === id);
    if (!entry) {
      return;
    }
    // Start the request outside the state updater, which React may run twice.
    const attempt = entry.attempt + 1;
    upload(id, entry.file, attempt);
    setEntries((all) =>
      all.map((e) =>
        e.id === id ? { ...e, attempt, status: "uploading", progress: 0 } : e
      )
    );
  }

  return (
    <FileUpload
      aria-label="Attachments"
      className="max-w-md"
      multiple
      onValueChange={(files, details) => {
        // Drop state for removed files; their late results then find no row.
        const kept = entries.filter(
          (entry) => !details.removed.includes(entry.file)
        );
        const added = details.added.map((file) => {
          nextId.current += 1;
          const id = `upload-${nextId.current}`;
          upload(id, file, 1);
          return {
            id,
            file,
            status: "uploading" as const,
            progress: 0,
            attempt: 1,
          };
        });
        const byFile = new Map(
          [...kept, ...added].map((entry) => [entry.file, entry])
        );
        setEntries(files.flatMap((file) => byFile.get(file) ?? []));
      }}
      value={entries.map((entry) => entry.file)}
    >
      <FileUploadDropzone>
        <Upload aria-hidden className="size-5" />
        <p>Drag files here, or</p>
        <FileUploadTrigger render={<Button size="sm" variant="outline" />}>
          Choose files
        </FileUploadTrigger>
      </FileUploadDropzone>
      {/* Node form: the app keys each row with its own id. */}
      <FileUploadList>
        {entries.map((entry) => (
          <FileUploadItem
            error={entry.error}
            file={entry.file}
            key={entry.id}
            progress={entry.progress}
            status={entry.status}
          >
            <ItemMedia variant="icon">
              <FileText aria-hidden />
            </ItemMedia>
            <ItemContent>
              <FileUploadItemName />
              <FileUploadItemSize />
            </ItemContent>
            <ItemActions>
              <RetryButton onRetry={() => retry(entry.id)} />
              <FileUploadItemRemove />
            </ItemActions>
            <FileUploadItemProgress />
            <FileUploadItemError />
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );
}
