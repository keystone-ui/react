import { readFile } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

import { highlightHast } from "fumadocs-core/highlight";
import type { Element, Properties } from "hast";
import { toHtml } from "hast-util-to-html";
import type { CSSProperties } from "react";

/**
 * Highlights a demo's source on the server and returns it as one HTML
 * string plus the `<pre>` element's props.
 *
 * Why not `highlight()`'s element tree: the tree is rendered inside the
 * client `<Pre>`, so every token became a React element serialised twice,
 * once as HTML and once as Flight props. For the button page that was
 * ~1,700 spans and a 205 KB RSC payload. A single `dangerouslySetInnerHTML`
 * string costs one Flight node.
 */
export async function getHighlightedSource(file: string): Promise<{
  html: string;
  preProps: PreProps;
}> {
  const demosRoot = join(process.cwd(), "demos");
  const filePath = resolve(demosRoot, file);
  if (!filePath.startsWith(demosRoot + sep)) {
    throw new Error(`demo source must live under demos/: ${file}`);
  }
  const code = await readFile(filePath, "utf-8");
  const root = await highlightHast(code.trimEnd(), { lang: "tsx" });
  const pre = root.children.find(
    (node): node is Element => node.type === "element" && node.tagName === "pre"
  );
  if (!pre) {
    throw new Error(`highlighter returned no <pre> for ${file}`);
  }
  return {
    // Only the children: the wrapping <pre> is rendered by <Pre>, with
    // shiki's own classes and theme variables forwarded as props.
    html: toHtml(pre.children),
    preProps: hastPropertiesToProps(pre.properties),
  };
}

export interface PreProps {
  className?: string;
  style?: CSSProperties;
  tabIndex?: number;
}

const HYPHEN_LOWER = /-([a-z])/g;

/** `background-color:#fff;--x:1` → `{ backgroundColor: "#fff", "--x": "1" }` */
export function styleToObject(style: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const declaration of style.split(";")) {
    const idx = declaration.indexOf(":");
    if (idx === -1) {
      continue;
    }
    const name = declaration.slice(0, idx).trim();
    const value = declaration.slice(idx + 1).trim();
    if (!(name && value)) {
      continue;
    }
    const key = name.startsWith("--")
      ? name
      : name.replace(HYPHEN_LOWER, (_, c: string) => c.toUpperCase());
    out[key] = value;
  }
  return out as CSSProperties;
}

export function hastPropertiesToProps(properties: Properties = {}): PreProps {
  const props: PreProps = {};
  // shiki emits raw attribute names (`class`, `tabindex`); hast proper uses
  // `className` arrays. Accept both.
  const classValue = properties.className ?? properties.class;
  if (Array.isArray(classValue)) {
    props.className = classValue.map(String).join(" ");
  } else if (typeof classValue === "string") {
    props.className = classValue;
  }
  if (typeof properties.style === "string") {
    props.style = styleToObject(properties.style);
  }
  if (properties.tabindex !== undefined && properties.tabindex !== null) {
    props.tabIndex = Number(properties.tabindex);
  }
  return props;
}
