import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPageSchema = z.object({
  title: z.string().min(1).max(200),
  path: z.string().min(1).max(500),
});

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const site = await prisma.site.findFirst({
    where: { id: params.siteId, userId: session.user.id },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const pages = await prisma.page.findMany({
    where: { siteId: params.siteId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      path: true,
      isPublished: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(pages);
}

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const site = await prisma.site.findFirst({
    where: { id: params.siteId, userId: session.user.id },
  });
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createPageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const page = await prisma.page.create({
    data: {
      title: parsed.data.title,
      path: parsed.data.path,
      siteId: params.siteId,
      puckData: { content: [], root: { props: {} } },
    },
  });

  return NextResponse.json(page, { status: 201 });
}
