import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPresignedUploadUrl, getPublicUrl } from "@/lib/s3";
import { z } from "zod";
import { randomUUID } from "crypto";

const uploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().positive(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = uploadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { filename, contentType, size } = parsed.data;
  const ext = filename.split(".").pop();
  const key = `uploads/${session.user.id}/${randomUUID()}.${ext}`;

  const uploadUrl = await getPresignedUploadUrl(key, contentType);
  const publicUrl = getPublicUrl(key);

  await prisma.mediaAsset.create({
    data: {
      url: publicUrl,
      key,
      filename,
      mimeType: contentType,
      size,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ uploadUrl, url: publicUrl, key });
}
