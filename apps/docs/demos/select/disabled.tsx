"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";

const disabledSelectFruits: Record<string, string> = {
  apple: "Apple",
  banana: "Banana",
};

const disabledItemFruits: Record<string, string> = {
  apple: "Apple",
  banana: "Banana",
  blueberry: "Blueberry (out of stock)",
  grapes: "Grapes (out of stock)",
  pineapple: "Pineapple",
};

export default function SelectDisabled() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-sm">Disabled select</span>
        <Select disabled items={disabledSelectFruits}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-sm">Disabled items</span>
        <Select items={disabledItemFruits}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem disabled value="blueberry">
                Blueberry (out of stock)
              </SelectItem>
              <SelectItem disabled value="grapes">
                Grapes (out of stock)
              </SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
