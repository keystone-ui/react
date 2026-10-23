import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { demoFiles } from "@/demos/files";
import { DemoLoader } from "@/demos/loader";

/**
 * Full-bleed render of one demo, iframed by the block docs and used by the
 * layout e2e suite. Prerendered for every demo so the iframes are served
 * from static assets; it used to be a client page reading `useParams`,
 * which made every iframe load a Worker invocation plus the whole demo map.
 */
export const dynamicParams = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return Object.keys(demoFiles).map((name) => ({ name }));
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  if (!Object.hasOwn(demoFiles, name)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DemoLoader name={name} />
    </div>
  );
}
