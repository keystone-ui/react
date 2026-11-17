"use client";

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
  FileUploadItem,
  FileUploadItemName,
  FileUploadItemRemove,
  FileUploadItemSize,
  FileUploadList,
  FileUploadTrigger,
} from "@keystoneui/react/file-upload";
import { ItemActions, ItemContent } from "@keystoneui/react/item";
import { Upload } from "lucide-react";
import { useState } from "react";

export default function FileUploadWithField() {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ message: string }[]>([]);

  return (
    <Field className="max-w-md">
      <FieldLabel id="attachments-label">Attachments</FieldLabel>
      <FileUpload
        accept=".pdf,image/*"
        aria-describedby="attachments-hint attachments-error"
        aria-invalid={errors.length > 0}
        aria-labelledby="attachments-label"
        maxFiles={3}
        maxSize={10_000_000}
        // FieldError below is the only voice for rejections.
        messages={{ rejected: null }}
        multiple
        onFilesRejected={(rejections) =>
          setErrors(rejections.flatMap((rejection) => rejection.errors))
        }
        onValueChange={(next) => {
          setFiles(next);
          setErrors([]);
        }}
        value={files}
      >
        <FileUploadDropzone>
          <Upload aria-hidden className="size-5" />
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
      </FileUpload>
      <FieldDescription id="attachments-hint">
        PDF or images, up to 3 files of 10 MB each.
      </FieldDescription>
      <FieldError errors={errors} id="attachments-error" />
    </Field>
  );
}
