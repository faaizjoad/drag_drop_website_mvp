import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(80),
  puckData: z.record(z.string(), z.unknown()),
  isPublic: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await prisma.template.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, isPublic: true, createdAt: true },
  });

  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const template = await prisma.template.create({
    data: {
      name: parsed.data.name,
      puckData: parsed.data.puckData as Prisma.InputJsonValue,
      userId: session.user.id,
      isPublic: parsed.data.isPublic ?? false,
    },
  });

  return NextResponse.json({ id: template.id, name: template.name });
}
