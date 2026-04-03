import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const template = await prisma.template.findUnique({
    where: { id: params.id },
  });
  if (!template)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (template.userId !== session.user.id && !template.isPublic)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(template);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const template = await prisma.template.findUnique({
    where: { id: params.id },
  });
  if (!template)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (template.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.template.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
