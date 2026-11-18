"use client";

import { Button } from "@keystoneui/react/button";
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
import { ItemActions, ItemContent, ItemMedia } from "@keystoneui/react/item";
import { FileText, Upload } from "lucide-react";

export default function FileUploadDefault() {
  return (
    <FileUpload aria-label="Attachments" className="max-w-md" multiple>
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
            <ItemMedia variant="icon">
              <FileText aria-hidden />
            </ItemMedia>
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
  );
}
