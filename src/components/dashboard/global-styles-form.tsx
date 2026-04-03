"use client";

import { useState, useTransition } from "react";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { updateGlobalStyles } from "@/lib/actions/sites";
import type { GlobalStyles } from "@/types/site";
import { DEFAULT_GLOBAL_STYLES, GOOGLE_FONTS } from "@/types/site";

interface GlobalStylesFormProps {
  siteId: string;
  initialStyles: GlobalStyles;
}

const COLOR_FIELDS: { key: keyof GlobalStyles; label: string }[] = [
  { key: "colorPrimary",    label: "Primary"    },
  { key: "colorSecondary",  label: "Secondary"  },
  { key: "colorAccent",     label: "Accent"     },
  { key: "colorBackground", label: "Background" },
  { key: "colorText",       label: "Text"       },
];

export function GlobalStylesForm({ siteId, initialStyles }: GlobalStylesFormProps) {
  const [styles, setStyles] = useState<GlobalStyles>(initialStyles);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof GlobalStyles>(key: K, value: GlobalStyles[K]) {
    setStyles((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateGlobalStyles(siteId, styles as unknown as Record<string, unknown>);
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  const headingFont = styles.fontHeading || DEFAULT_GLOBAL_STYLES.fontHeading;
  const bodyFont = styles.fontBody || DEFAULT_GLOBAL_STYLES.fontBody;
  const googleFontsHref = `https://fonts.googleapis.com/css2?family=${headingFont.replace(/ /g, "+")}:wght@400;700&family=${bodyFont.replace(/ /g, "+")}:wght@400;500&display=swap`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Load fonts for the preview */}
      <link rel="stylesheet" href={googleFontsHref} />

      {/* ── Color palette ─────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Color palette
        </p>
        <div className="flex flex-wrap gap-5">
          {COLOR_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex flex-col items-center gap-1.5 cursor-pointer">
              <div className="relative">
                <input
                  type="color"
                  value={styles[key] as string}
                  onChange={(e) => set(key, e.target.value)}
                  className="sr-only"
                  id={`color-${key}`}
                />
                <label
                  htmlFor={`color-${key}`}
                  className="block w-10 h-10 rounded-lg border-2 border-white shadow-md ring-1 ring-gray-200 cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: styles[key] as string }}
                />
              </div>
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-[10px] font-mono text-gray-400">{styles[key] as string}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Typography ────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Typography
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Heading font
            </label>
            <select
              value={styles.fontHeading}
              onChange={(e) => set("fontHeading", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {GOOGLE_FONTS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Body font
            </label>
            <select
              value={styles.fontBody}
              onChange={(e) => set("fontBody", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {GOOGLE_FONTS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Base font size — {styles.baseFontSize}px
            </label>
            <input
              type="range"
              min={14}
              max={20}
              step={1}
              value={styles.baseFontSize}
              onChange={(e) => set("baseFontSize", Number(e.target.value))}
              className="w-full accent-blue-600 mt-2"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>14px</span>
              <span>20px</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Preview card ──────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Preview
        </p>
        <div
          className="rounded-xl border border-gray-200 overflow-hidden shadow-sm max-w-xs"
          style={{ backgroundColor: styles.colorBackground, fontSize: `${styles.baseFontSize}px` }}
        >
          {/* Colored header strip */}
          <div style={{ backgroundColor: styles.colorPrimary, height: "8px" }} />
          <div className="p-5">
            <h3
              className="font-bold mb-2"
              style={{
                fontFamily: `"${headingFont}", system-ui, sans-serif`,
                color: styles.colorText,
                fontSize: "1.25em",
                margin: 0,
              }}
            >
              Heading Preview
            </h3>
            <p
              className="mb-4"
              style={{
                fontFamily: `"${bodyFont}", system-ui, sans-serif`,
                color: styles.colorText,
                opacity: 0.7,
                fontSize: "0.9em",
                lineHeight: 1.6,
                margin: "8px 0 16px",
              }}
            >
              Body text in {bodyFont}. Readable and clean.
            </p>
            <div className="flex gap-2">
              <span
                className="inline-block text-white text-xs font-semibold rounded-md px-3 py-1.5"
                style={{
                  backgroundColor: styles.colorPrimary,
                  fontFamily: `"${bodyFont}", system-ui, sans-serif`,
                }}
              >
                Primary
              </span>
              <span
                className="inline-block text-white text-xs font-semibold rounded-md px-3 py-1.5"
                style={{
                  backgroundColor: styles.colorAccent,
                  fontFamily: `"${bodyFont}", system-ui, sans-serif`,
                }}
              >
                Accent
              </span>
              <span
                className="inline-block text-xs font-semibold rounded-md px-3 py-1.5"
                style={{
                  backgroundColor: styles.colorSecondary,
                  color: "#fff",
                  fontFamily: `"${bodyFont}", system-ui, sans-serif`,
                }}
              >
                Secondary
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          {isPending ? (
            <Loader2Icon size={14} className="animate-spin" />
          ) : saved ? (
            <CheckIcon size={14} />
          ) : null}
          {isPending ? "Saving…" : saved ? "Saved!" : "Save theme"}
        </button>
      </div>
    </form>
  );
}
