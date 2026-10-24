"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import { type FontId, fonts } from "../constants";
import type { SetThemeState, ThemeState } from "../hooks/use-theme-state";

interface FontPickerProps {
  setState: SetThemeState;
  state: ThemeState;
}

export function FontPicker({ state, setState }: FontPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-foreground text-xs">Font</span>
      <Select
        onValueChange={(val) => setState({ font: val as FontId })}
        value={state.font}
      >
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {fonts.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
