"use client";

import { Field, FieldGroup, FieldLabel } from "@keystoneui/react/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@keystoneui/react/native-select";

export default function NativeSelectFormExample() {
  return (
    <form
      className="w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="form-status">Status</FieldLabel>
          <NativeSelect id="form-status" name="status">
            <NativeSelectOption value="">Select status</NativeSelectOption>
            <NativeSelectOption value="todo">Todo</NativeSelectOption>
            <NativeSelectOption value="in-progress">
              In Progress
            </NativeSelectOption>
            <NativeSelectOption value="done">Done</NativeSelectOption>
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="form-priority">Priority</FieldLabel>
          <NativeSelect id="form-priority" name="priority">
            <NativeSelectOption value="">Select priority</NativeSelectOption>
            <NativeSelectOption value="low">Low</NativeSelectOption>
            <NativeSelectOption value="medium">Medium</NativeSelectOption>
            <NativeSelectOption value="high">High</NativeSelectOption>
            <NativeSelectOption value="urgent">Urgent</NativeSelectOption>
          </NativeSelect>
        </Field>
      </FieldGroup>
    </form>
  );
}
