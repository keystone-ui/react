import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/.source/index";
import { getMDXComponents } from "@/mdx-components";

const MDX_EXT_RE = /\.mdx?$/;

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

function getPostSlug(filePath: string) {
  return filePath.replace(MDX_EXT_RE, "");
}

export default async function BlogPage(props: PageProps) {
  const params = await props.params;
  const slug = params.slug;

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
              key={post._file.path}
            >
              <Link href={`/blog/${getPostSlug(post._file.path)}`}>
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
  const post = blogPosts.find((p) => getPostSlug(p._file.path) === postSlug);
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

export function generateStaticParams() {
  return [
    { slug: [] },
    ...blogPosts.map((post) => ({
      slug: getPostSlug(post._file.path).split("/"),
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
    };
  }

  const postSlug = slug.join("/");
  const post = blogPosts.find((p) => getPostSlug(p._file.path) === postSlug);
  if (!post) {
    notFound();
  }

  return {
    title: post.title,
    description: post.description,
  };
}
