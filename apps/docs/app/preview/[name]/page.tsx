"use client";

import { notFound, useParams } from "next/navigation";
import { getDemo } from "@/demos";

export default function PreviewPage() {
  const { name } = useParams<{ name: string }>();
  const demo = getDemo(name);
  if (!demo) {
    notFound();
  }

  const Component = demo.component;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Component />
    </div>
  );
}
