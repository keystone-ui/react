"use client";

import { type FontId, fonts } from "../constants";
import type { SetThemeState, ThemeState } from "../hooks/use-theme-state";

interface FontPickerProps {
  state: ThemeState;
  setState: SetThemeState;
}

export function FontPicker({ state, setState }: FontPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-foreground text-xs">Font</span>
      <select
        className="h-8 cursor-pointer rounded-md border border-border bg-background px-2 text-foreground text-xs outline-none focus:ring-2 focus:ring-ring"
        onChange={(e) => setState({ font: e.target.value as FontId })}
        value={state.font}
      >
        {fonts.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label}
          </option>
        ))}
      </select>
    </div>
  );
}
