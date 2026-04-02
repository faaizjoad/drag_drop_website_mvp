/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type Config, DropZone } from "@puckeditor/core";
import { useState, useRef } from "react";
import { MediaBrowser } from "./media-browser";

/* ─── Video embed helper ───────────────────────────────────────── */

function getEmbedUrl(url: string): string | null {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/* ─── Custom image-upload field ────────────────────────────────── */

function ImageUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [browserOpen, setBrowserOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload failed");
      }
      const { url } = await res.json();
      onChange(url);
    } catch (err: any) {
      setUploadError(err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <MediaBrowser
        open={browserOpen}
        onClose={() => setBrowserOpen(false)}
        onSelect={onChange}
      />
      <div className="space-y-2">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBrowserOpen(true)}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            🖼 Browse
          </button>
          <span className="text-gray-300 text-xs">|</span>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400 transition-colors"
          >
            {uploading ? "Uploading…" : "⬆ Upload"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
        {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="w-full h-20 object-cover rounded border mt-1"
          />
        )}
      </div>
    </>
  );
}

/* ─── Shared helpers ────────────────────────────────────────────── */

const PADDING: Record<string, string> = {
  none: "0",
  sm: "24px",
  md: "48px",
  lg: "80px",
  xl: "120px",
};

const PADDING_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Small (24px)", value: "sm" },
  { label: "Medium (48px)", value: "md" },
  { label: "Large (80px)", value: "lg" },
  { label: "XL (120px)", value: "xl" },
];

const GAP_OPTIONS = [
  { label: "None (0)", value: "0" },
  { label: "XS (8px)", value: "8px" },
  { label: "Small (16px)", value: "16px" },
  { label: "Medium (24px)", value: "24px" },
  { label: "Large (40px)", value: "40px" },
  { label: "XL (64px)", value: "64px" },
];

/* ─── Config ─────────────────────────────────────────────────────── */

