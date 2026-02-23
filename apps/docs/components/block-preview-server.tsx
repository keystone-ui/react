import { getDemo } from "@/demos";
import { cn } from "@/lib/cn";

import { BlockPreviewContainer } from "./block-preview";
import { ComponentSource } from "./component-source";

interface BlockPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
  name: string;
}

export function BlockPreview({
  className,
  description,
  name,
  ...props
}: BlockPreviewProps) {
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
          Block demo &quot;{name}&quot; not found. Make sure the demo is
          registered in the demos index.
        </p>
      </div>
    );
  }

  const Component = demo.component;

  return (
    <BlockPreviewContainer
      className={className}
      description={description}
      name={name}
      {...props}
    >
      <Component />
      {demo.file && <ComponentSource name={name} />}
    </BlockPreviewContainer>
  );
}
