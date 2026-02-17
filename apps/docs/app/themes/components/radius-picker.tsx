"use client";

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
      <select
        className="h-8 cursor-pointer rounded-md border border-border bg-background px-2 text-foreground text-xs outline-none focus:ring-2 focus:ring-ring"
        onChange={(e) => setState({ radius: e.target.value as RadiusId })}
        value={state.radius}
      >
        {radiusOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
