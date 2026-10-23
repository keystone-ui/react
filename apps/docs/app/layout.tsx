import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { IntentLink } from "@/components/intent-link";
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

export const metadata: Metadata = {
  title: {
    default: "Keystone UI",
    template: "%s | Keystone UI",
  },
  description:
    "Beautiful, accessible React components built with Tailwind CSS v4 and Base UI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={`${geistSans.variable} ${geistMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col antialiased">
        {/* Every fumadocs link (sidebar, navbar, breadcrumbs, cards, MDX)
            prefetches the route's shared App Shell on sight and the page
            itself on hover/focus/touch. See components/intent-link.tsx. */}
        <RootProvider components={{ Link: IntentLink }}>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
