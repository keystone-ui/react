import { join } from "node:path";

import { NextResponse } from "next/server";

import { getDemoFiles, isValidDemoName } from "@/lib/get-demo-files";

// Side-effect import: ensures Next.js's file tracer includes apps/docs/demos/**
// in the runtime bundle. Without this, the demos directory may not be present
// in production deployments (Vercel/OpenNext) since this route only does
// filesystem reads. Mirrors the pattern in apps/docs/lib/get-llm-text.ts.
import "@/demos";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  if (!isValidDemoName(name)) {
    return NextResponse.json(
      { error: "Invalid name", name },
      { status: 400 }
    );
  }

  const demosRoot = join(process.cwd(), "demos");
  const bundle = await getDemoFiles({ name, demosRoot });

  if (!bundle) {
    return NextResponse.json(
      { error: "Demo not found", name },
      { status: 404 }
    );
  }

  return NextResponse.json(bundle, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
