"use client";

import { useCallback, useEffect, useState } from "react";
import { XIcon, Trash2Icon } from "lucide-react";
import { BUILTIN_TEMPLATES, type BuiltinTemplate } from "@/lib/templates/index";

interface UserTemplate {
  id: string;
  name: string;
  isPublic: boolean;
  createdAt: string;
}

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  /** Called with the chosen template's puckData */
  onSelect: (puckData: Record<string, unknown>) => void;
}

export function TemplatePicker({ open, onClose, onSelect }: TemplatePickerProps) {
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchUserTemplates = useCallback(async () => {
    setLoadingUser(true);
    try {
      const res = await fetch("/api/templates");
      if (res.ok) setUserTemplates(await res.json());
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchUserTemplates();
  }, [open, fetchUserTemplates]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  async function selectUserTemplate(id: string) {
    const res = await fetch(`/api/templates/${id}`);
    if (!res.ok) return;
    const t = await res.json();
    onSelect(t.puckData);
  }

  async function deleteUserTemplate(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    setUserTemplates((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Choose a template</h2>
            <p className="text-xs text-gray-400 mt-0.5">Start with a built-in layout or one of your saved templates</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Built-in templates */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Built-in templates
            </p>
            <div className="grid grid-cols-3 gap-3">
              {BUILTIN_TEMPLATES.map((tpl: BuiltinTemplate) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onSelect(tpl.puckData)}
                  className="group text-left rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {/* Visual preview area */}
                  <div
                    className="h-28 flex items-center justify-center text-4xl"
                    style={{ backgroundColor: tpl.color }}
                  >
                    {tpl.icon}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {tpl.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                      {tpl.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* User templates */}
          {(loadingUser || userTemplates.length > 0) && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Your saved templates
              </p>
              {loadingUser ? (
                <p className="text-sm text-gray-400">Loading…</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {userTemplates.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => selectUserTemplate(tpl.id)}
                      className="group relative text-left rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-md transition-all overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <div className="h-28 flex items-center justify-center text-4xl bg-gradient-to-br from-violet-50 to-blue-50">
                        💾
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                          {tpl.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(tpl.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => deleteUserTemplate(e, tpl.id)}
                        disabled={deletingId === tpl.id}
                        className="absolute top-2 right-2 p-1 rounded-md bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete template"
                      >
                        <Trash2Icon size={12} />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
