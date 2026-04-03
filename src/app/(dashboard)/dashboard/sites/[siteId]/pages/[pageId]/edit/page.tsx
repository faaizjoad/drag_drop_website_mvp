import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EditorClient } from "@/components/editor/editor-client";
import type { Metadata } from "next";
import { resolveGlobalStyles, buildCssVars, buildGoogleFontsHref } from "@/lib/site-styles";

interface Props {
  params: { siteId: string; pageId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await prisma.page.findFirst({
    where: { id: params.pageId, siteId: params.siteId },
    select: { title: true },
  });
  return { title: page ? `Editing: ${page.title}` : "Editor" };
}

export default async function EditPagePage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const page = await prisma.page.findFirst({
    where: {
      id: params.pageId,
      siteId: params.siteId,
      site: { userId: session.user.id },
    },
    include: { site: { select: { slug: true, globalStyles: true } } },
  });

  if (!page) notFound();

  const globalStyles = resolveGlobalStyles(page.site.globalStyles);
  const cssVars = buildCssVars(globalStyles);
  const fontsHref = buildGoogleFontsHref(globalStyles);

  return (
    <>
      {/* Inject site theme into the editor so canvas preview matches the live site */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={fontsHref} />
      <style dangerouslySetInnerHTML={{ __html: `:root { ${cssVars} }` }} />

      <EditorClient
        pageId={page.id}
        siteId={params.siteId}
        siteSlug={page.site.slug}
        pagePath={page.path}
        pageTitle={page.title}
        isPublished={page.isPublished}
        initialData={page.puckData as Record<string, unknown>}
      />
    </>
  );
}
