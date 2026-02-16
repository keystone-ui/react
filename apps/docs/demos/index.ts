import type { ComponentType } from "react";

import ButtonAsLink from "./button/as-link";
import ButtonDefault from "./button/default";
import ButtonDisabled from "./button/disabled";
import ButtonFullWidth from "./button/full-width";
import ButtonIconButtons from "./button/icon-buttons";
import ButtonLink from "./button/link";
import ButtonLoading from "./button/loading";
import ButtonRounded from "./button/rounded";
import ButtonSizes from "./button/sizes";
import ButtonVariants from "./button/variants";
import ButtonWithIcons from "./button/with-icons";

export interface DemoItem {
  component: ComponentType;
  file: string;
}

export const demos: Record<string, DemoItem> = {
  "button-default": {
    component: ButtonDefault,
    file: "button/default.tsx",
  },
  "button-variants": {
    component: ButtonVariants,
    file: "button/variants.tsx",
  },
  "button-sizes": {
    component: ButtonSizes,
    file: "button/sizes.tsx",
  },
  "button-link": {
    component: ButtonLink,
    file: "button/link.tsx",
  },
  "button-icon-buttons": {
    component: ButtonIconButtons,
    file: "button/icon-buttons.tsx",
  },
  "button-with-icons": {
    component: ButtonWithIcons,
    file: "button/with-icons.tsx",
  },
  "button-loading": {
    component: ButtonLoading,
    file: "button/loading.tsx",
  },
  "button-disabled": {
    component: ButtonDisabled,
    file: "button/disabled.tsx",
  },
  "button-full-width": {
    component: ButtonFullWidth,
    file: "button/full-width.tsx",
  },
  "button-as-link": {
    component: ButtonAsLink,
    file: "button/as-link.tsx",
  },
  "button-rounded": {
    component: ButtonRounded,
    file: "button/rounded.tsx",
  },
};

export function getDemo(name: string): DemoItem | undefined {
  return demos[name];
}
