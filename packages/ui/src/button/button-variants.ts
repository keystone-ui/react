import { cva, type VariantProps } from "class-variance-authority";

// Using shadcn theme variables
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 whitespace-nowrap relative cursor-pointer z-0 rounded font-medium overflow-hidden select-none transition-all disabled:cursor-not-allowed focus:ring-0 focus:ring-offset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-outline",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50 disabled:text-primary-foreground/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:bg-secondary/50 disabled:text-secondary-foreground/50",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:bg-destructive/50 disabled:text-destructive-foreground/50 focus-visible:outline-destructive/50",
        ghost: "bg-transparent hover:bg-accent disabled:bg-transparent disabled:text-foreground/50",
        outline: "bg-transparent border border-border hover:bg-accent disabled:bg-transparent disabled:border-border/50 disabled:text-foreground/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "text-xs h-6 py-1 px-2.5",
        sm: "text-sm h-8 py-1.5 px-3",
        default: "text-sm h-10 px-4 py-2",
        lg: "text-base h-12 py-3.5 px-5",
        icon: "size-10 p-2",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariantsProps = VariantProps<typeof buttonVariants>; 