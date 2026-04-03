"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

export async function createSite(name: string, slug: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const finalSlug = slug.trim() || slugify(name);

  if (!/^[a-z0-9-]+$/.test(finalSlug)) {
    return { error: "Slug may only contain lowercase letters, numbers, and hyphens." };
  }

  try {
    const site = await prisma.site.create({
      data: { name: name.trim(), slug: finalSlug, userId: session.user.id },
    });
    revalidatePath("/dashboard");
    return { site };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "That slug is already taken. Try another." };
    }
    return { error: "Something went wrong." };
  }
}

export async function updateSite(siteId: string, name: string, slug: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });
  if (!site) return { error: "Site not found." };

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "Slug may only contain lowercase letters, numbers, and hyphens." };
  }

  try {
    const updated = await prisma.site.update({
      where: { id: siteId },
      data: { name: name.trim(), slug: slug.trim() },
    });
    revalidatePath(`/dashboard/sites/${siteId}`);
    revalidatePath("/dashboard");
    return { site: updated };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "That slug is already taken. Try another." };
    }
    return { error: "Something went wrong." };
  }
}

export async function updateGlobalStyles(
  siteId: string,
  globalStyles: Record<string, unknown>
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });
  if (!site) return { error: "Site not found." };

  await prisma.site.update({
    where: { id: siteId },
    data: { globalStyles: globalStyles as Prisma.InputJsonValue },
  });

  revalidatePath(`/dashboard/sites/${siteId}`);
  revalidatePath(`/sites/${site.slug}`);
  return {};
}

export async function deleteSite(siteId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const site = await prisma.site.findFirst({
    where: { id: siteId, userId: session.user.id },
  });
  if (!site) return { error: "Site not found." };

  await prisma.site.delete({ where: { id: siteId } });
  revalidatePath("/dashboard");
  return {};
}
