"use client";

import { NuqsAdapter } from "nuqs/adapters/react";
import { Suspense, useState } from "react";

import { BaseColorPicker } from "./components/base-color-picker";
import { BuilderHeader } from "./components/builder-header";
import { CodePanel } from "./components/code-panel";
import { FontPicker } from "./components/font-picker";
import { PreviewContainer } from "./components/preview-container";
import { PrimaryColorPicker } from "./components/primary-color-picker";
import { RadiusPicker } from "./components/radius-picker";
import { useThemeState } from "./hooks/use-theme-state";

function ThemeBuilderInner() {
  const [state, setState] = useThemeState();
  const [isCodeVisible, setCodeVisible] = useState(false);

  return (
    <>
      <BuilderHeader
        isCodeVisible={isCodeVisible}
        onToggleCode={() => setCodeVisible((v) => !v)}
        setState={setState}
        state={state}
      />

      {/* Preview area */}
      <div className="relative flex min-h-0 flex-1 flex-col px-4 pb-4">
        <PreviewContainer state={state} />
        <CodePanel
          isVisible={isCodeVisible}
          onClose={() => setCodeVisible(false)}
          state={state}
        />
      </div>

      {/* Bottom controls */}
      <div className="border-border border-t px-4 py-4">
        <div className="mx-auto flex max-w-4xl flex-wrap items-end gap-6">
          <PrimaryColorPicker setState={setState} state={state} />
          <BaseColorPicker setState={setState} state={state} />
          <RadiusPicker setState={setState} state={state} />
          <FontPicker setState={setState} state={state} />
        </div>
      </div>
    </>
  );
}

/**
 * The plain React nuqs adapter reads `location.search` after hydration
 * instead of Next's `useSearchParams`. Under Cache Components the Next
 * adapter would suspend during prerendering and turn this route into a
 * partial prerender, which the Worker's cache interception cannot serve.
 * The cost is a brief default-theme flash on shared links.
 */
export default function ThemeBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-0 flex-1 rounded-xl border border-border bg-muted/20" />
      }
    >
      <NuqsAdapter>
        <ThemeBuilderInner />
      </NuqsAdapter>
    </Suspense>
  );
}
