"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileTextIcon, CalendarIcon, Trash2Icon, ArrowRightIcon } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";
import { deleteSite } from "@/lib/actions/sites";

interface SiteCardProps {
  site: {
    id: string;
    name: string;
    slug: string;
    updatedAt: string;
    _count: { pages: number };
  };
}

export function SiteCard({ site }: SiteCardProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteSite(site.id);
      router.refresh();
    });
  }

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Card body */}
      <Link href={`/dashboard/sites/${site.id}`} className="block p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h2 className="font-semibold text-gray-900 truncate text-[15px] leading-snug">
            {site.name}
          </h2>
          <ArrowRightIcon
            size={14}
            className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5"
          />
        </div>

        <p className="text-xs text-gray-400 font-mono mb-4 truncate">{site.slug}</p>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <FileTextIcon size={12} />
            {site._count.pages} page{site._count.pages !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarIcon size={12} />
            {formatRelativeDate(site.updatedAt)}
          </span>
        </div>
      </Link>

      {/* Card footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <Link
          href={`/dashboard/sites/${site.id}`}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Edit site →
        </Link>

        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Delete?</span>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="p-1 text-gray-300 hover:text-red-500 transition-colors rounded"
            title="Delete site"
          >
            <Trash2Icon size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
