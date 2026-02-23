"use client";

import { Field, FieldError, FieldLabel } from "@keystoneui/react/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@keystoneui/react/native-select";

export default function NativeSelectInvalid() {
  return (
    <Field data-invalid>
      <FieldLabel>Fruit</FieldLabel>
      <NativeSelect aria-invalid="true">
        <NativeSelectOption value="">Select a fruit</NativeSelectOption>
        <NativeSelectOption value="apple">Apple</NativeSelectOption>
        <NativeSelectOption value="banana">Banana</NativeSelectOption>
        <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
      </NativeSelect>
      <FieldError>Please select a fruit.</FieldError>
    </Field>
  );
}
