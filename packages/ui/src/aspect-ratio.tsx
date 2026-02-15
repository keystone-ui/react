import { cn } from "./utils";

interface AspectRatioProps extends React.ComponentProps<"div"> {
  /** The desired aspect ratio expressed as width / height (e.g. 16/9). */
  ratio: number;
}

function AspectRatio({ ratio, className, ...props }: AspectRatioProps) {
  return (
    <div
      className={cn("relative aspect-(--ratio)", className)}
      data-slot="aspect-ratio"
      style={{ "--ratio": ratio } as React.CSSProperties}
      {...props}
    />
  );
}

export { AspectRatio };
export type { AspectRatioProps };
