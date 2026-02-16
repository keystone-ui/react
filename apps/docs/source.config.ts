import {
  defineCollections,
  defineConfig,
  defineDocs,
} from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content/docs",
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

export default defineConfig();
