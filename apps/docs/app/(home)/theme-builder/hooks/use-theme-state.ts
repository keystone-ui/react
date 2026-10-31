"use client";

import { parseAsFloat, parseAsStringLiteral, useQueryStates } from "nuqs";
import { fontIds, radiusIds } from "../constants";
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
      // Matches the site the builder lives in, so an untouched builder shows
      // what keystone actually looks like.
      font: parseAsStringLiteral(fontIds).withDefault("geist"),
      mode: parseAsStringLiteral(["light", "dark"] as const).withDefault(
        "dark"
      ),
    },
    // `replace`, not `push`: the colour area fires onChange on every drag
    // tick, and each push made the Back button walk through dozens of
    // intermediate themes. The URL still carries the full state for sharing.
    { history: "replace" }
  );
}

export type ThemeState = ReturnType<typeof useThemeState>[0];
export type SetThemeState = ReturnType<typeof useThemeState>[1];
