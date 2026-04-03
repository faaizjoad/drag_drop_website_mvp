import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFile, getSignedViewUrl } from "@/lib/s3";
import { randomUUID } from "crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "application/pdf",
]);

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json(
        { error: "File too large (max 5 MB)" },
        { status: 400 }
      );
    if (!ALLOWED_TYPES.has(file.type))
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      );

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() ?? "bin";
    const key = `uploads/${session.user.id}/${Date.now()}-${randomUUID()}.${ext}`;

    const url = await uploadFile(buffer, key, file.type);

    const asset = await prisma.mediaAsset.create({
      data: {
        url,
        key,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        userId: session.user.id,
      },
    });

    const viewUrl = await getSignedViewUrl(key);
    return NextResponse.json({ url, viewUrl, id: asset.id });
  } catch (err: unknown) {
    console.error("[upload] error:", err);
    const message =
      err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
