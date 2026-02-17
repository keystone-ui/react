"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "keystoneui/select";
import { type RadiusId, radiusOptions } from "../constants";
import type { SetThemeState, ThemeState } from "../hooks/use-theme-state";

interface RadiusPickerProps {
  state: ThemeState;
  setState: SetThemeState;
}

export function RadiusPicker({ state, setState }: RadiusPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-foreground text-xs">Radius</span>
      <Select
        onValueChange={(val) => setState({ radius: val as RadiusId })}
        value={state.radius}
      >
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {radiusOptions.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
