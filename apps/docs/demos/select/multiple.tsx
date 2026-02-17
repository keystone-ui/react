"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "keystoneui/select";

const languages: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  csharp: "C#",
  rust: "Rust",
  go: "Go",
  swift: "Swift",
};

function renderValue(value: string[]) {
  if (value.length === 0) {
    return "Select languages…";
  }
  const first = languages[value[0]];
  return value.length > 1 ? `${first} (+${value.length - 1} more)` : first;
}

export default function SelectMultiple() {
  return (
    <Select defaultValue={["javascript", "typescript"]} multiple>
      <SelectTrigger className="w-56">
        <SelectValue>{renderValue}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.entries(languages).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
