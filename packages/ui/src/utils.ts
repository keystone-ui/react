import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Merge a part's own classes with a consumer `className` that Base UI lets be a function of the part's state: `cn()` drops a function, so one is wrapped and merged over `base` after Base UI calls it.
 */
export function mergeClassName<State>(
  base: string,
  className: string | ((state: State) => string | undefined) | undefined
): string | ((state: State) => string) {
  return typeof className === "function"
    ? (state) => cn(base, className(state))
    : cn(base, className);
}

/** Shared height class for popup list items (DropdownMenu, Select, Combobox) */
export const POPUP_ITEM_HEIGHT = "h-9 [[data-size=compact]_&]:h-8";
