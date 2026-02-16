import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
    <html className={inter.variable} lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col antialiased">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
