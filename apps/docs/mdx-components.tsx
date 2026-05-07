import { Step, Steps } from "fumadocs-ui/components/steps";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { BlockPreview } from "@/components/block-preview-server";
import { ChangeTag } from "@/components/change-tag";
import { ComponentPreview } from "@/components/component-preview";
import { ComponentSource } from "@/components/component-source";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    BlockPreview,
    ChangeTag,
    ComponentPreview,
    ComponentSource,
    Step,
    Steps,
    ...components,
  };
}
