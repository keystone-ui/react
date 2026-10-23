import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/**
 * Root not-found page. It renders inside the root layout only, so it carries
 * its own minimal chrome instead of relying on a section layout.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-start justify-center gap-6 px-6 py-24">
      <p className="font-mono text-muted-foreground text-sm">404</p>
      <h1 className="font-bold text-4xl tracking-tight">Page not found</h1>
      <p className="text-lg text-muted-foreground">
        The page you were looking for does not exist or has moved.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex h-10 items-center rounded-lg bg-primary px-5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          href="/docs"
        >
          Browse the docs
        </Link>
        <Link
          className="inline-flex h-10 items-center rounded-lg border border-border bg-background px-5 font-medium transition-colors hover:bg-accent"
          href="/"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
