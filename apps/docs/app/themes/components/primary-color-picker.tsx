"use client";

import { useCallback, useMemo, useRef } from "react";
import type { SetThemeState, ThemeState } from "../hooks/use-theme-state";
import {
  findMatchingPreset,
  type PrimaryPresetId,
  primaryPresets,
} from "../theme-data";

interface PrimaryColorPickerProps {
  state: ThemeState;
  setState: SetThemeState;
}

export function PrimaryColorPicker({
  state,
  setState,
}: PrimaryColorPickerProps) {
  const { primaryL, primaryC, primaryH } = state;
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const currentPreset = findMatchingPreset(primaryL, primaryC, primaryH);

  const applyPreset = (id: PrimaryPresetId) => {
    const preset = primaryPresets[id];
    setState({
      primaryL: preset.lightness,
      primaryC: preset.chroma,
      primaryH: preset.hue,
    });
  };

  const currentColor = `oklch(${primaryL} ${primaryC} ${primaryH})`;

  // Hue slider gradient
  const trackBackground = useMemo(() => {
    const stops = Array.from({ length: 13 }, (_, i) => {
      const h = (i / 12) * 360;
      return `oklch(${primaryL} ${primaryC} ${h})`;
    });
    return `linear-gradient(to right, ${stops.join(", ")})`;
  }, [primaryL, primaryC]);

  const getHueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) {
        return primaryH;
      }
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(pct * 360 * 100) / 100;
    },
    [primaryH]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      const newHue = getHueFromPosition(e.clientX);
      setState({ primaryH: newHue });

      const onMove = (ev: PointerEvent) => {
        if (isDragging.current) {
          setState({ primaryH: getHueFromPosition(ev.clientX) });
        }
      };
      const onUp = (ev: PointerEvent) => {
        isDragging.current = false;
        (ev.target as HTMLElement).releasePointerCapture(ev.pointerId);
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [getHueFromPosition, setState]
  );

  const thumbPct = (primaryH / 360) * 100;

  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-foreground text-xs">Primary</span>

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-1.5">
        {Object.values(primaryPresets).map((preset) => (
          <button
            className="relative size-6 cursor-pointer rounded-full transition-transform hover:scale-110"
            key={preset.id}
            onClick={() => applyPreset(preset.id)}
            style={{ backgroundColor: preset.swatch }}
            title={preset.label}
            type="button"
          >
            {currentPreset === preset.id && (
              <span className="absolute inset-0 rounded-full ring-2 ring-foreground ring-offset-2 ring-offset-background" />
            )}
          </button>
        ))}
      </div>

      {/* Hue slider */}
      <div
        aria-label="Primary hue"
        aria-valuemax={360}
        aria-valuemin={0}
        aria-valuenow={Math.round(primaryH)}
        className="relative h-5 w-full cursor-pointer touch-none rounded-full"
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 1;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            setState({ primaryH: (primaryH + step) % 360 });
          } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            setState({ primaryH: (primaryH - step + 360) % 360 });
          }
        }}
        onPointerDown={handlePointerDown}
        ref={trackRef}
        role="slider"
        style={{ background: trackBackground }}
        tabIndex={0}
      >
        <div
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
          style={{ left: `${thumbPct}%`, backgroundColor: currentColor }}
        />
      </div>
    </div>
  );
}
