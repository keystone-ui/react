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
  openGraph: {
    type: "website",
    siteName: "Keystone UI",
    title: "Keystone UI",
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Keystone UI",
    description: DESCRIPTION,
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
