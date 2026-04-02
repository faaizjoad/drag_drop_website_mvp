import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Render } from "@puckeditor/core/rsc";
import { puckConfigRsc } from "@/components/editor/puck-config-rsc";
import type { Metadata } from "next";
import { PoweredByBadge } from "@/components/published/powered-by-badge";

/* ── ISR: revalidate every 60 seconds ─────────────────────────── */
export const revalidate = 60;

/* ── Types ────────────────────────────────────────────────────── */

interface Props {
  params: { slug: string; path?: string[] };
}

/* ── Data helpers ─────────────────────────────────────────────── */

async function getSite(slug: string) {
  // `slug` may actually be a custom domain when rewritten by middleware.
  // Try customDomain first, then fall back to slug.
  return (
    (await prisma.site.findUnique({
      where: { customDomain: slug },
      select: { id: true, name: true, slug: true, favicon: true, globalStyles: true },
    })) ??
    (await prisma.site.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true, favicon: true, globalStyles: true },
    }))
  );
}

async function getPage(siteId: string, path?: string[]) {
  const pagePath = path && path.length > 0 ? "/" + path.join("/") : "/";
  return prisma.page.findFirst({
    where: { siteId, path: pagePath, isPublished: true },
  });
}

/* ── generateStaticParams ─────────────────────────────────────── */

export async function generateStaticParams() {
  // Pre-render the homepage of every site that has at least one published page
  const sites = await prisma.site.findMany({
    where: { pages: { some: { isPublished: true } } },
    select: { slug: true },
    take: 100, // cap at 100 for build time
  });

  return sites.map(({ slug }) => ({ slug, path: [] }));
}

/* ── generateMetadata ─────────────────────────────────────────── */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const site = await getSite(params.slug);
  if (!site) return {};

  const page = await getPage(site.id, params.path);
  if (!page) return {};

  const canonical = `${process.env.NEXTAUTH_URL ?? ""}/sites/${params.slug}${
    params.path?.length ? "/" + params.path.join("/") : ""
  }`;

  return {
    title: page.seoTitle ?? `${page.title} — ${site.name}`,
    description: page.seoDesc ?? undefined,
    alternates: { canonical },
    openGraph: {
      title: page.seoTitle ?? `${page.title} — ${site.name}`,
      description: page.seoDesc ?? undefined,
      url: canonical,
      siteName: site.name,
      type: "website",
    },
    icons: site.favicon ? { icon: site.favicon } : undefined,
  };
}

/* ── Page component ───────────────────────────────────────────── */

export default async function PublishedPage({ params }: Props) {
  const site = await getSite(params.slug);
  if (!site) notFound();

  const page = await getPage(site.id, params.path);
  if (!page) notFound();

  return (
    <>
      <Render
        config={puckConfigRsc}
        data={page.puckData as Parameters<typeof Render>[0]["data"]}
      />
      <PoweredByBadge />
    </>
  );
}