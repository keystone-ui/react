import { Skeleton } from "@keystoneui/react/skeleton";
import type { TableOfContents } from "fumadocs-core/toc";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/page";
import type { MDXProps } from "mdx/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { type FC, Suspense } from "react";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";

// fumadocs-mdx v11 lazy file loading loses these types from PageData
interface DocsPageData {
  body: FC<MDXProps>;
  description?: string;
  full?: boolean;
  title: string;
  toc: TableOfContents;
}

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

/**
 * The `params` read happens inside the Suspense boundary. Under Partial
 * Prefetching every link to a docs page prefetches one shared App Shell for
 * this route; anything that depends on the URL must sit below a boundary or
 * the shell would be tied to a single page. The skeleton is what a
 * navigation paints while the page's own payload arrives.
 */
export default function Page(props: PageProps) {
  return (
    <Suspense fallback={<DocsPageSkeleton />}>
      <DocsPageContent params={props.params} />
    </Suspense>
  );
}

async function DocsPageContent({ params }: PageProps) {
  const { slug } = await params;
  const page = source.getPage(slug);
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

function DocsPageSkeleton() {
  return (
    <DocsPage>
      <Skeleton className="h-9 w-2/5" />
      <Skeleton className="mt-3 h-5 w-3/5" />
      <div className="mt-8 flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-6 h-56 w-full rounded-xl" />
      </div>
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
