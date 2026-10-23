/**
 * Demo source is highlighted on the server and handed to the client `<Pre>`
 * as one HTML string, not as a React element per token. These pin the
 * conversion helpers and the shape of the result on a real demo file.
 */

import { describe, expect, it } from "vitest";

import {
  getHighlightedSource,
  hastPropertiesToProps,
  styleToObject,
} from "../lib/highlight-source";

describe("styleToObject", () => {
  it("camel-cases regular properties and keeps custom properties verbatim", () => {
    expect(
      styleToObject(
        "background-color:#fff;--shiki-dark-bg:#000;color:red;--shiki-dark:#eee"
      )
    ).toEqual({
      backgroundColor: "#fff",
      "--shiki-dark-bg": "#000",
      color: "red",
      "--shiki-dark": "#eee",
    });
  });

  it("ignores empty declarations and surrounding whitespace", () => {
    expect(styleToObject(" color: red ; ; ")).toEqual({ color: "red" });
  });
});

describe("hastPropertiesToProps", () => {
  it("maps shiki's raw <pre> attributes to React props", () => {
    // This is the shape fumadocs' highlightHast returns today.
    expect(
      hastPropertiesToProps({
        class: "shiki shiki-themes github-light github-dark",
        style: "--shiki-light:#24292e;--shiki-dark:#e1e4e8",
        tabindex: "0",
      })
    ).toEqual({
      className: "shiki shiki-themes github-light github-dark",
      style: { "--shiki-light": "#24292e", "--shiki-dark": "#e1e4e8" },
      tabIndex: 0,
    });
  });

  it("also accepts hast's className array", () => {
    expect(
      hastPropertiesToProps({ className: ["shiki", "github-light"] })
    ).toEqual({ className: "shiki github-light" });
  });
});

describe("getHighlightedSource", () => {
  it("returns the code's inner HTML and the pre element's props", async () => {
    const result = await getHighlightedSource("button/default.tsx");
    expect(result.html).toContain("<span");
    expect(result.html).not.toContain("<pre");
    expect(result.html).toContain("Button");
    expect(result.preProps.className).toContain("shiki");
  });

  it("rejects a file outside the demos directory", async () => {
    await expect(getHighlightedSource("../package.json")).rejects.toThrow();
  });
});
