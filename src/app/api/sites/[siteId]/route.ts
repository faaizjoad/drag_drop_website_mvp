import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const updateSiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens")
    .optional(),
  customDomain: z.string().max(253).nullable().optional(),
  favicon: z.string().url().nullable().optional(),
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
    include: { _count: { select: { pages: true } } },
  });

  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(site);
}

export async function PUT(
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
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = updateSiteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.site.update({
      where: { id: params.siteId },
      data: parsed.data,
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "That slug is already taken." }, { status: 409 });
    }
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}

export async function DELETE(
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
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.site.delete({ where: { id: params.siteId } });

  return new NextResponse(null, { status: 204 });
}
