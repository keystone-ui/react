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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@keystoneui/react/item";
import { X } from "lucide-react";
import { useState } from "react";

const LIMIT = 3;

interface SavedAttachment {
  id: string;
  name: string;
}

export default function FileUploadEditForm() {
  const [saved, setSaved] = useState<SavedAttachment[]>([
    { id: "att_1", name: "contract.pdf" },
    { id: "att_2", name: "invoice.pdf" },
  ]);
  const [files, setFiles] = useState<File[]>([]);
  const remaining = Math.max(0, LIMIT - saved.length);

  return (
    <form
      className="flex max-w-md flex-col gap-3"
      onSubmit={(event) => event.preventDefault()}
    >
      {/* Saved attachments: the app's own list, never inside FileUploadList. */}
      <ItemGroup>
        {saved.map((attachment) => (
          <Item key={attachment.id} role="listitem" size="sm">
            <ItemContent>
              <ItemTitle>{attachment.name}</ItemTitle>
              <ItemDescription>Saved</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                aria-label={`Delete ${attachment.name}`}
                onClick={() =>
                  setSaved((all) => all.filter((a) => a.id !== attachment.id))
                }
                size="icon-xs"
                variant="ghost"
              >
                <X aria-hidden />
              </Button>
            </ItemActions>
            <input name="keep[]" type="hidden" value={attachment.id} />
          </Item>
        ))}
      </ItemGroup>

      {/* New files only: limits and required count these. */}
      <FileUpload
        aria-label="New attachments"
        maxFiles={remaining}
        multiple
        name="attachments"
        onValueChange={setFiles}
        required={saved.length === 0}
        value={files}
      >
        <FileUploadDropzone>
          <p>
            {remaining === 0
              ? "Delete a saved file to add another."
              : `Add up to ${remaining} more.`}
          </p>
          {/* Disable the trigger, never the root: a disabled root would stop
              the chosen files from submitting. */}
          <FileUploadTrigger
            disabled={remaining === 0}
            render={<Button size="sm" variant="outline" />}
          >
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
      <Button className="self-start" type="submit">
        Save
      </Button>
    </form>
  );
}
