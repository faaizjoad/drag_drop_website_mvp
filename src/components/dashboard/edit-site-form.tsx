"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { updateSite } from "@/lib/actions/sites";

interface EditSiteFormProps {
  site: { id: string; name: string; slug: string };
}

export function EditSiteForm({ site }: EditSiteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(site.name);
  const [slug, setSlug] = useState(site.slug);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isDirty = name !== site.name || slug !== site.slug;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateSite(site.id, name.trim(), slug.trim());
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        router.refresh();
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Site name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setSaved(false); }}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Slug
          </label>
          <div className="flex rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent overflow-hidden text-sm">
            <span className="px-3 py-2 bg-gray-50 text-gray-400 border-r border-gray-300 shrink-0 select-none text-xs">
              yourapp.com/
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSaved(false);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
              }}
              required
              className="flex-1 px-3 py-2 outline-none bg-white"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {isPending ? (
            <Loader2Icon size={14} className="animate-spin" />
          ) : saved ? (
            <CheckIcon size={14} />
          ) : null}
          {isPending ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
