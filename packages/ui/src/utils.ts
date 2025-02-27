import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getElementSizeStyles(size: string) {
  switch (size) {
    case "xs":
      return "text-xs py-1 px-2.5 rounded";
    case "sm":
      return "text-sm py-1.5 px-3 rounded";
    case "md":
      return "text-base py-2 px-4 rounded";
    case "lg":
      return "text-lg py-2.5 px-5 rounded";
    default:
      return "text-base py-2 px-4 rounded";
  }
} 