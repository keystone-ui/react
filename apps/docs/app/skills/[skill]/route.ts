import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { NextResponse } from "next/server";

// To add a new skill: add the name here, place the tarball in public/skills/,
// and it will be pre-rendered on the next build via generateStaticParams.
const VALID_SKILLS = ["keystoneui-react"];
const TAR_GZ_SUFFIX = /\.tar\.gz$/;

export const revalidate = false;

export function generateStaticParams() {
  return VALID_SKILLS.map((skill) => ({ skill: `${skill}.tar.gz` }));
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ skill: string }> }
) {
  try {
    const { skill } = await params;

    const skillName = skill.replace(TAR_GZ_SUFFIX, "");

    if (!VALID_SKILLS.includes(skillName)) {
      return NextResponse.json(
        { available: VALID_SKILLS, error: `Invalid skill: ${skillName}` },
        { status: 404 }
      );
    }

    const tarFilePath = join(
      process.cwd(),
      "public",
      "skills",
      `${skillName}.tar.gz`
    );

    try {
      const tarBuffer = await readFile(tarFilePath);

      return new NextResponse(tarBuffer as unknown as BodyInit, {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
          "Content-Disposition": `attachment; filename=${skillName}.tar.gz`,
          "Content-Type": "application/gzip",
        },
      });
    } catch {
      return NextResponse.json(
        {
          error: `Skill tarball not found: ${skillName}`,
          message:
            "Run 'pnpm build:skills' to build skill packages before deploying.",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error serving skill tarball:", error);
    return NextResponse.json(
      { error: "Failed to serve skill tarball" },
      { status: 500 }
    );
  }
}
