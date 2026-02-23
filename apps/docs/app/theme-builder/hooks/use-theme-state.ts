"use client";

import {
  parseAsFloat,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { radiusIds } from "../constants";
import { baseColorIds } from "../theme-data";

/**
 * Primary color is stored as raw OKLCH components so both presets
 * and custom‑picked colours share the same state model.
 *
 * Defaults match the "zinc" primary preset (neutral dark primary,
 * same as the current Keystone UI default).
 */
export function useThemeState() {
  return useQueryStates(
    {
      base: parseAsStringLiteral(baseColorIds).withDefault("zinc"),
      primaryL: parseAsFloat.withDefault(0.21),
      primaryC: parseAsFloat.withDefault(0.006),
      primaryH: parseAsFloat.withDefault(285.885),
      radius: parseAsStringLiteral(radiusIds).withDefault("default"),
      font: parseAsString.withDefault("inter"),
      mode: parseAsStringLiteral(["light", "dark"] as const).withDefault(
        "dark"
      ),
    },
    { history: "push" }
  );
}

export type ThemeState = ReturnType<typeof useThemeState>[0];
export type SetThemeState = ReturnType<typeof useThemeState>[1];
