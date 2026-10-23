import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as previewAnnotations from "./preview";

// The a11y annotations register the axe check that `parameters.a11y.test`
// controls; without them the parameter is inert under Vitest.
const _annotations = setProjectAnnotations([
  a11yAddonAnnotations,
  previewAnnotations,
]);
