/**
 * Type contracts. `vitest run` does not typecheck, so these assertions are
 * checked by `tsc6 -p tsconfig.type-tests.json`, which the package's `test`
 * script runs before vitest (run it from `packages/ui`). Under vitest the
 * blocks below only keep the file from being an empty suite.
 */

import type { ChangeEvent, ComponentProps, Ref } from "react";
import { describe, expectTypeOf, it } from "vitest";

import {
  FileUpload,
  type FileUploadChangeDetails,
  FileUploadDropzone,
  type FileUploadDropzoneProps,
  type FileUploadError,
  type FileUploadErrorProps,
  type FileUploadItemError,
  type FileUploadItemErrorProps,
  FileUploadItemName,
  type FileUploadItemNameProps,
  FileUploadItemProgress,
  type FileUploadItemRemove,
  type FileUploadItemRemoveProps,
  type FileUploadMessages,
  type FileUploadStatus,
  type FileUploadTrigger,
  type FileUploadTriggerProps,
  type UseFileUploadItemReturn,
  type useFileUploadItem,
} from "./file-upload";

describe("file-upload types", () => {
  it("accepts a bare progress part and refuses a second value source", () => {
    const bare = <FileUploadItemProgress />;
    const styled = (
      <FileUploadItemProgress
        aria-label="Progress"
        className="mt-1"
        color="success"
        getAriaValueText={(formatted) => formatted ?? "Unknown"}
        locale="de-DE"
      />
    );
    // @ts-expect-error the value always comes from the row's `progress`
    const withValue = <FileUploadItemProgress value={10} />;
    // @ts-expect-error the scale is fixed at 0-100
    const withMin = <FileUploadItemProgress min={0} />;
    // @ts-expect-error the scale is fixed at 0-100
    const withMax = <FileUploadItemProgress max={100} />;
    expectTypeOf(bare).not.toBeNever();
    expectTypeOf(styled).not.toBeNever();
    expectTypeOf(withValue).not.toBeNever();
    expectTypeOf(withMin).not.toBeNever();
    expectTypeOf(withMax).not.toBeNever();
  });

  it("accepts the root's ordinary div props, onChange and the native aria-invalid", () => {
    const onChange = (event: ChangeEvent<HTMLDivElement>) =>
      event.currentTarget.tagName;
    const withChange = <FileUpload onChange={onChange}>x</FileUpload>;
    const grammar = <FileUpload aria-invalid="grammar">x</FileUpload>;
    const spelling = <FileUpload aria-invalid="spelling">x</FileUpload>;
    expectTypeOf(withChange).not.toBeNever();
    expectTypeOf(grammar).not.toBeNever();
    expectTypeOf(spelling).not.toBeNever();
  });

  it("types the item hook's file as optional and its metadata as present", () => {
    type Item = ReturnType<typeof useFileUploadItem>;
    expectTypeOf<Item["file"]>().toEqualTypeOf<File | undefined>();
    expectTypeOf<Item["name"]>().toEqualTypeOf<string>();
    expectTypeOf<Item["size"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<Item["type"]>().toEqualTypeOf<string>();
    expectTypeOf<Item["errorId"]>().toEqualTypeOf<string | undefined>();
  });

  it("names the message keys and the change reasons", () => {
    expectTypeOf<keyof FileUploadMessages>().toEqualTypeOf<
      | "added"
      | "removed"
      | "replaced"
      | "cleared"
      | "rejected"
      | "rejection"
      | "required"
      | "itemSucceeded"
      | "itemFailed"
      | "itemFailedText"
      | "progressLabel"
      | "removeLabel"
    >();
    expectTypeOf<FileUploadChangeDetails["reason"]>().toEqualTypeOf<
      "add" | "replace" | "remove" | "reset"
    >();
  });

  it("types Base UI's cancellation on the handlers the docs list", () => {
    const paste = (
      <FileUpload allowPaste onPaste={(event) => event.preventBaseUIHandler()}>
        x
      </FileUpload>
    );
    const zone = (
      <FileUploadDropzone
        onClick={(event) => event.preventBaseUIHandler()}
        onDrop={(event) => event.preventBaseUIHandler()}
      />
    );
    expectTypeOf(paste).not.toBeNever();
    expectTypeOf(zone).not.toBeNever();
  });

  it("lets exactly five message keys be null", () => {
    const silenced = (
      <FileUpload
        messages={{
          added: null,
          removed: null,
          rejected: null,
          itemSucceeded: null,
          itemFailed: null,
        }}
      >
        x
      </FileUpload>
    );
    // @ts-expect-error a replacement is always one spoken message
    const replaced = <FileUpload messages={{ replaced: null }}>x</FileUpload>;
    // @ts-expect-error a reset that empties the value is always spoken
    const cleared = <FileUpload messages={{ cleared: null }}>x</FileUpload>;
    // @ts-expect-error the required error always has text
    const required = <FileUpload messages={{ required: null }}>x</FileUpload>;
    // @ts-expect-error every rejection error has visible text
    const rejection = <FileUpload messages={{ rejection: null }}>x</FileUpload>;
    expectTypeOf(silenced).not.toBeNever();
    expectTypeOf(replaced).not.toBeNever();
    expectTypeOf(cleared).not.toBeNever();
    expectTypeOf(required).not.toBeNever();
    expectTypeOf(rejection).not.toBeNever();
  });

  it("renders the name itself, so the name part takes no children", () => {
    const bare = <FileUploadItemName className="text-xs" />;
    // @ts-expect-error the part renders the file's name; children are not used
    const withChildren = <FileUploadItemName>report.pdf</FileUploadItemName>;
    expectTypeOf(bare).not.toBeNever();
    expectTypeOf(withChildren).not.toBeNever();
  });

  it("exports each part's props under its own name, as the part takes them", () => {
    expectTypeOf<FileUploadDropzoneProps>().toEqualTypeOf<
      ComponentProps<typeof FileUploadDropzone>
    >();
    expectTypeOf<FileUploadTriggerProps>().toEqualTypeOf<
      ComponentProps<typeof FileUploadTrigger>
    >();
    expectTypeOf<FileUploadItemRemoveProps>().toEqualTypeOf<
      ComponentProps<typeof FileUploadItemRemove>
    >();
    expectTypeOf<FileUploadItemNameProps>().toEqualTypeOf<
      ComponentProps<typeof FileUploadItemName>
    >();
    expectTypeOf<FileUploadErrorProps>().toEqualTypeOf<
      ComponentProps<typeof FileUploadError>
    >();
    expectTypeOf<FileUploadItemErrorProps>().toEqualTypeOf<
      ComponentProps<typeof FileUploadItemError>
    >();
    // The button parts keep a button ref.
    expectTypeOf<FileUploadTriggerProps["ref"]>().toEqualTypeOf<
      Ref<HTMLButtonElement> | undefined
    >();
    expectTypeOf<FileUploadItemRemoveProps["ref"]>().toEqualTypeOf<
      Ref<HTMLButtonElement> | undefined
    >();
  });

  it("names the item hook's return type", () => {
    expectTypeOf<UseFileUploadItemReturn>().toEqualTypeOf<{
      name: string;
      size: number | undefined;
      type: string;
      file: File | undefined;
      status: FileUploadStatus;
      progress: number | null | undefined;
      errorId: string | undefined;
    }>();
    expectTypeOf<
      ReturnType<typeof useFileUploadItem>
    >().toEqualTypeOf<UseFileUploadItemReturn>();
    // Still a plain object type, so it fits an index-signature type.
    const asRecord: Record<string, unknown> = {} as UseFileUploadItemReturn;
    expectTypeOf(asRecord).not.toBeNever();
  });
});
