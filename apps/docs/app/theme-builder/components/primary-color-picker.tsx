"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import { converter, formatHex } from "culori";
import { useMemo } from "react";
import {
  type Color,
  ColorArea,
  ColorSlider,
  ColorThumb,
  parseColor,
  SliderTrack,
} from "react-aria-components";
import type { SetThemeState, ThemeState } from "../hooks/use-theme-state";
import {
  findMatchingPreset,
  type PrimaryPresetId,
  primaryPresets,
} from "../theme-data";

const toOklch = converter("oklch");

interface PrimaryColorPickerProps {
  setState: SetThemeState;
  state: ThemeState;
}

export function PrimaryColorPicker({
  state,
  setState,
}: PrimaryColorPickerProps) {
  const { primaryL, primaryC, primaryH } = state;

  const currentColor = `oklch(${primaryL} ${primaryC} ${primaryH})`;
  const currentPreset = findMatchingPreset(primaryL, primaryC, primaryH);

  const hex = useMemo(() => {
    return (
      formatHex({ mode: "oklch", l: primaryL, c: primaryC, h: primaryH }) ||
      "#000000"
    );
  }, [primaryL, primaryC, primaryH]);

  const colorValue = useMemo(() => {
    try {
      return parseColor(hex).toFormat("hsb");
    } catch {
      return parseColor("#000000").toFormat("hsb");
    }
  }, [hex]);

  const handleColorChange = (color: Color) => {
    const hexStr = color.toString("hex");
    const oklchColor = toOklch(hexStr);
    if (oklchColor) {
      setState({
        primaryL: Math.round(oklchColor.l * 1000) / 1000,
        primaryC: Math.round((oklchColor.c ?? 0) * 1000) / 1000,
        primaryH: Math.round((oklchColor.h ?? 0) * 1000) / 1000,
      });
    }
  };

  const applyPreset = (id: PrimaryPresetId) => {
    const preset = primaryPresets[id];
    setState({
      primaryL: preset.lightness,
      primaryC: preset.chroma,
      primaryH: preset.hue,
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="font-medium text-foreground text-xs">Theme</span>
      <Popover>
        <PopoverTrigger className="flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2.5 text-foreground text-xs outline-none focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2">
          <span
            className="size-4 shrink-0 rounded-full border border-border"
            style={{ backgroundColor: currentColor }}
          />
          <span className="text-muted-foreground">{hex.toUpperCase()}</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-3">
          <div className="flex flex-col gap-3">
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

            {/* 2D color area (saturation x brightness) */}
            <ColorArea
              className="h-40 w-full rounded-lg"
              colorSpace="hsb"
              onChange={handleColorChange}
              style={({ defaultStyle }) => ({
                ...defaultStyle,
              })}
              value={colorValue}
              xChannel="saturation"
              yChannel="brightness"
            >
              <ColorThumb
                className="size-5 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                style={({ defaultStyle }) => ({
                  ...defaultStyle,
                })}
              />
            </ColorArea>

            {/* Hue slider */}
            <ColorSlider
              channel="hue"
              className="w-full"
              colorSpace="hsb"
              onChange={handleColorChange}
              value={colorValue}
            >
              <SliderTrack
                className="h-5 w-full rounded-full"
                style={({ defaultStyle }) => ({
                  ...defaultStyle,
                  background: `${defaultStyle.background}, repeating-conic-gradient(#CCC 0% 25%, white 0% 50%) 50% / 16px 16px`,
                })}
              >
                <ColorThumb
                  className="top-1/2 size-4 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
                  style={({ defaultStyle }) => ({
                    ...defaultStyle,
                  })}
                />
              </SliderTrack>
            </ColorSlider>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
