import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Render } from "@puckeditor/core/rsc";
import { puckConfig } from "@/components/editor/puck-config";
import type { Metadata } from "next";

interface Props {
  params: { slug: string; path: string[] };
}

async function getPage(slug: string, path: string[]) {
  const pagePath = "/" + path.join("/");

  return prisma.page.findFirst({
    where: {
      site: { slug },
      path: pagePath,
      isPublished: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage(params.slug, params.path);
  if (!page) return {};
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDesc ?? undefined,
  };
}

export default async function PublishedPage({ params }: Props) {
  const page = await getPage(params.slug, params.path);
  if (!page) notFound();

  return (
    <Render
      config={puckConfig}
      data={page.puckData as Parameters<typeof Render>[0]["data"]}
    />
  );
}
