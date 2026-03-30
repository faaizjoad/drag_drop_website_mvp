import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteCard } from "@/components/dashboard/site-card";
import { PlusIcon } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { pages: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Sites</h1>
        <Link
          href="/dashboard/sites/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <PlusIcon size={16} />
          New Site
        </Link>
      </header>

      <main className="px-6 py-8">
        {sites.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No sites yet.</p>
            <p className="text-sm mt-1">Create your first site to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
