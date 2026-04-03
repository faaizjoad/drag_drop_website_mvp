import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSignedViewUrl } from "@/lib/s3";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assets = await prisma.mediaAsset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      url: true,
      key: true,
      filename: true,
      mimeType: true,
      size: true,
      createdAt: true,
    },
  });

  // Generate presigned GET URLs for each asset so the browser can display
  // thumbnails even if the bucket is not publicly accessible.
  const withViewUrls = await Promise.all(
    assets.map(async (asset) => ({
      ...asset,
      viewUrl: await getSignedViewUrl(asset.key),
    }))
  );

  return NextResponse.json(withViewUrls);
}
