"use client";

import { Puck, usePuck, type Data } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { puckConfig } from "./puck-config";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  GlobeIcon,
  Loader2Icon,
  CheckIcon,
  BookmarkIcon,
  Undo2Icon,
  Redo2Icon,
  MonitorIcon,
  TabletIcon,
  SmartphoneIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/lib/toast";

interface EditorClientProps {
  pageId: string;
  siteId: string;
  pagePath: string;
  pageTitle: string;
  isPublished: boolean;
  initialData: Record<string, unknown>;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

/* ── Controls rendered inside Puck's tree (can use usePuck) ───────── */

interface EditorControlsProps {
  onSave: () => void;
}

function EditorControls({ onSave }: EditorControlsProps) {
  const { history, dispatch, selectedItem, getSelectorForId } = usePuck();

  /* Keyboard shortcuts */
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true";

      if (ctrl && e.key === "s") {
        e.preventDefault();
        onSave();
        return;
      }
      if (ctrl && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        if (history.hasPast) history.back();
        return;
      }
      if (ctrl && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        if (history.hasFuture) history.forward();
        return;
      }
      if (!isEditing && (e.key === "Delete" || e.key === "Backspace") && selectedItem) {
        e.preventDefault();
        const id = (selectedItem as unknown as { id: string }).id;
        const selector = getSelectorForId(id);
        if (selector) dispatch({ type: "remove", index: selector.index, zone: selector.zone });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history, onSave, dispatch, selectedItem, getSelectorForId]);

  const btnBase =
    "flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex items-center gap-0.5 border border-gray-200 rounded-lg p-0.5 bg-white">
      <button
        onClick={history.back}
        disabled={!history.hasPast}
        title="Undo (Ctrl+Z)"
        className={btnBase}
      >
        <Undo2Icon size={13} />
      </button>
      <button
        onClick={history.forward}
        disabled={!history.hasFuture}
        title="Redo (Ctrl+Shift+Z)"
        className={btnBase}
      >
        <Redo2Icon size={13} />
      </button>
    </div>
  );
}

/* ── Main editor component ────────────────────────────────────────── */

export function EditorClient({
  pageId,
  siteId,
  pagePath,
  pageTitle,
  isPublished: initialIsPublished,
  initialData,
}: EditorClientProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [publishing, setPublishing] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);
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
        if (opts?.publish !== undefined) {
          setIsPublished(opts.publish);
          toast(
            opts.publish ? "Page published" : "Page unpublished",
            opts.publish ? "success" : "info"
          );
        }
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        setSaveStatus("error");
        toast("Save failed — please try again", "error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    [pageId, siteId]
  );

  /* ── memoised save-current for EditorControls ── */
  const saveCurrent = useCallback(() => save(latestDataRef.current), [save]);

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

  /* ── save as template ── */
  async function handleSaveAsTemplate() {
    const name = window.prompt("Template name:", pageTitle);
    if (!name?.trim()) return;
    setSavingTemplate(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), puckData: latestDataRef.current }),
      });
      if (res.ok) {
        setTemplateSaved(true);
        toast("Template saved", "success");
        setTimeout(() => setTemplateSaved(false), 2500);
      } else {
        toast("Failed to save template", "error");
      }
    } finally {
      setSavingTemplate(false);
    }
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

  const previewUrl = `/preview/${pageId}`;

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
        iframe={{ enabled: false }}
        headerTitle={pageTitle}
        headerPath={pagePath}
        viewports={[
          { width: 1280, label: "Desktop", icon: <MonitorIcon size={14} /> },
          { width: 768, label: "Tablet", icon: <TabletIcon size={14} /> },
          { width: 375, label: "Mobile", icon: <SmartphoneIcon size={14} /> },
        ]}
        renderHeaderActions={() => (
          <div className="flex items-center gap-2">
            <StatusBadge />

            {/* Undo / Redo + keyboard shortcuts (uses usePuck inside Puck tree) */}
            <EditorControls onSave={saveCurrent} />

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

            {/* Save as template */}
            <button
              onClick={handleSaveAsTemplate}
              disabled={savingTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              title="Save as template"
            >
              {templateSaved ? <CheckIcon size={12} /> : <BookmarkIcon size={12} />}
              {templateSaved ? "Saved!" : savingTemplate ? "Saving…" : "Save as template"}
            </button>

            {/* Save draft */}
            <button
              onClick={saveCurrent}
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
                {publishing ? (
                  <Loader2Icon size={12} className="animate-spin" />
                ) : (
                  <GlobeIcon size={12} />
                )}
                Unpublish
              </button>
            ) : (
              <button
                onClick={() => handlePublish(latestDataRef.current as unknown as Data)}
                disabled={publishing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {publishing ? (
                  <Loader2Icon size={12} className="animate-spin" />
                ) : (
                  <GlobeIcon size={12} />
                )}
                Publish
              </button>
            )}
          </div>
        )}
      />
    </div>
  );
}
