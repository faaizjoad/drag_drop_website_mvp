"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PencilIcon,
  Trash2Icon,
  CheckCircle2Icon,
  CircleDashedIcon,
  FileTextIcon,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { deletePage } from "@/lib/actions/pages";

interface Page {
  id: string;
  title: string;
  path: string;
  isPublished: boolean;
  updatedAt: string;
}

interface PageListProps {
  pages: Page[];
  siteId: string;
}

function PageRow({ page, siteId }: { page: Page; siteId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deletePage(page.id, siteId);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors group">
      {/* Status icon */}
      <div className="shrink-0">
        {page.isPublished ? (
          <CheckCircle2Icon size={15} className="text-green-500" />
        ) : (
          <CircleDashedIcon size={15} className="text-gray-300" />
        )}
      </div>

      {/* Title + path */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
        <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{page.path}</p>
      </div>

      {/* Published badge */}
      <span
        className={`hidden sm:inline-flex shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
          page.isPublished
            ? "bg-green-50 text-green-700"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {page.isPublished ? "Published" : "Draft"}
      </span>

      {/* Updated */}
      <span className="hidden md:block text-xs text-gray-400 shrink-0 w-20 text-right">
        {formatRelativeDate(page.updatedAt)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {isPending ? "…" : "Yes"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              No
            </button>
          </div>
        ) : (
          <>
            <Link
              href={`/dashboard/sites/${siteId}/pages/${page.id}/edit`}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-blue-50"
            >
              <PencilIcon size={12} />
              Edit
            </Link>
            <button
              onClick={() => setConfirming(true)}
              className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              title="Delete page"
            >
              <Trash2Icon size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function PageList({ pages, siteId }: PageListProps) {
  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-gray-200 rounded-xl">
        <FileTextIcon size={28} className="text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-500">No pages yet</p>
        <p className="text-xs text-gray-400 mt-1">Click &ldquo;Add Page&rdquo; to create your first page.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Table header */}
      <div className="flex items-center gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-400 uppercase tracking-wide">
        <div className="w-4 shrink-0" />
        <span className="flex-1">Page</span>
        <span className="hidden sm:block shrink-0">Status</span>
        <span className="hidden md:block shrink-0 w-20 text-right">Updated</span>
        <span className="shrink-0 w-24 text-right">Actions</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {pages.map((page) => (
          <PageRow key={page.id} page={page} siteId={siteId} />
        ))}
      </div>
    </div>
  );
}
