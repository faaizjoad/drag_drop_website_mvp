import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/lib/s3";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: params.id },
  });

  if (!asset)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (asset.userId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await deleteFile(asset.key);
  await prisma.mediaAsset.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
