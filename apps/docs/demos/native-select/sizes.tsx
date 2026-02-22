"use client";

import { NativeSelect, NativeSelectOption } from "@keystoneui/react/native-select";

export default function NativeSelectSizes() {
  return (
    <div className="flex items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="font-medium text-sm">Default</span>
        <NativeSelect size="default">
          <NativeSelectOption value="">Select fruit</NativeSelectOption>
          <NativeSelectOption value="apple">Apple</NativeSelectOption>
          <NativeSelectOption value="banana">Banana</NativeSelectOption>
          <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
        </NativeSelect>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="font-medium text-sm">Small</span>
        <NativeSelect size="sm">
          <NativeSelectOption value="">Select fruit</NativeSelectOption>
          <NativeSelectOption value="apple">Apple</NativeSelectOption>
          <NativeSelectOption value="banana">Banana</NativeSelectOption>
          <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
        </NativeSelect>
      </div>
    </div>
  );
}
