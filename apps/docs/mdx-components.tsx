import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { BlockPreview } from "@/components/block-preview-server";
import { ChangeTag } from "@/components/change-tag";
import { ComponentPreview } from "@/components/component-preview";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    BlockPreview,
    ChangeTag,
    ComponentPreview,
    ...components,
  };
}
