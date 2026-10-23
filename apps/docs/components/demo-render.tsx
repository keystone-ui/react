import { Suspense } from "react";

import { DemoLoader } from "@/demos/loader";
import { isClientOnlyDemo } from "@/lib/client-only-demos";

/**
 * Server component. Renders a demo through the client loader; demos that
 * read the clock at render (see lib/client-only-demos.ts) are wrapped in a
 * Suspense boundary so the prerendered shell carries a placeholder and the
 * component itself renders after hydration.
 */
export function DemoRender({ name }: { name: string }) {
  const demo = <DemoLoader name={name} />;
  if (!isClientOnlyDemo(name)) {
    return demo;
  }
  return <Suspense fallback={<DemoFallback />}>{demo}</Suspense>;
}

function DemoFallback() {
  return (
    <div
      aria-hidden="true"
      className="h-72 w-full max-w-xs animate-pulse rounded-lg bg-muted/60"
    />
  );
}
