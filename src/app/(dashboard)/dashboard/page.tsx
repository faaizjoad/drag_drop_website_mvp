import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SiteCard } from "@/components/dashboard/site-card";
import { NewSiteButton } from "@/components/dashboard/new-site-button";
import { GlobeIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { pages: true } } },
  });

  const serialized = sites.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {sites.length === 0
              ? "Create your first site to get started"
              : `${sites.length} site${sites.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <NewSiteButton />
      </div>

      {/* Grid */}
      {sites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <GlobeIcon size={24} className="text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-700">No sites yet</h3>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Click &ldquo;New Site&rdquo; to create your first website.
          </p>
          <NewSiteButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {serialized.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
