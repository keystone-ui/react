import { getDemo } from "@/demos";
import { cn } from "@/lib/cn";

import { ComponentPreviewContainer } from "./component-preview-container";
import { ComponentSource } from "./component-source";

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
  hideCode?: boolean;
  name: string;
}

export function ComponentPreview({
  className,
  description,
  hideCode = false,
  name,
  ...props
}: ComponentPreviewProps) {
  const demo = getDemo(name);

  if (!demo) {
    return (
      <div
        className={cn(
          "my-4 rounded-md border border-red-200 bg-red-50 p-4",
          className
        )}
      >
        <p className="text-red-600 text-sm">
          Component demo &quot;{name}&quot; not found. Make sure the demo is
          registered in the demos index.
        </p>
      </div>
    );
  }

  const Component = demo.component;

  return (
    <ComponentPreviewContainer
      className={className}
      description={description}
      hideCode={hideCode}
      name={name}
      {...props}
    >
      <Component />
      {!hideCode && demo.file && <ComponentSource name={name} />}
    </ComponentPreviewContainer>
  );
}
