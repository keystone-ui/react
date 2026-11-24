import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DemoRender } from "@/components/demo-render";
import { demoFiles } from "@/demos/files";

/**
 * Full-bleed render of one demo, iframed by the block docs and used by the
 * layout e2e suite. The Worker handles the preview document requests:
 * proxy.ts rewrites an unknown name to the 404 page before this page runs,
 * and a known demo's prerender is served from the OpenNext cache without
 * another Next render. The browser fetches the iframe's JavaScript directly
 * from Workers Static Assets. It used to be a client page reading
 * `useParams`, which made every iframe load the whole demo map.
 */

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
      <DemoRender name={name} />
    </div>
  );
}
