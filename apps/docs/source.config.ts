import {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { z } from "zod";

import { CONTENT_TYPES } from "./lib/content-types";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    // `_template.mdx` and `_block-template.mdx` are authoring references,
    // not pages. Without this exclusion they were published, listed in
    // llms.txt, and ranked first in search for "button".
    files: ["**/*.{md,mdx}", "!**/_*.{md,mdx}"],
    // The Diátaxis job a page does (apps/docs/WRITING.md). Search tags
    // pages by it. Optional until every page declares one.
    schema: frontmatterSchema.extend({
      contentType: z.enum(CONTENT_TYPES).optional(),
    }),
  },
});

export const blogPosts = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string().date().or(z.date()),
  }),
});

export const changelog = defineCollections({
  type: "doc",
  dir: "content/changelog",
  schema: z.object({
    version: z.string().optional(),
    date: z.string().date().or(z.date()),
    description: z.string(),
    excerpt: z.string().optional(),
  }),
});

export default defineConfig();
