import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { blogPosts } from "@/.source/server";
import { IntentLink as Link } from "@/components/intent-link";
import { getMDXComponents } from "@/mdx-components";

const MDX_EXT_RE = /\.mdx?$/;

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

function getPostSlug(filePath: string) {
  return filePath.replace(MDX_EXT_RE, "");
}

/**
 * The slug is read below a Suspense boundary so the route's shared App
 * Shell (prefetched once for every blog link) does not depend on the URL.
 */
export default function BlogPage(props: PageProps) {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <BlogContent params={props.params} />
    </Suspense>
  );
}

async function BlogContent({ params }: PageProps) {
  const { slug } = await params;

  // Blog index
  if (!slug || slug.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-2 font-bold text-4xl tracking-tight">Blog</h1>
        <p className="mb-12 text-lg text-muted-foreground">
          News, updates, and articles about Keystone UI.
        </p>
        <div className="space-y-8">
          {blogPosts.map((post) => (
            <article
              className="group rounded-xl border border-border/50 p-6 transition-colors hover:border-border hover:bg-muted/30"
              key={post.info.path}
            >
              <Link href={`/blog/${getPostSlug(post.info.path)}`}>
                <h2 className="font-semibold text-xl group-hover:text-primary">
                  {post.title}
                </h2>
                {post.description && (
                  <p className="mt-2 text-muted-foreground">
                    {post.description}
                  </p>
                )}
              </Link>
            </article>
          ))}
          {blogPosts.length === 0 && (
            <p className="text-muted-foreground">No blog posts yet.</p>
          )}
        </div>
      </main>
    );
  }

  // Individual blog post
  const postSlug = slug.join("/");
  const post = blogPosts.find((p) => getPostSlug(p.info.path) === postSlug);
  if (!post) {
    notFound();
  }

  const MDX = post.body;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        className="mb-8 inline-flex items-center text-muted-foreground text-sm hover:text-foreground"
        href="/blog"
      >
        &larr; Back to Blog
      </Link>
      <article className="prose dark:prose-invert mt-8 max-w-none">
        <h1>{post.title}</h1>
        {post.description && (
          <p className="lead text-muted-foreground">{post.description}</p>
        )}
        <MDX components={getMDXComponents()} />
      </article>
    </main>
  );
}

function BlogSkeleton() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-2 h-10 w-40 animate-pulse rounded-md bg-muted" />
      <div className="mb-12 h-6 w-2/3 animate-pulse rounded-md bg-muted" />
      <div className="h-28 animate-pulse rounded-xl border border-border/50 bg-muted/30" />
    </main>
  );
}

export function generateStaticParams() {
  return [
    { slug: [] },
    ...blogPosts.map((post) => ({
      slug: getPostSlug(post.info.path).split("/"),
    })),
  ];
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;

  if (!slug || slug.length === 0) {
    return {
      title: "Blog",
      description: "News, updates, and articles about Keystone UI.",
      alternates: { canonical: "/blog" },
      openGraph: { url: "/blog" },
    };
  }

  const postSlug = slug.join("/");
  const post = blogPosts.find((p) => getPostSlug(p.info.path) === postSlug);
  if (!post) {
    notFound();
  }

  const url = `/blog/${postSlug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: url },
    openGraph: { url },
  };
}
