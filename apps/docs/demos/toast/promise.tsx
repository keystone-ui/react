"use client";

import { Button } from "@keystoneui/react/button";
import { Toaster, toast } from "@keystoneui/react/toast";

const uploadFile = (): Promise<{ filename: string; size: number }> =>
  new Promise((resolve) =>
    setTimeout(() => resolve({ filename: "document.pdf", size: 1024 }), 2000)
  );

const saveData = (): Promise<{ count: number }> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve({ count: 42 });
      } else {
        reject(new Error("Failed to save data"));
      }
    }, 2000)
  );

export default function ToastPromise() {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            toast.promise(uploadFile(), {
              loading: "Uploading file...",
              success: (data) =>
                `File ${data.filename} uploaded (${data.size}KB)`,
              error: "Failed to upload file",
            });
          }}
          variant="outline"
        >
          Upload File
        </Button>
        <Button
          onClick={() => {
            toast.promise(saveData(), {
              loading: "Saving changes...",
              success: (data) => `Saved ${data.count} items`,
              error: (err) => err.message,
            });
          }}
          variant="outline"
        >
          Save Data (Random)
        </Button>
      </div>
      <Toaster />
    </div>
  );
}
