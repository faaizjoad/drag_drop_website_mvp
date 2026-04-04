"use client";

import { useEffect, useState } from "react";
import { CheckCircle2Icon, XCircleIcon, InfoIcon, XIcon } from "lucide-react";
import type { ToastType } from "@/lib/toast";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail as Toast;
      setToasts((prev) => [...prev, detail]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== detail.id));
      }, 3500);
    }
    window.addEventListener("__app_toast__", handler);
    return () => window.removeEventListener("__app_toast__", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem
          key={t.id}
          toast={t}
          onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
        />
      ))}
    </div>
  );
}

const ICONS = {
  success: CheckCircle2Icon,
  error: XCircleIcon,
  info: InfoIcon,
} as const;

const ICON_COLORS = {
  success: "text-green-400",
  error: "text-red-400",
  info: "text-blue-400",
} as const;

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const Icon = ICONS[toast.type];
  return (
    <div
      className="flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl text-sm font-medium pointer-events-auto min-w-[260px] max-w-sm"
      style={{ animation: "slideUp 0.2s ease" }}
    >
      <Icon size={15} className={ICON_COLORS[toast.type]} />
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 text-gray-400 hover:text-white transition-colors"
      >
        <XIcon size={14} />
      </button>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
