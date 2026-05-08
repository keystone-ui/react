import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import registry from "../../public/r/registry.json";

export const metadata: Metadata = {
  title: "Blocks",
  description:
    "Browse all Keystone UI blocks — full-page templates ready to drop into your app.",
};

interface RegistryItem {
  categories?: string[];
  description?: string;
  name: string;
  title?: string;
  type: string;
}

interface BlockEntry {
  categoryLabel: string;
  categorySlug: string;
  description: string;
  name: string;
  title: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  authentication: "Authentication",
  betting: "Betting",
  data: "Data",
  login: "Login",
  navigation: "Navigation",
  signup: "Signup",
};

function labelFor(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1);
}

function titleFromName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function loadBlocks(): BlockEntry[] {
  const items = (registry as { items: RegistryItem[] }).items;
  const blocks = items.filter((item) => item.type === "registry:block");

  return blocks.map((item) => {
    const categories = item.categories ?? [];
    // Use the most specific category (last one) as the grouping key.
    // Items typically list a broad parent first (e.g. "authentication") and
    // a specific child after (e.g. "login").
    const categorySlug = categories.at(-1) ?? "uncategorized";

    return {
      name: item.name,
      title: item.title ?? titleFromName(item.name),
      description: item.description ?? "",
      categorySlug,
      categoryLabel: labelFor(categorySlug),
    };
  });
}

function groupByCategory(blocks: BlockEntry[]): Map<string, BlockEntry[]> {
  const groups = new Map<string, BlockEntry[]>();
  for (const block of blocks) {
    const list = groups.get(block.categorySlug) ?? [];
    list.push(block);
    groups.set(block.categorySlug, list);
  }
  for (const list of groups.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return new Map(
    [...groups.entries()].sort(([a], [b]) =>
      labelFor(a).localeCompare(labelFor(b))
    )
  );
}

export default function BlocksGalleryPage() {
  const blocks = loadBlocks();
  const groups = groupByCategory(blocks);

  return (
    <main className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="mb-2 font-bold text-4xl tracking-tight">Blocks</h1>
      <p className="mb-12 text-lg text-muted-foreground">
        Full-page building blocks composed from Keystone UI components — drop
        them in and tweak.
      </p>

      <div className="space-y-16">
        {[...groups.entries()].map(([slug, entries]) => (
          <section key={slug}>
            <h2 className="mb-6 font-semibold text-xl">{labelFor(slug)}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((block) => (
                <Link
                  className="group relative flex flex-col rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-border hover:bg-accent/30"
                  href={`/docs/blocks/${block.name}`}
                  key={block.name}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium text-sm">{block.title}</span>
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </div>
                  {block.description && (
                    <p className="mt-1 text-muted-foreground text-xs">
                      {block.description}
                    </p>
                  )}
                  <span className="mt-3 inline-flex w-fit items-center rounded-full bg-muted/60 px-2 py-0.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                    {block.categoryLabel}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
