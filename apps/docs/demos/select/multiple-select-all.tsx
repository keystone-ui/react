"use client";

import { Label } from "@keystoneui/react/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import { Check, Minus } from "lucide-react";
import { useId, useState } from "react";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java (legacy)", disabled: true },
  { value: "rust", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "swift", label: "Swift" },
];

const labels = Object.fromEntries(languages.map((l) => [l.value, l.label]));

// "Select all" never touches a disabled option: it keeps whatever it had.
const enabled = languages.filter((l) => !l.disabled).map((l) => l.value);

// The row is an ordinary item, activated by the Select like any other: arrows,
// Home/End, Enter, Space, typeahead, clicks, taps and drag-release all reach
// it. Choosing it hands the change handler the value plus this sentinel; the
// handler turns that into "select or clear all" and never stores or passes
// the sentinel on, so the value and the form hold language ids only.
const SELECT_ALL = "__select-all__";

type AllState = "none" | "some" | "all";

function allState(value: string[]): AllState {
  const count = enabled.filter((v) => value.includes(v)).length;
  if (count === 0) {
    return "none";
  }
  return count === enabled.length ? "all" : "some";
}

function renderValue(value: string[]) {
  if (value.length === 0) {
    return "Select languages…";
  }
  if (allState(value) === "all") {
    return "All languages";
  }
  const first = labels[value[0]];
  return value.length > 1 ? `${first} (+${value.length - 1} more)` : first;
}

export default function SelectMultipleSelectAll({
  onValueChange,
}: {
  onValueChange?: (value: string[]) => void;
} = {}) {
  const [value, setValue] = useState(["javascript", "typescript"]);
  const state = allState(value);
  const selectedCount = enabled.filter((v) => value.includes(v)).length;
  const triggerId = useId();
  const countId = useId();

  const change = (next: string[]) => {
    setValue(next);
    onValueChange?.(next);
  };

  const onSelectChange = (next: string[]) => {
    if (!next.includes(SELECT_ALL)) {
      change(next);
      return;
    }
    // The row was chosen: select or clear every enabled option; disabled
    // ones keep their state.
    change(
      state === "all"
        ? value.filter((v) => !enabled.includes(v))
        : [...new Set([...value, ...enabled])]
    );
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={triggerId}>Languages</Label>
      <Select
        multiple
        name="languages"
        onValueChange={onSelectChange}
        value={value}
      >
        <SelectTrigger className="w-56" id={triggerId}>
          <SelectValue>{renderValue}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem
              // One state: selected when every enabled language is. The
              // sentinel is never in the value, so the Select would always
              // mark the row unselected; this prop is applied over its own.
              // The count describes "some", which aria-selected cannot say.
              aria-describedby={countId}
              aria-selected={state === "all"}
              className="pr-8 pl-1.5"
              indicator={null}
              value={SELECT_ALL}
            >
              Select all
              <span
                className="pointer-events-none absolute inset-y-0 right-2 my-auto flex size-4 items-center justify-center"
                data-select-all={state}
              >
                {state === "all" && <Check />}
                {state === "some" && <Minus />}
              </span>
            </SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            {languages.map((l) => (
              <SelectItem disabled={l.disabled} key={l.value} value={l.value}>
                {l.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <span hidden id={countId}>
        {selectedCount} of {enabled.length} languages selected
      </span>
    </div>
  );
}
