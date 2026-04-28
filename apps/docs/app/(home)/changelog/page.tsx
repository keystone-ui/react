import type { Metadata } from "next";

import { changelog } from "@/.source/server";
import { getMDXComponents } from "@/mdx-components";

export const metadata: Metadata = {
  title: "Changelog",
  description: "All notable changes to Keystone UI.",
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

function toDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

export default function ChangelogPage() {
  const entries = [...changelog].sort(
    (a, b) => toDate(b.date).getTime() - toDate(a.date).getTime()
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-2 font-bold text-4xl tracking-tight">Changelog</h1>
      <p className="mb-12 text-lg text-muted-foreground">
        All notable changes to Keystone UI are documented here.
      </p>

      {entries.length === 0 ? (
        <p className="text-muted-foreground">No releases yet.</p>
      ) : (
        <div className="divide-y divide-border/60">
          {entries.map((entry) => {
            const MDX = entry.body;
            const date = toDate(entry.date);

            return (
              <article
                className="grid gap-8 py-12 md:grid-cols-[12rem_minmax(0,1fr)]"
                key={entry.info.path}
              >
                <div className="md:sticky md:top-24 md:self-start">
                  {entry.version ? (
                    <>
                      <a
                        className="inline-flex rounded-full border border-border border-dashed px-3 py-1 font-mono text-sm transition-colors hover:border-foreground"
                        href={`https://www.npmjs.com/package/@keystoneui/react/v/${entry.version}`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        v{entry.version}
                      </a>
                      <time
                        className="mt-2 block text-muted-foreground text-sm"
                        dateTime={date.toISOString()}
                      >
                        {dateFormatter.format(date)}
                      </time>
                    </>
                  ) : (
                    <span className="inline-flex rounded-full border border-border border-dashed px-3 py-1 font-mono text-muted-foreground text-sm">
                      Unreleased
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="mb-6 font-semibold text-2xl tracking-tight">
                    {entry.description}
                  </h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <MDX components={getMDXComponents()} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
