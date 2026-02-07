import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Shared height class for popup list items (DropdownMenu, Select, Combobox) */
export const POPUP_ITEM_HEIGHT = "h-9 [[data-size=compact]_&]:h-8";