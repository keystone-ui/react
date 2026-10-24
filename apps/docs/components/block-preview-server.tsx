import { getDemoFile } from "@/demos/files";
import { cn } from "@/lib/cn";

import { BlockPreviewContainer } from "./block-preview";
import { ComponentSource } from "./component-source";

interface BlockPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  description?: string;
  name: string;
}

/**
 * Server component. The block itself renders inside an iframe pointed at
 * `/preview/<name>`, so only the source listing is produced here.
 */
export function BlockPreview({
  className,
  description,
  name,
  ...props
}: BlockPreviewProps) {
  const file = getDemoFile(name);

  if (!file) {
    return (
      <div
        className={cn(
          "my-4 rounded-md border border-destructive/30 bg-destructive/10 p-4",
          className
        )}
      >
        <p className="text-destructive text-sm">
          Block demo &quot;{name}&quot; not found. Make sure the demo file
          exists under apps/docs/demos/blocks and run `pnpm gen:demos`.
        </p>
      </div>
    );
  }

  return (
    <BlockPreviewContainer
      className={className}
      description={description}
      name={name}
      {...props}
    >
      <ComponentSource name={name} />
    </BlockPreviewContainer>
  );
}