export const puckConfig: Config = {
  categories: {
    layout: {
      title: "Layout",
      components: ["Section", "Container", "Grid", "Columns"],
    },
    content: {
      title: "Content",
      components: ["Heading", "Text", "Image", "Button", "Spacer", "Divider"],
    },
    advanced: {
      title: "Advanced",
      components: [
        "Hero",
        "Card",
        "FeatureGrid",
        "Testimonial",
        "Navbar",
        "Footer",
        "ContactForm",
        "Video",
      ],
    },
  },

  components: {
    /* ════════════════ LAYOUT ════════════════ */

    Section: {
      label: "Section",
      fields: {
        backgroundColor: { type: "text", label: "Background color" },
        paddingY: { type: "select", label: "Vertical padding", options: PADDING_OPTIONS },
        maxWidth: {
          type: "select",
          label: "Max width",
          options: [
            { label: "Full width", value: "100%" },
            { label: "Wide (1280px)", value: "1280px" },
            { label: "Default (1024px)", value: "1024px" },
            { label: "Narrow (768px)", value: "768px" },
            { label: "Tight (640px)", value: "640px" },
          ],
        },
      },
      defaultProps: { backgroundColor: "#ffffff", paddingY: "md", maxWidth: "1280px" },
      render: ({ backgroundColor, paddingY, maxWidth }: any) => (
        <section
          style={{
            backgroundColor,
            paddingTop: PADDING[paddingY] ?? paddingY,
            paddingBottom: PADDING[paddingY] ?? paddingY,
          }}
        >
          <div style={{ maxWidth, margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
            <DropZone zone="content" />
          </div>
        </section>
      ),
    },

    Container: {
      label: "Container",
      fields: {
        direction: {
          type: "select",
          label: "Direction",
          options: [
            { label: "Column (stacked)", value: "column" },
            { label: "Row (side by side)", value: "row" },
          ],
        },
        gap: { type: "select", label: "Gap", options: GAP_OPTIONS },
        align: {
          type: "select",
          label: "Align items",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
            { label: "Stretch", value: "stretch" },
          ],
        },
        justify: {
          type: "select",
          label: "Justify content",
          options: [
            { label: "Start", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "End", value: "flex-end" },
            { label: "Space between", value: "space-between" },
            { label: "Space around", value: "space-around" },
          ],
        },
        padding: { type: "select", label: "Padding", options: PADDING_OPTIONS },
      },
      defaultProps: { direction: "column", gap: "16px", align: "stretch", justify: "flex-start", padding: "none" },
      render: ({ direction, gap, align, justify, padding }: any) => (
        <div
          style={{
            display: "flex",
            flexDirection: direction,
            gap,
            alignItems: align,
            justifyContent: justify,
            padding: PADDING[padding] ?? padding,
          }}
        >
          <DropZone zone="content" />
        </div>
      ),
    },

    Grid: {
      label: "Grid",
      fields: {
        columns: {
          type: "select",
          label: "Columns",
          options: [
            { label: "1 column", value: "1" },
            { label: "2 columns", value: "2" },
            { label: "3 columns", value: "3" },
            { label: "4 columns", value: "4" },
          ],
        },
        gap: { type: "select", label: "Gap", options: GAP_OPTIONS },
      },
      defaultProps: { columns: "3", gap: "24px" },
      render: ({ columns, gap }: any) => (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
          <DropZone zone="content" />
        </div>
      ),
    },

    Columns: {
      label: "Columns (2-col)",
      fields: {
        split: {
          type: "select",
          label: "Column ratio",
          options: [
            { label: "50 / 50", value: "1fr 1fr" },
            { label: "40 / 60", value: "2fr 3fr" },
            { label: "60 / 40", value: "3fr 2fr" },
            { label: "33 / 67", value: "1fr 2fr" },
            { label: "67 / 33", value: "2fr 1fr" },
          ],
        },
        gap: { type: "select", label: "Gap", options: GAP_OPTIONS },
      },
      defaultProps: { split: "1fr 1fr", gap: "24px" },
      render: ({ split, gap }: any) => (
        <div style={{ display: "grid", gridTemplateColumns: split, gap }}>
          <DropZone zone="left" />
          <DropZone zone="right" />
        </div>
      ),
    },

    /* ════════════════ CONTENT ════════════════ */

    Heading: {
      label: "Heading",
      fields: {
        text: { type: "text", label: "Text" },
        level: {
          type: "select",
          label: "Level",
          options: [
            { label: "H1 — Page title", value: "h1" },
            { label: "H2 — Section title", value: "h2" },
            { label: "H3 — Subsection", value: "h3" },
            { label: "H4", value: "h4" },
            { label: "H5", value: "h5" },
            { label: "H6", value: "h6" },
          ],
        },
        align: {
          type: "select",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        color: { type: "text", label: "Color (CSS value)" },
        fontSize: {
          type: "select",
          label: "Font size override",
          options: [
            { label: "Auto (level default)", value: "auto" },
            { label: "Small (1.25rem)", value: "1.25rem" },
            { label: "Medium (1.875rem)", value: "1.875rem" },
            { label: "Large (2.5rem)", value: "2.5rem" },
            { label: "XL (3rem)", value: "3rem" },
            { label: "2XL (4rem)", value: "4rem" },
          ],
        },
      },
      defaultProps: { text: "Section heading", level: "h2", align: "left", color: "#111827", fontSize: "auto" },
      render: ({ text, level, align, color, fontSize }: any) => {
        const Tag = level as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        const autoSizes: Record<string, string> = {
          h1: "3rem", h2: "2rem", h3: "1.5rem", h4: "1.25rem", h5: "1.125rem", h6: "1rem",
        };
        const weights: Record<string, number> = {
          h1: 800, h2: 700, h3: 700, h4: 600, h5: 600, h6: 500,
        };
        return (
          <Tag style={{ textAlign: align, color, fontSize: fontSize === "auto" ? autoSizes[level] : fontSize, fontWeight: weights[level] ?? 700, lineHeight: 1.2, margin: 0 }}>
            {text}
          </Tag>
        );
      },
    },

    Text: {
      label: "Text",
      fields: {
        content: { type: "textarea", label: "Content" },
        align: {
          type: "select",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        color: { type: "text", label: "Color (CSS value)" },
        fontSize: {
          type: "select",
          label: "Font size",
          options: [
            { label: "Small (0.875rem)", value: "0.875rem" },
            { label: "Default (1rem)", value: "1rem" },
            { label: "Large (1.125rem)", value: "1.125rem" },
            { label: "XL (1.25rem)", value: "1.25rem" },
          ],
        },
      },
      defaultProps: {
        content: "Write your paragraph text here. This is a great place to describe your product, service, or idea in detail.",
        align: "left",
        color: "#374151",
        fontSize: "1rem",
      },
      render: ({ content, align, color, fontSize }: any) => (
        <p style={{ textAlign: align, color, fontSize, lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>
          {content}
        </p>
      ),
    },

    Image: {
      label: "Image",
      fields: {
        src: { type: "custom", label: "Image", render: ImageUploadField as any },
        alt: { type: "text", label: "Alt text" },
        width: { type: "text", label: "Width (CSS — e.g. 100%)" },
        aspectRatio: {
          type: "select",
          label: "Aspect ratio",
          options: [
            { label: "Auto (natural height)", value: "auto" },
            { label: "16:9 (widescreen)", value: "16/9" },
            { label: "4:3 (standard)", value: "4/3" },
            { label: "1:1 (square)", value: "1" },
            { label: "3:4 (portrait)", value: "3/4" },
          ],
        },
        objectFit: {
          type: "select",
          label: "Object fit",
          options: [
            { label: "Cover", value: "cover" },
            { label: "Contain", value: "contain" },
            { label: "Fill", value: "fill" },
          ],
        },
        borderRadius: { type: "text", label: "Border radius (e.g. 12px)" },
      },
      defaultProps: { src: "", alt: "", width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "0" },
      render: ({ src, alt, width, aspectRatio, objectFit, borderRadius }: any) =>
        src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} style={{ display: "block", width, aspectRatio: aspectRatio === "auto" ? undefined : aspectRatio, objectFit, borderRadius }} />
        ) : (
          <div style={{ width, aspectRatio: aspectRatio === "auto" ? "16/9" : aspectRatio, borderRadius, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.875rem", border: "2px dashed #d1d5db" }}>
            Click to select an image
          </div>
        ),
    },

    Button: {
      label: "Button",
      fields: {
        text: { type: "text", label: "Button text" },
        href: { type: "text", label: "Link URL" },
        variant: {
          type: "select",
          label: "Variant",
          options: [
            { label: "Primary (filled blue)", value: "primary" },
            { label: "Secondary (gray)", value: "secondary" },
            { label: "Outline", value: "outline" },
            { label: "Ghost", value: "ghost" },
            { label: "Danger (red)", value: "danger" },
          ],
        },
        size: {
          type: "select",
          label: "Size",
          options: [
            { label: "Small", value: "sm" },
            { label: "Medium", value: "md" },
            { label: "Large", value: "lg" },
          ],
        },
        align: {
          type: "select",
          label: "Alignment",
          options: [
            { label: "Left", value: "flex-start" },
            { label: "Center", value: "center" },
            { label: "Right", value: "flex-end" },
          ],
        },
      },
      defaultProps: { text: "Get started", href: "#", variant: "primary", size: "md", align: "flex-start" },
      render: ({ text, href, variant, size, align }: any) => {
        const variantStyle: Record<string, React.CSSProperties> = {
          primary:   { background: "#2563eb", color: "#fff",     border: "2px solid #2563eb" },
          secondary: { background: "#f3f4f6", color: "#374151",  border: "2px solid #e5e7eb" },
          outline:   { background: "transparent", color: "#2563eb", border: "2px solid #2563eb" },
          ghost:     { background: "transparent", color: "#374151", border: "2px solid transparent" },
          danger:    { background: "#dc2626", color: "#fff",     border: "2px solid #dc2626" },
        };
        const sizeStyle: Record<string, React.CSSProperties> = {
          sm: { padding: "6px 14px",  fontSize: "0.8125rem" },
          md: { padding: "10px 22px", fontSize: "0.9375rem" },
          lg: { padding: "14px 32px", fontSize: "1.0625rem" },
        };
        return (
          <div style={{ display: "flex", justifyContent: align }}>
            <a href={href} style={{ display: "inline-block", borderRadius: "8px", fontWeight: 600, textDecoration: "none", lineHeight: 1, ...variantStyle[variant], ...sizeStyle[size] }}>
              {text}
            </a>
          </div>
        );
      },
    },

    Spacer: {
      label: "Spacer",
      fields: {
        height: {
          type: "select",
          label: "Height",
          options: [
            { label: "XS — 8px",   value: "8px"   },
            { label: "S — 16px",   value: "16px"  },
            { label: "M — 32px",   value: "32px"  },
            { label: "L — 48px",   value: "48px"  },
            { label: "XL — 64px",  value: "64px"  },
            { label: "2XL — 96px", value: "96px"  },
            { label: "3XL — 128px",value: "128px" },
            { label: "4XL — 200px",value: "200px" },
          ],
        },
      },
      defaultProps: { height: "48px" },
      render: ({ height }: any) => <div style={{ height, display: "block" }} aria-hidden="true" />,
    },

    Divider: {
      label: "Divider",
      fields: {
        color:     { type: "text", label: "Color" },
        lineStyle: {
          type: "select",
          label: "Style",
          options: [
            { label: "Solid",  value: "solid"  },
            { label: "Dashed", value: "dashed" },
            { label: "Dotted", value: "dotted" },
          ],
        },
        thickness: {
          type: "select",
          label: "Thickness",
          options: [
            { label: "Thin (1px)",   value: "1px" },
            { label: "Medium (2px)", value: "2px" },
            { label: "Thick (4px)",  value: "4px" },
          ],
        },
        width: {
          type: "select",
          label: "Width",
          options: [
            { label: "Full (100%)", value: "100%" },
            { label: "75%",         value: "75%"  },
            { label: "50%",         value: "50%"  },
          ],
        },
      },
      defaultProps: { color: "#e5e7eb", lineStyle: "solid", thickness: "1px", width: "100%" },
      render: ({ color, lineStyle, thickness, width }: any) => (
        <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
          <hr style={{ border: "none", borderTop: `${thickness} ${lineStyle} ${color}`, width, margin: 0 }} />
        </div>
      ),
    },

    /* ════════════════ ADVANCED ════════════════ */

    Hero: {
      label: "Hero",
      fields: {
        heading:            { type: "text",     label: "Heading" },
        subtext:            { type: "textarea", label: "Subtext" },
        ctaText:            { type: "text",     label: "CTA button text" },
        ctaHref:            { type: "text",     label: "CTA link URL" },
        ctaSecondaryText:   { type: "text",     label: "Secondary CTA text (optional)" },
        ctaSecondaryHref:   { type: "text",     label: "Secondary CTA URL" },
        backgroundColor:    { type: "text",     label: "Background color" },
        textColor:          { type: "text",     label: "Text color" },
        align: {
          type: "select",
          label: "Alignment",
          options: [
            { label: "Left",   value: "left"   },
            { label: "Center", value: "center" },
          ],
        },
        paddingY: { type: "select", label: "Vertical padding", options: PADDING_OPTIONS.slice(1) },
      },
      defaultProps: {
        heading: "Build beautiful websites\nwithout code",
        subtext: "A powerful drag-and-drop builder that lets anyone create professional websites in minutes.",
        ctaText: "Start for free",
        ctaHref: "#",
        ctaSecondaryText: "See demo →",
        ctaSecondaryHref: "#",
        backgroundColor: "#eef2ff",
        textColor: "#111827",
        align: "center",
        paddingY: "xl",
      },
      render: ({ heading, subtext, ctaText, ctaHref, ctaSecondaryText, ctaSecondaryHref, backgroundColor, textColor, align, paddingY }: any) => {
        const pv = PADDING[paddingY] ?? paddingY;
        return (
          <section style={{ backgroundColor, paddingTop: pv, paddingBottom: pv, paddingLeft: "24px", paddingRight: "24px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: align }}>
              <h1 style={{ fontSize: "3.5rem", fontWeight: 800, color: textColor, lineHeight: 1.1, marginBottom: "24px", whiteSpace: "pre-wrap", marginTop: 0 }}>
                {heading}
              </h1>
              <p style={{ fontSize: "1.25rem", color: textColor, opacity: 0.7, marginBottom: "40px", lineHeight: 1.7, marginTop: 0 }}>
                {subtext}
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: align === "center" ? "center" : "flex-start", flexWrap: "wrap" }}>
                {ctaText && (
                  <a href={ctaHref} style={{ display: "inline-block", backgroundColor: "#2563eb", color: "#fff", padding: "14px 32px", borderRadius: "10px", fontSize: "1rem", fontWeight: 700, textDecoration: "none" }}>
                    {ctaText}
                  </a>
                )}
                {ctaSecondaryText && (
                  <a href={ctaSecondaryHref} style={{ display: "inline-block", backgroundColor: "transparent", color: textColor, padding: "14px 24px", borderRadius: "10px", fontSize: "1rem", fontWeight: 600, textDecoration: "none", border: `2px solid ${textColor}`, opacity: 0.7 }}>
                    {ctaSecondaryText}
                  </a>
                )}
              </div>
            </div>
          </section>
        );
      },
    },

    Card: {
      label: "Card",
      fields: {
        title:           { type: "text",     label: "Title" },
        description:     { type: "textarea", label: "Description" },
        image:           { type: "custom",   label: "Image", render: ImageUploadField as any },
        link:            { type: "text",     label: "Link URL" },
        linkText:        { type: "text",     label: "Link label" },
        backgroundColor: { type: "text",     label: "Card background" },
      },
      defaultProps: {
        title: "Card title",
        description: "A concise description of this card item. Add a couple of sentences to explain the value.",
        image: "",
        link: "#",
        linkText: "Learn more",
        backgroundColor: "#ffffff",
      },
      render: ({ title, description, image, link, linkText, backgroundColor }: any) => (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", backgroundColor, display: "flex", flexDirection: "column" }}>
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "160px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.875rem" }}>
              No image
            </div>
          )}
          <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#111827", marginBottom: "8px", marginTop: 0 }}>{title}</h3>
            <p style={{ fontSize: "0.9375rem", color: "#6b7280", lineHeight: 1.65, marginBottom: "20px", flex: 1, marginTop: 0 }}>{description}</p>
            {linkText && (
              <a href={link} style={{ fontSize: "0.875rem", color: "#2563eb", fontWeight: 600, textDecoration: "none" }}>
                {linkText} →
              </a>
            )}
          </div>
        </div>
      ),
    },

    FeatureGrid: {
      label: "Feature Grid",
      fields: {
        features: {
          type: "array",
          label: "Features",
          arrayFields: {
            icon:        { type: "text",     label: "Icon (emoji)" },
            title:       { type: "text",     label: "Title" },
            description: { type: "textarea", label: "Description" },
          },
          defaultItemProps: { icon: "⚡", title: "Feature name", description: "A short description of this feature and its benefits." },
        },
        columns: {
          type: "select",
          label: "Columns",
          options: [
            { label: "2 columns", value: "2" },
            { label: "3 columns", value: "3" },
            { label: "4 columns", value: "4" },
          ],
        },
        iconSize: {
          type: "select",
          label: "Icon size",
          options: [
            { label: "Small (1.5rem)",  value: "1.5rem" },
            { label: "Medium (2.5rem)", value: "2.5rem" },
            { label: "Large (3.5rem)",  value: "3.5rem" },
          ],
        },
      },
      defaultProps: {
        features: [
          { icon: "⚡", title: "Lightning fast",      description: "Optimized for performance so your site loads instantly."       },
          { icon: "🎨", title: "Fully customizable",  description: "Adjust every detail to match your brand perfectly."            },
          { icon: "📱", title: "Mobile-first",        description: "Looks great on every screen size, automatically."              },
        ],
        columns: "3",
        iconSize: "2.5rem",
      },
      render: ({ features, columns, iconSize }: any) => (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "32px" }}>
          {(features ?? []).map((f: any, i: number) => (
            <div key={i}>
              <div style={{ fontSize: iconSize, marginBottom: "16px", lineHeight: 1 }}>{f.icon}</div>
              <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#111827", marginBottom: "8px", marginTop: 0 }}>{f.title}</h3>
              <p style={{ fontSize: "0.9375rem", color: "#6b7280", lineHeight: 1.65, margin: 0 }}>{f.description}</p>
            </div>
          ))}
        </div>
      ),
    },

    Testimonial: {
      label: "Testimonial",
      fields: {
        quote:           { type: "textarea", label: "Quote" },
        author:          { type: "text",     label: "Author name" },
        role:            { type: "text",     label: "Title / company" },
        avatar:          { type: "custom",   label: "Avatar image", render: ImageUploadField as any },
        backgroundColor: { type: "text",     label: "Background color" },
        accentColor:     { type: "text",     label: "Accent color (left border)" },
      },
      defaultProps: {
        quote: "This product transformed how we work. The ease of use and quality of output is incredible. I can't imagine going back.",
        author: "Sarah Johnson",
        role: "CEO, Acme Inc",
        avatar: "",
        backgroundColor: "#f8fafc",
        accentColor: "#2563eb",
      },
      render: ({ quote, author, role, avatar, backgroundColor, accentColor }: any) => (
        <blockquote style={{ backgroundColor, borderRadius: "12px", padding: "32px 32px 32px 28px", borderLeft: `4px solid ${accentColor}`, margin: 0 }}>
          <p style={{ fontSize: "1.125rem", color: "#111827", fontStyle: "italic", lineHeight: 1.75, marginBottom: "24px", marginTop: 0 }}>
            &ldquo;{quote}&rdquo;
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            )}
            <div>
              <p style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#111827", margin: 0 }}>{author}</p>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>{role}</p>
            </div>
          </div>
        </blockquote>
      ),
    },

    Navbar: {
      label: "Navbar",
      fields: {
        logo:            { type: "text",  label: "Brand / logo text" },
        links: {
          type: "array",
          label: "Nav links",
          arrayFields: {
            label: { type: "text", label: "Label" },
            href:  { type: "text", label: "URL"   },
          },
          defaultItemProps: { label: "Link", href: "#" },
        },
        ctaText:         { type: "text", label: "CTA button text (optional)" },
        ctaHref:         { type: "text", label: "CTA button URL" },
        backgroundColor: { type: "text", label: "Background color" },
        textColor:       { type: "text", label: "Text color" },
      },
      defaultProps: {
        logo: "MyBrand",
        links: [
          { label: "Home",    href: "#"        },
          { label: "About",   href: "#about"   },
          { label: "Pricing", href: "#pricing" },
          { label: "Contact", href: "#contact" },
        ],
        ctaText: "Get started",
        ctaHref: "#",
        backgroundColor: "#ffffff",
        textColor: "#111827",
      },
      render: ({ logo, links, ctaText, ctaHref, backgroundColor, textColor }: any) => (
        <nav style={{ backgroundColor, borderBottom: "1px solid #f1f5f9", padding: "0 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
            <a href="#" style={{ fontSize: "1.25rem", fontWeight: 800, color: textColor, textDecoration: "none", letterSpacing: "-0.02em" }}>{logo}</a>
            <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
              {(links ?? []).map((link: any, i: number) => (
                <a key={i} href={link.href} style={{ fontSize: "0.9375rem", color: textColor, textDecoration: "none", opacity: 0.75, fontWeight: 500 }}>
                  {link.label}
                </a>
              ))}
              {ctaText && (
                <a href={ctaHref} style={{ backgroundColor: "#2563eb", color: "#fff", padding: "8px 20px", borderRadius: "8px", fontSize: "0.9375rem", fontWeight: 600, textDecoration: "none" }}>
                  {ctaText}
                </a>
              )}
            </div>
          </div>
        </nav>
      ),
    },

    Footer: {
      label: "Footer",
      fields: {
        logo:      { type: "text", label: "Brand / logo text" },
        tagline:   { type: "text", label: "Tagline (optional)" },
        copyright: { type: "text", label: "Copyright text" },
        columns: {
          type: "array",
          label: "Link columns",
          arrayFields: {
            title: { type: "text", label: "Column heading" },
            links: {
              type: "array",
              label: "Links",
              arrayFields: {
                label: { type: "text", label: "Label" },
                href:  { type: "text", label: "URL"   },
              },
              defaultItemProps: { label: "Link", href: "#" },
            },
          },
          defaultItemProps: { title: "Column", links: [{ label: "Link 1", href: "#" }, { label: "Link 2", href: "#" }] },
        },
        backgroundColor: { type: "text", label: "Background color" },
        textColor:       { type: "text", label: "Text color" },
      },
      defaultProps: {
        logo: "MyBrand",
        tagline: "The easiest way to build websites.",
        copyright: `© ${new Date().getFullYear()} MyBrand. All rights reserved.`,
        columns: [
          { title: "Product", links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }, { label: "Changelog", href: "#" }] },
          { title: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Careers", href: "#" }] },
          { title: "Support", links: [{ label: "Docs", href: "#" }, { label: "Contact", href: "#" }, { label: "Status", href: "#" }] },
        ],
        backgroundColor: "#111827",
        textColor: "#9ca3af",
      },
      render: ({ logo, tagline, copyright, columns, backgroundColor, textColor }: any) => (
        <footer style={{ backgroundColor, padding: "56px 24px 32px" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: `1fr repeat(${Math.min((columns ?? []).length, 4)}, 1fr)`, gap: "40px", marginBottom: "48px" }}>
              <div>
                <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "#f9fafb", marginBottom: "8px", marginTop: 0 }}>{logo}</p>
                {tagline && <p style={{ fontSize: "0.875rem", color: textColor, margin: 0, lineHeight: 1.6 }}>{tagline}</p>}
              </div>
              {(columns ?? []).map((col: any, i: number) => (
                <div key={i}>
                  <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "#f9fafb", marginBottom: "16px", marginTop: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>{col.title}</h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {(col.links ?? []).map((link: any, j: number) => (
                      <li key={j} style={{ marginBottom: "10px" }}>
                        <a href={link.href} style={{ fontSize: "0.9375rem", color: textColor, textDecoration: "none" }}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "24px" }}>
              <p style={{ fontSize: "0.875rem", color: textColor, margin: 0 }}>{copyright}</p>
            </div>
          </div>
        </footer>
      ),
    },

    ContactForm: {
      label: "Contact Form",
      fields: {
        heading:         { type: "text",     label: "Form heading" },
        description:     { type: "textarea", label: "Description (optional)" },
        submitLabel:     { type: "text",     label: "Submit button label" },
        backgroundColor: { type: "text",     label: "Background color" },
        showPhone: {
          type: "select",
          label: "Show phone field",
          options: [
            { label: "No",  value: "false" },
            { label: "Yes", value: "true"  },
          ],
        },
      },
      defaultProps: {
        heading: "Get in touch",
        description: "Have a question or want to work together? Send us a message and we'll get back to you.",
        submitLabel: "Send message",
        backgroundColor: "#f9fafb",
        showPhone: "false",
      },
      render: ({ heading, description, submitLabel, backgroundColor, showPhone }: any) => {
        const inputStyle: React.CSSProperties = {
          width: "100%", border: "1px solid #d1d5db", borderRadius: "8px",
          padding: "10px 14px", fontSize: "0.9375rem", boxSizing: "border-box", outline: "none",
        };
        const labelStyle: React.CSSProperties = {
          display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "6px",
        };
        const baseFields = [
          { label: "Name", type: "text", placeholder: "Your name" },
          { label: "Email", type: "email", placeholder: "your@email.com" },
        ];
        if (showPhone === "true") baseFields.push({ label: "Phone", type: "tel", placeholder: "+1 (555) 000-0000" });
        return (
          <div style={{ backgroundColor, borderRadius: "16px", padding: "40px", maxWidth: "560px", margin: "0 auto" }}>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#111827", marginBottom: "8px", marginTop: 0 }}>{heading}</h2>
            {description && <p style={{ fontSize: "0.9375rem", color: "#6b7280", marginBottom: "28px", marginTop: 0, lineHeight: 1.6 }}>{description}</p>}
            <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {baseFields.map((f) => (
                <div key={f.label}>
                  <label style={labelStyle}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Message</label>
                <textarea placeholder="Your message…" rows={5} style={{ ...inputStyle, resize: "vertical" }} />
              </div>
              <button type="submit" style={{ backgroundColor: "#2563eb", color: "#fff", padding: "13px 24px", borderRadius: "8px", fontSize: "1rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
                {submitLabel}
              </button>
            </form>
          </div>
        );
      },
    },

    Video: {
      label: "Video",
      fields: {
        url:          { type: "text", label: "YouTube or Vimeo URL" },
        caption:      { type: "text", label: "Caption (optional)"    },
        borderRadius: { type: "text", label: "Border radius (e.g. 12px)" },
      },
      defaultProps: { url: "", caption: "", borderRadius: "12px" },
      render: ({ url, caption, borderRadius }: any) => {
        const embedUrl = url ? getEmbedUrl(url) : null;
        return (
          <div>
            <div style={{ position: "relative", paddingTop: "56.25%", backgroundColor: "#000", borderRadius, overflow: "hidden" }}>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video embed"
                />
              ) : (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af", gap: "8px" }}>
                  <span style={{ fontSize: "2rem" }}>▶</span>
                  <span style={{ fontSize: "0.875rem" }}>{url ? "Invalid or unsupported URL" : "Paste a YouTube or Vimeo URL"}</span>
                </div>
              )}
            </div>
            {caption && <p style={{ textAlign: "center", fontSize: "0.875rem", color: "#6b7280", margin: "10px 0 0" }}>{caption}</p>}
          </div>
        );
      },
    },
  },
};