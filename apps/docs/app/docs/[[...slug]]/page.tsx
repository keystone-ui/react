import type { TableOfContents } from "fumadocs-core/server";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import type { MDXProps } from "mdx/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { FC } from "react";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

// fumadocs-mdx v11 lazy file loading loses these types from PageData
interface DocsPageData {
  title: string;
  description?: string;
  body: FC<MDXProps>;
  toc: TableOfContents;
  full?: boolean;
}

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const data = page.data as unknown as DocsPageData;
  const MDX = data.body;

  return (
    <DocsPage full={data.full} toc={data.toc}>
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription>{data.description}</DocsDescription>
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
