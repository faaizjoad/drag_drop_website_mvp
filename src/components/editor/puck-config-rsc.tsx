/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * RSC-safe Puck config — no "use client", no hooks, no DropZone import.
 * Used exclusively by the published-page <Render> server component.
 * Layout zones use puck.renderDropZone() injected by Puck's RSC renderer.
 */

import type { Config } from "@puckeditor/core";
import React from "react";

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

/* ─── Shared helpers ────────────────────────────────────────────── */

const PADDING: Record<string, string> = {
  none: "0",
  sm: "24px",
  md: "48px",
  lg: "80px",
  xl: "120px",
};

/* ─── RSC Config ─────────────────────────────────────────────────── */

export const puckConfigRsc: Config = {
  components: {
    /* ════════════════ LAYOUT ════════════════ */

    Section: {
      render: ({ backgroundColor, paddingY, maxWidth, puck }: any) => (
        <section
          style={{
            backgroundColor,
            paddingTop: PADDING[paddingY] ?? paddingY,
            paddingBottom: PADDING[paddingY] ?? paddingY,
          }}
        >
          <div style={{ maxWidth, margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
            {puck.renderDropZone({ zone: "content" })}
          </div>
        </section>
      ),
    },

    Container: {
      render: ({ direction, gap, align, justify, padding, puck }: any) => (
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
          {puck.renderDropZone({ zone: "content" })}
        </div>
      ),
    },

    Grid: {
      render: ({ columns, gap, puck }: any) => (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
          {puck.renderDropZone({ zone: "content" })}
        </div>
      ),
    },

    Columns: {
      render: ({ split, gap, puck }: any) => (
        <div style={{ display: "grid", gridTemplateColumns: split, gap }}>
          {puck.renderDropZone({ zone: "left" })}
          {puck.renderDropZone({ zone: "right" })}
        </div>
      ),
    },

    /* ════════════════ CONTENT ════════════════ */

    Heading: {
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
      render: ({ content, align, color, fontSize }: any) => (
        <p style={{ textAlign: align, color, fontSize, lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>
          {content}
        </p>
      ),
    },

    Image: {
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
      render: ({ height }: any) => <div style={{ height, display: "block" }} aria-hidden="true" />,
    },

    Divider: {
      render: ({ color, lineStyle, thickness, width }: any) => (
        <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
          <hr style={{ border: "none", borderTop: `${thickness} ${lineStyle} ${color}`, width, margin: 0 }} />
        </div>
      ),
    },

    /* ════════════════ ADVANCED ════════════════ */

    Hero: {
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
            <form style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
