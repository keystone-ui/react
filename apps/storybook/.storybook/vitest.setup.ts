import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import { commands, page, userEvent } from "vitest/browser";
import * as previewAnnotations from "./preview";

// The a11y annotations register the axe check that `parameters.a11y.test`
// controls; without them the parameter is inert under Vitest.
const _annotations = setProjectAnnotations([
  a11yAddonAnnotations,
  previewAnnotations,
]);

// Real pointer and keyboard input (Playwright through Vitest), for plays
// that need what synthetic events cannot give: `:hover`, native Tab order.
// Stories read it from `globalThis` and skip those checks when it is absent,
// so Storybook itself never imports `vitest/browser`.
(globalThis as { __realUserEvent?: typeof userEvent }).__realUserEvent =
  userEvent;
// The same for the viewport: plays that measure a layout at a phone width
// resize the frame through it, and skip those checks when it is absent.
(globalThis as { __browserPage?: typeof page }).__browserPage = page;

// A held press (custom commands in vitest.config.ts), for plays that must
// see `:active` while the pointer is still down. Absent under Storybook.
(globalThis as { __realCommands?: typeof commands }).__realCommands = commands;
