import { loader } from "fumadocs-core/source";
import { docs } from "@/.source/index";

const fumadocsSource = docs.toFumadocsSource();

export const source = loader({
  baseUrl: "/docs",
  source: {
    // fumadocs-mdx v11 returns files as a lazy function, unwrap it
    files:
      typeof fumadocsSource.files === "function"
        ? fumadocsSource.files()
        : fumadocsSource.files,
  },
});
