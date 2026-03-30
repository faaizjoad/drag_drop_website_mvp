import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PageList } from "@/components/dashboard/page-list";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";

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
    },
  });

  if (!site) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">
            <ArrowLeftIcon size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{site.name}</h1>
            <p className="text-xs text-gray-400">{site.slug}.yourapp.com</p>
          </div>
        </div>
        <Link
          href={`/dashboard/sites/${site.id}/pages/new`}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          <PlusIcon size={16} />
          New Page
        </Link>
      </header>

      <main className="px-6 py-8">
        <PageList pages={site.pages} siteId={site.id} />
      </main>
    </div>
  );
}
