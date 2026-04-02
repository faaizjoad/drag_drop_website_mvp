"use client";

import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { puckConfig } from "./puck-config";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ExternalLinkIcon, GlobeIcon, Loader2Icon, CheckIcon } from "lucide-react";
import Link from "next/link";

interface EditorClientProps {
  pageId: string;
  siteId: string;
  siteSlug: string;
  pagePath: string;
  pageTitle: string;
  isPublished: boolean;
  initialData: Record<string, unknown>;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function EditorClient({
  pageId,
  siteId,
  siteSlug,
  pagePath,
  pageTitle,
  isPublished: initialIsPublished,
  initialData,
}: EditorClientProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [publishing, setPublishing] = useState(false);
  const latestDataRef = useRef<Record<string, unknown>>(initialData);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── save helper ── */
  const save = useCallback(
    async (data: Record<string, unknown>, opts?: { publish?: boolean }) => {
      setSaveStatus("saving");
      try {
        const body: Record<string, unknown> = { puckData: data };
        if (opts?.publish !== undefined) body.isPublished = opts.publish;

        const res = await fetch(`/api/sites/${siteId}/pages/${pageId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("Save failed");
        setSaveStatus("saved");
        if (opts?.publish !== undefined) setIsPublished(opts.publish);
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    [pageId, siteId]
  );

  /* ── auto-save every 30s after a change ── */
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      save(latestDataRef.current);
    }, 30_000);
  }, [save]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

  /* ── publish handler ── */
  async function handlePublish(data: Data) {
    setPublishing(true);
    await save(data as unknown as Record<string, unknown>, { publish: true });
    setPublishing(false);
  }

  /* ── unpublish handler ── */
  async function handleUnpublish() {
    setPublishing(true);
    await save(latestDataRef.current, { publish: false });
    setPublishing(false);
  }

  /* ── status indicator ── */
  function StatusBadge() {
    if (saveStatus === "saving")
      return (
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Loader2Icon size={12} className="animate-spin" /> Saving…
        </span>
      );
    if (saveStatus === "saved")
      return (
        <span className="flex items-center gap-1.5 text-xs text-green-600">
          <CheckIcon size={12} /> Saved
        </span>
      );
    if (saveStatus === "error")
      return <span className="text-xs text-red-500">Save failed</span>;
    return null;
  }

  const previewUrl = `/sites/${siteSlug}${pagePath === "/" ? "" : pagePath}`;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Puck
        config={puckConfig}
        data={initialData as Partial<Data>}
        onPublish={handlePublish}
        onChange={(data) => {
          latestDataRef.current = data as unknown as Record<string, unknown>;
          scheduleAutoSave();
        }}
        headerTitle={pageTitle}
        headerPath={pagePath}
        renderHeaderActions={() => (
          <div className="flex items-center gap-2">
            <StatusBadge />

            {/* Back to dashboard */}
            <Link
              href={`/dashboard/sites/${siteId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftIcon size={12} />
              Dashboard
            </Link>

            {/* Preview */}
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLinkIcon size={12} />
              Preview
            </a>

            {/* Save draft */}
            <button
              onClick={() => save(latestDataRef.current)}
              disabled={saveStatus === "saving"}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Save draft
            </button>

            {/* Publish / unpublish */}
            {isPublished ? (
              <button
                onClick={handleUnpublish}
                disabled={publishing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50 transition-colors"
              >
                {publishing ? <Loader2Icon size={12} className="animate-spin" /> : <GlobeIcon size={12} />}
                Unpublish
              </button>
            ) : (
              <button
                onClick={() => handlePublish(latestDataRef.current as unknown as Data)}
                disabled={publishing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {publishing ? <Loader2Icon size={12} className="animate-spin" /> : <GlobeIcon size={12} />}
                Publish
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}
