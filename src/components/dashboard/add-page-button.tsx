"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { createPage } from "@/lib/actions/pages";

interface AddPageButtonProps {
  siteId: string;
}

export function AddPageButton({ siteId }: AddPageButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [path, setPath] = useState("/");
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setTitle("");
    setPath("/");
    setError(null);
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !path.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createPage(siteId, title.trim(), path.trim());
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        handleClose();
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-blue-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        <PlusIcon size={14} />
        Add Page
      </button>

      <Modal open={open} onClose={handleClose} title="Add a new page">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Page title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="About Us"
              required
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Path{" "}
              <span className="font-normal text-gray-400">
                (use <code className="text-xs bg-gray-100 px-1 rounded">/</code> for homepage)
              </span>
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => {
                const v = e.target.value;
                setPath(v.startsWith("/") ? v : `/${v}`);
              }}
              placeholder="/about"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Creating…" : "Add page"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
