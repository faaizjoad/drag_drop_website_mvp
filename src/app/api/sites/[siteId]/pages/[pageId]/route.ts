import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  puckData: z.record(z.string(), z.unknown()).optional(),
  isPublished: z.boolean().optional(),
  seoTitle: z.string().max(200).optional(),
  seoDesc: z.string().max(500).optional(),
});

async function getPageWithAccess(pageId: string, siteId: string, userId: string) {
  return prisma.page.findFirst({
    where: {
      id: pageId,
      siteId,
      site: { userId },
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string; pageId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await getPageWithAccess(params.pageId, params.siteId, session.user.id);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  return NextResponse.json(page);
}

export async function PUT(
  request: Request,
  { params }: { params: { siteId: string; pageId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await getPageWithAccess(params.pageId, params.siteId, session.user.id);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updatePageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { isPublished, ...rest } = parsed.data;

  const updated = await prisma.page.update({
    where: { id: params.pageId },
    data: {
      ...(rest.title && { title: rest.title }),
      ...(rest.puckData && { puckData: rest.puckData as Prisma.InputJsonValue }),
      ...(rest.seoTitle !== undefined && { seoTitle: rest.seoTitle }),
      ...(rest.seoDesc !== undefined && { seoDesc: rest.seoDesc }),
      ...(isPublished !== undefined && {
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { siteId: string; pageId: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = await getPageWithAccess(params.pageId, params.siteId, session.user.id);
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  await prisma.page.delete({ where: { id: params.pageId } });

  return new NextResponse(null, { status: 204 });
}
