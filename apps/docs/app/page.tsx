import {
  Accessibility,
  ArrowRight,
  Github,
  Moon,
  Paintbrush,
  Puzzle,
  TreePalm,
  Zap,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Accessibility,
    title: "Accessible",
    description:
      "Built on Base UI primitives with focus management, keyboard navigation, and screen reader support baked in.",
  },
  {
    icon: Paintbrush,
    title: "Customizable",
    description:
      "Semantic design tokens with OKLCH colors. Override any token to match your brand in minutes.",
  },
  {
    icon: Moon,
    title: "Dark Mode",
    description:
      "First-class dark mode support. Every component adapts automatically with carefully tuned dark variants.",
  },
  {
    icon: Zap,
    title: "Tailwind CSS v4",
    description:
      "Built for the latest Tailwind with CSS-first configuration, custom variants, and zero JavaScript theme overhead.",
  },
  {
    icon: Puzzle,
    title: "Base UI Primitives",
    description:
      "Powered by Base UI for unstyled, accessible primitives. No Radix dependency -- fully independent.",
  },
  {
    icon: TreePalm,
    title: "Tree-Shakeable",
    description:
      "Subpath exports for every component. Import only what you use -- your bundle stays lean.",
  },
];

const components = [
  { name: "Button", href: "/docs/components/button" },
  { name: "Input", href: "/docs/components/input" },
  { name: "Select", href: "/docs/components/select" },
  { name: "Modal", href: "/docs/components/modal" },
  { name: "Tabs", href: "/docs/components/tabs" },
  { name: "Card", href: "/docs/components/card" },
  { name: "Badge", href: "/docs/components/badge" },
  { name: "Accordion", href: "/docs/components/accordion" },
  { name: "Checkbox", href: "/docs/components/checkbox" },
  { name: "Switch", href: "/docs/components/switch" },
  { name: "Tooltip", href: "/docs/components/tooltip" },
  { name: "Toast", href: "/docs/components/toast" },
];

export default function HomePage() {
  return (
    <main>
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-border/50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link className="font-bold text-xl tracking-tight" href="/">
            Keystone UI
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/docs"
            >
              Docs
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/gallery"
            >
              Components
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/blog"
            >
              Blog
            </Link>
            <Link
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="/changelog"
            >
              Changelog
            </Link>
            <a
              className="text-muted-foreground transition-colors hover:text-foreground"
              href="https://github.com/your-org/keystoneui"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github className="size-5" />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.8_0.05_260/0.15),transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 text-center sm:py-32 lg:py-40">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-muted-foreground text-sm">
            <span className="inline-block size-2 rounded-full bg-green-500" />
            54+ components available
          </div>
          <h1 className="mx-auto max-w-4xl font-bold text-4xl tracking-tight sm:text-6xl lg:text-7xl">
            Beautiful, accessible React components
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            A modern component library built with Tailwind CSS v4 and Base UI.
            Ship polished interfaces faster with 54+ production-ready
            components.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              href="/docs/getting-started/installation"
            >
              Get Started
              <ArrowRight className="size-4" />
            </Link>
            <Link
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-background px-6 font-medium transition-colors hover:bg-accent"
              href="/gallery"
            >
              Browse Components
            </Link>
          </div>
          <div className="mt-6 text-muted-foreground text-sm">
            <code className="rounded-md bg-muted px-3 py-1.5 font-mono text-xs">
              pnpm add keystoneui @keystone/theme
            </code>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-border/50 border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <h2 className="font-bold text-3xl tracking-tight">
              Built for modern development
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to build beautiful, accessible interfaces at
              scale.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                className="group rounded-xl border border-border/50 bg-card p-6 transition-colors hover:border-border hover:bg-card/80"
                key={feature.title}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Component Showcase */}
      <section className="border-border/50 border-t">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <h2 className="font-bold text-3xl tracking-tight">
              54+ components ready to use
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From buttons to complex data tables -- every component you need,
              beautifully designed.
            </p>
          </div>
          <div className="mt-16 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {components.map((component) => (
              <Link
                className="group flex items-center justify-between rounded-lg border border-border/50 bg-card px-4 py-3 transition-all hover:border-border hover:bg-accent/50"
                href={component.href}
                key={component.name}
              >
                <span className="font-medium text-sm">{component.name}</span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              className="inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline"
              href="/gallery"
            >
              View all components
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-border/50 border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h2 className="font-bold text-3xl tracking-tight">
            Start building today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get up and running in minutes. Install, import, and start shipping.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              href="/docs/getting-started/installation"
            >
              Read the Docs
              <ArrowRight className="size-4" />
            </Link>
            <a
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-background px-6 font-medium transition-colors hover:bg-accent"
              href="https://github.com/your-org/keystoneui"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github className="size-4" />
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border/50 border-t">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <p className="font-bold text-lg">Keystone UI</p>
              <p className="mt-1 text-muted-foreground text-sm">
                Beautiful, accessible React components.
              </p>
            </div>
            <div className="flex items-center gap-6 text-muted-foreground text-sm">
              <Link
                className="transition-colors hover:text-foreground"
                href="/docs"
              >
                Docs
              </Link>
              <Link
                className="transition-colors hover:text-foreground"
                href="/gallery"
              >
                Components
              </Link>
              <Link
                className="transition-colors hover:text-foreground"
                href="/blog"
              >
                Blog
              </Link>
              <a
                className="transition-colors hover:text-foreground"
                href="https://github.com/your-org/keystoneui"
                rel="noopener noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </div>
          </div>
          <div className="mt-8 border-border/50 border-t pt-8 text-center text-muted-foreground text-sm">
            <p>MIT License. Built with Next.js, Tailwind CSS, and Base UI.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
