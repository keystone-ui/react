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
import { ImageIcon } from "lucide-react";

export default function FileUploadSingle() {
  return (
    <FileUpload
      accept="image/*"
      aria-label="Profile photo"
      className="max-w-md"
      maxSize={5_000_000}
    >
      <FileUploadDropzone>
        <p>Drop a photo here, or</p>
        <FileUploadTrigger render={<Button size="sm" variant="outline" />}>
          Choose a photo
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList>
        {() => (
          <FileUploadItem>
            <ItemMedia variant="icon">
              <ImageIcon aria-hidden />
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
