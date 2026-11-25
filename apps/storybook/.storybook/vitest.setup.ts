import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import { afterEach, beforeEach } from "vitest";
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

declare module "vitest/browser" {
  interface BrowserCommands {
    pointerMoveOffscreen: () => Promise<void>;
    pointerRelease: () => Promise<boolean>;
  }
}

// Every story in a file shares one page and one real mouse. A play that
// fails or times out between its `pointerDown` and `pointerUp` leaves the
// button down, and the next story's first move would arrive with
// `buttons === 1`. Before each story, and again after it, let go of a press
// `pointerDown` left held: the pointer moves outside the viewport, then the
// button goes up. When the record holds no press this sends nothing. A
// release that fails rejects the hook, so the story fails before or after its
// play instead of starting with the button in an unknown state.
beforeEach(async () => {
  await commands.pointerRelease();
});
afterEach(async () => {
  await commands.pointerRelease();
});

// The tester iframe's size, for plays that must measure a layout at a given
// viewport width (media queries and `useIsMobile`). Absent under Storybook.
(globalThis as { __realPage?: typeof page }).__realPage = page;
