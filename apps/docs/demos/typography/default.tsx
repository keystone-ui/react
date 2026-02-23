"use client";

export default function TypographyDefault() {
  return (
    <div>
      <h1 className="scroll-m-20 text-balance font-extrabold text-4xl tracking-tight">
        The Craft of Interface Design
      </h1>
      <p className="not-first:mt-6 text-muted-foreground text-xl leading-7">
        In the early days of the web, interfaces were built with tables and
        inline styles. Designers had little control, and users had even less
        expectation. Then came a quiet revolution.
      </p>
      <h2 className="mt-10 scroll-m-20 border-b pb-2 font-semibold text-3xl tracking-tight transition-colors first:mt-0">
        The Component Era
      </h2>
      <p className="not-first:mt-6 leading-7">
        Designers and engineers began thinking in{" "}
        <a
          className="font-medium text-primary underline underline-offset-4"
          href="https://keystoneui.dev"
        >
          reusable building blocks
        </a>
        : buttons, inputs, cards, and modals that could be composed into any
        layout.
      </p>
      <blockquote className="mt-6 border-l-2 pl-6 italic">
        &quot;Good design is as little design as possible. Less, but
        better.&quot;
      </blockquote>
      <h3 className="mt-8 scroll-m-20 font-semibold text-2xl tracking-tight">
        Design Tokens
      </h3>
      <p className="not-first:mt-6 leading-7">
        Instead of hard-coding colors and spacing, teams adopted token systems
        that made themes swappable:
      </p>
      <ul className="my-6 ml-6 list-disc *:mt-2">
        <li>Semantic color tokens for intent, not appearance</li>
        <li>Spacing scales that enforce visual rhythm</li>
        <li>Typography presets for consistent hierarchy</li>
      </ul>
      <p className="not-first:mt-6 leading-7">
        With tokens in place, switching from a light theme to a dark theme
        became a single toggle rather than a rewrite.
      </p>
      <h3 className="mt-8 scroll-m-20 font-semibold text-2xl tracking-tight">
        Utility-First CSS
      </h3>
      <p className="not-first:mt-6 leading-7">
        Utility classes brought another shift: instead of naming every visual
        state, developers composed styles inline. The result was faster
        iteration and fewer zombie stylesheets.
      </p>
      <p className="not-first:mt-6 leading-7">
        Critics argued it cluttered markup, but proponents pointed to the
        developer experience — no context switching, no naming debates, and
        co-located concerns.
      </p>
      <h3 className="mt-8 scroll-m-20 font-semibold text-2xl tracking-tight">
        Measuring Impact
      </h3>
      <p className="not-first:mt-6 leading-7">
        Teams began quantifying the value of a design system by tracking
        adoption and consistency:
      </p>
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <th className="border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right">
                Metric
              </th>
              <th className="border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right">
                Before System
              </th>
              <th className="border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right">
                After System
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                Inconsistent components
              </td>
              <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                47
              </td>
              <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                3
              </td>
            </tr>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                Dev time per feature
              </td>
              <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                2 weeks
              </td>
              <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                3 days
              </td>
            </tr>
            <tr className="m-0 border-t p-0 even:bg-muted">
              <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                Design–dev handoff issues
              </td>
              <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                Frequent
              </td>
              <td className="border px-4 py-2 text-left [[align=center]]:text-center [[align=right]]:text-right">
                Rare
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="not-first:mt-6 leading-7">
        The lesson was clear: investing in shared foundations paid dividends
        across every product surface.
      </p>
      <p className="not-first:mt-6 leading-7">
        Typography, like color and spacing, is one of those foundations. Get it
        right once, and every page benefits.
      </p>
    </div>
  );
}
