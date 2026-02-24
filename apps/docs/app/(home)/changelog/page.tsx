import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description: "All notable changes to Keystone UI.",
};

const releases = [
  {
    version: "0.0.0",
    date: "2026-02-15",
    changes: [
      {
        type: "added" as const,
        items: [
          "Initial release with 50+ components",
          "Tailwind CSS v4 theme with OKLCH color tokens",
          "Dark mode support",
          "Full TypeScript support with type exports",
          "Subpath exports for tree-shaking",
          "Base UI primitives for accessibility",
          "Documentation site with Fumadocs",
        ],
      },
    ],
  },
];

const typeColors = {
  added: "bg-green-500/15 text-green-700 dark:text-green-400",
  changed: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  fixed: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  removed: "bg-red-500/15 text-red-700 dark:text-red-400",
  deprecated: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
  security: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
};

const typeLabels = {
  added: "Added",
  changed: "Changed",
  fixed: "Fixed",
  removed: "Removed",
  deprecated: "Deprecated",
  security: "Security",
};

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-2 font-bold text-4xl tracking-tight">Changelog</h1>
      <p className="mb-12 text-lg text-muted-foreground">
        All notable changes to Keystone UI are documented here.
      </p>

      <div className="space-y-16">
        {releases.map((release) => (
          <section key={release.version}>
            <div className="mb-6 flex items-baseline gap-4">
              <h2 className="font-bold text-2xl">v{release.version}</h2>
              <time className="text-muted-foreground text-sm">
                {new Date(release.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>

            <div className="space-y-6">
              {release.changes.map((change) => (
                <div key={change.type}>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 font-medium text-xs ${typeColors[change.type]}`}
                  >
                    {typeLabels[change.type]}
                  </span>
                  <ul className="mt-3 space-y-2">
                    {change.items.map((item) => (
                      <li className="flex items-start gap-2 text-sm" key={item}>
                        <span className="mt-2 block size-1 shrink-0 rounded-full bg-muted-foreground/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
