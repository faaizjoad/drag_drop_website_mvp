import Link from "next/link";
import { GlobeIcon, FileTextIcon } from "lucide-react";

interface SiteCardProps {
  site: {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    _count: { pages: number };
  };
}

export function SiteCard({ site }: SiteCardProps) {
  return (
    <Link
      href={`/dashboard/sites/${site.id}`}
      className="block bg-white rounded-xl border hover:border-blue-400 hover:shadow-md transition p-5 space-y-3"
    >
      <div className="flex items-start justify-between">
        <h2 className="font-semibold text-gray-900 truncate">{site.name}</h2>
        <GlobeIcon size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
      </div>

      <p className="text-xs text-gray-400">{site.slug}.yourapp.com</p>

      <div className="flex items-center gap-1 text-xs text-gray-500">
        <FileTextIcon size={13} />
        <span>{site._count.pages} page{site._count.pages !== 1 ? "s" : ""}</span>
      </div>
    </Link>
  );
}
