import type { VirtualFile } from "fumadocs-core/source";
import { loader } from "fumadocs-core/source";
import { docs } from "@/.source/index";

const fumadocsSource = docs.toFumadocsSource();

// fumadocs-mdx v11 may return files as a lazy function at runtime
const rawFiles = fumadocsSource.files as VirtualFile[] | (() => VirtualFile[]);
const files = typeof rawFiles === "function" ? rawFiles() : rawFiles;

export const source = loader({
  baseUrl: "/docs",
  source: { files },
});
