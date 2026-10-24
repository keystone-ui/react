import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./global.css";

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const DESCRIPTION =
  "Beautiful, accessible React components built with Tailwind CSS v4 and Base UI.";

export const metadata: Metadata = {
  // Resolves relative Open Graph URLs (and the generated opengraph-image).
  metadataBase: new URL("https://keystoneui.io"),
  title: {
    default: "Keystone UI",
    template: "%s | Keystone UI",
  },
  description: DESCRIPTION,
  // No title, description or url here: Next merges `openGraph`/`twitter`
  // only when the current segment sets them, so a root value would pin every
  // page's social card to the home page. Left unset, each card takes the
  // page's own resolved title and description.
  openGraph: {
    type: "website",
    siteName: "Keystone UI",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
