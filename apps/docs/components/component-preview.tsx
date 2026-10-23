import { getDemoFile } from "@/demos/files";
import { cn } from "@/lib/cn";

import { ComponentPreviewContainer } from "./component-preview-container";
import { ComponentSource } from "./component-source";
import { DemoRender } from "./demo-render";

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
  hideCode?: boolean;
  name: string;
}

/**
 * Server component. It only needs the demo's file path here; rendering goes
 * through `DemoLoader`, the single client module that holds a `next/dynamic`
 * entry per demo, so each demo is its own chunk instead of all ~450 being
 * merged into one chunk on every docs page.
 */
export function ComponentPreview({
  className,
  description,
  hideCode = false,
  name,
  ...props
}: ComponentPreviewProps) {
  const file = getDemoFile(name);

  if (!file) {
    return (
      <div
        className={cn(
          "my-4 rounded-md border border-red-200 bg-red-50 p-4",
          className
        )}
      >
        <p className="text-red-600 text-sm">
          Component demo &quot;{name}&quot; not found. Make sure the demo file
          exists under apps/docs/demos and run `pnpm gen:demos`.
        </p>
      </div>
    );
  }

  return (
    <ComponentPreviewContainer
      className={className}
      code={hideCode ? undefined : <ComponentSource name={name} />}
      description={description}
      hideCode={hideCode}
      name={name}
      {...props}
    >
      <DemoRender name={name} />
    </ComponentPreviewContainer>
  );
}
