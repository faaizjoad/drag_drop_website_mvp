import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PageList } from "@/components/dashboard/page-list";
import { AddPageButton } from "@/components/dashboard/add-page-button";
import { EditSiteForm } from "@/components/dashboard/edit-site-form";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";

export default async function SitePage({
  params,
}: {
  params: { siteId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const site = await prisma.site.findFirst({
    where: { id: params.siteId, userId: session.user.id },
    include: {
      pages: { orderBy: { createdAt: "asc" } },
      _count: { select: { pages: true } },
    },
  });

  if (!site) notFound();

  const pages = site.pages.map((p) => ({
    id: p.id,
    title: p.title,
    path: p.path,
    isPublished: p.isPublished,
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto space-y-8">
      {/* Breadcrumb + header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href="/dashboard" className="hover:text-gray-600 transition-colors">
            Sites
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium">{site.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
              <p className="text-sm text-gray-400 font-mono mt-0.5">{site.slug}</p>
            </div>
          </div>

          <a
            href={`/sites/${site.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors shrink-0"
          >
            <ExternalLinkIcon size={13} />
            View live
          </a>
        </div>
      </div>

      {/* Settings card */}
      <section>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Site settings</h2>
          <EditSiteForm site={{ id: site.id, name: site.name, slug: site.slug }} />
        </div>
      </section>

      {/* Pages section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Pages</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {site._count.pages} page{site._count.pages !== 1 ? "s" : ""}
            </p>
          </div>
          <AddPageButton siteId={site.id} />
        </div>

        <PageList pages={pages} siteId={site.id} />
      </section>
    </div>
  );
}
