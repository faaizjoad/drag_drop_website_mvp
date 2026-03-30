import Link from "next/link";
import { PencilIcon, CheckCircleIcon, CircleIcon } from "lucide-react";

interface Page {
  id: string;
  title: string;
  path: string;
  isPublished: boolean;
  updatedAt: Date;
}

interface PageListProps {
  pages: Page[];
  siteId: string;
}

export function PageList({ pages, siteId }: PageListProps) {
  if (pages.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>No pages yet. Create your first page.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {pages.map((page) => (
        <li
          key={page.id}
          className="bg-white rounded-lg border flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-3">
            {page.isPublished ? (
              <CheckCircleIcon size={16} className="text-green-500" />
            ) : (
              <CircleIcon size={16} className="text-gray-300" />
            )}
            <div>
              <p className="font-medium text-sm text-gray-900">{page.title}</p>
              <p className="text-xs text-gray-400">{page.path}</p>
            </div>
          </div>

          <Link
            href={`/dashboard/sites/${siteId}/pages/${page.id}/edit`}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition"
          >
            <PencilIcon size={13} />
            Edit
          </Link>
        </li>
      ))}
    </ul>
  );
}
