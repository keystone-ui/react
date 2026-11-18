"use client";

import { Button } from "@keystoneui/react/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadError,
  FileUploadItem,
  FileUploadItemName,
  FileUploadItemRemove,
  FileUploadItemSize,
  FileUploadList,
  FileUploadTrigger,
} from "@keystoneui/react/file-upload";
import { ItemActions, ItemContent } from "@keystoneui/react/item";
import { type FormEvent, useState } from "react";

export default function FileUploadFormSubmit() {
  const [files, setFiles] = useState<File[]>([]);
  const [sent, setSent] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    // Where the browser cannot set a file input's files, the component
    // drops its `name` and `required` and marks itself: check emptiness and
    // submit from `value` instead. The entries are then absent, so
    // appending them sends each file once.
    if (form.querySelector('[data-form-bridge="unsupported"]')) {
      if (files.length === 0) {
        setMissing(true);
        return;
      }
      for (const file of files) {
        data.append("attachments", file);
      }
    }
    // A real form posts `data` (or uses action/method with
    // encType="multipart/form-data"). Nothing is sent here.
    const names = (data.getAll("attachments") as File[]).map((f) => f.name);
    setSent(names.join(", "));
  }

  return (
    <form
      className="flex max-w-md flex-col gap-3"
      encType="multipart/form-data"
      onReset={() => {
        setSent(null);
        setMissing(false);
      }}
      onSubmit={onSubmit}
    >
      <FileUpload
        aria-label="Attachments"
        multiple
        name="attachments"
        onValueChange={(next) => {
          setFiles(next);
          if (next.length > 0) {
            setMissing(false);
          }
        }}
        required
        value={files}
      >
        <FileUploadDropzone>
          <p>Drag files here, or</p>
          <FileUploadTrigger render={<Button size="sm" variant="outline" />}>
            Choose files
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>
          {() => (
            <FileUploadItem>
              <ItemContent>
                <FileUploadItemName />
                <FileUploadItemSize />
              </ItemContent>
              <ItemActions>
                <FileUploadItemRemove />
              </ItemActions>
            </FileUploadItem>
          )}
        </FileUploadList>
        <FileUploadError />
      </FileUpload>
      {missing ? (
        <p className="text-destructive text-sm" role="alert">
          Choose at least one file.
        </p>
      ) : null}
      <div className="flex gap-2">
        <Button type="reset" variant="outline">
          Reset
        </Button>
        <Button type="submit">Submit</Button>
      </div>
      {sent === null ? null : (
        <p className="text-muted-foreground text-sm">Would send: {sent}</p>
      )}
    </form>
  );
}
