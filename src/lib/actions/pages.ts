"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function createPage(siteId: string, title: string, path: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });
  if (!site) return { error: "Site not found." };

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  try {
    const page = await prisma.page.create({
      data: {
        title: title.trim(),
        path: normalizedPath.trim(),
        siteId,
        puckData: { content: [], root: { props: {} } },
      },
    });
    revalidatePath(`/dashboard/sites/${siteId}`);
    return { page };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "A page with that path already exists." };
    }
    return { error: "Something went wrong." };
  }
}

export async function deletePage(pageId: string, siteId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const page = await prisma.page.findFirst({
    where: { id: pageId, siteId, site: { userId: session.user.id } },
  });
  if (!page) return { error: "Page not found." };

  await prisma.page.delete({ where: { id: pageId } });
  revalidatePath(`/dashboard/sites/${siteId}`);
  return {};
}
