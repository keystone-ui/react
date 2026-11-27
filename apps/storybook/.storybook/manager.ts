import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// Brand the sidebar with the Keystone mark. The logo SVGs live in
// ../public (served through `staticDirs`) and come from brand/build.py.
addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Keystone UI",
    brandUrl: "https://keystoneui.io",
    brandImage: "./logo-full-dark.svg",
    brandTarget: "_blank",
  }),
});
