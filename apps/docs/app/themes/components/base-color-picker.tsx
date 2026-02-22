"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@keystoneui/react/popover";
import type { SetThemeState, ThemeState } from "../hooks/use-theme-state";
import type { BaseColorId } from "../theme-data";

interface BaseColorPickerProps {
  state: ThemeState;
  setState: SetThemeState;
}

const swatches: Array<{ id: BaseColorId; label: string; swatch: string }> = [
  { id: "zinc", label: "Zinc", swatch: "oklch(0.552 0.016 285.938)" },
  { id: "slate", label: "Slate", swatch: "oklch(0.554 0.046 257.417)" },
  { id: "stone", label: "Stone", swatch: "oklch(0.553 0.013 58.071)" },
  { id: "gray", label: "Gray", swatch: "oklch(0.551 0.027 264.364)" },
  { id: "neutral", label: "Neutral", swatch: "oklch(0.556 0 0)" },
];

export function BaseColorPicker({ state, setState }: BaseColorPickerProps) {
  const currentSwatch =
    swatches.find((s) => s.id === state.base) ?? swatches[0];

  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-foreground text-xs">Base Color</span>
      <Popover>
        <PopoverTrigger className="flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2.5 text-foreground text-xs outline-none focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2">
          <span
            className="size-4 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: currentSwatch.swatch }}
          />
          <span className="text-muted-foreground">{currentSwatch.label}</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-3">
          <div className="flex gap-2">
            {swatches.map((s) => (
              <button
                className="relative size-7 cursor-pointer rounded-full transition-transform hover:scale-110"
                key={s.id}
                onClick={() => setState({ base: s.id })}
                style={{ backgroundColor: s.swatch }}
                title={s.label}
                type="button"
              >
                {state.base === s.id && (
                  <span className="absolute inset-0 rounded-full ring-2 ring-foreground ring-offset-2 ring-offset-background" />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
