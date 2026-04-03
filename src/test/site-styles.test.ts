import { describe, it, expect } from "vitest";
import { resolveGlobalStyles, buildCssVars, buildGoogleFontsHref } from "@/lib/site-styles";
import { DEFAULT_GLOBAL_STYLES } from "@/types/site";

describe("resolveGlobalStyles", () => {
  it("returns defaults when given null", () => {
    expect(resolveGlobalStyles(null)).toEqual(DEFAULT_GLOBAL_STYLES);
  });

  it("returns defaults when given undefined", () => {
    expect(resolveGlobalStyles(undefined)).toEqual(DEFAULT_GLOBAL_STYLES);
  });

  it("returns defaults when given a non-object", () => {
    expect(resolveGlobalStyles("bad")).toEqual(DEFAULT_GLOBAL_STYLES);
  });

  it("merges partial overrides with defaults", () => {
    const result = resolveGlobalStyles({ colorPrimary: "#ff0000" });
    expect(result.colorPrimary).toBe("#ff0000");
    expect(result.colorSecondary).toBe(DEFAULT_GLOBAL_STYLES.colorSecondary);
    expect(result.fontHeading).toBe(DEFAULT_GLOBAL_STYLES.fontHeading);
  });

  it("merges all fields when fully specified", () => {
    const custom = {
      colorPrimary: "#111",
      colorSecondary: "#222",
      colorAccent: "#333",
      colorBackground: "#fff",
      colorText: "#000",
      fontHeading: "Poppins",
      fontBody: "Roboto",
      baseFontSize: 18,
    };
    expect(resolveGlobalStyles(custom)).toEqual(custom);
  });
});

describe("buildCssVars", () => {
  it("includes all CSS custom properties", () => {
    const css = buildCssVars(DEFAULT_GLOBAL_STYLES);
    expect(css).toContain("--color-primary:");
    expect(css).toContain("--color-secondary:");
    expect(css).toContain("--color-accent:");
    expect(css).toContain("--color-background:");
    expect(css).toContain("--color-text:");
    expect(css).toContain("--font-heading:");
    expect(css).toContain("--font-body:");
    expect(css).toContain("--font-size-base:");
  });

  it("uses the correct color values", () => {
    const styles = { ...DEFAULT_GLOBAL_STYLES, colorPrimary: "#abcdef" };
    expect(buildCssVars(styles)).toContain("--color-primary: #abcdef");
  });

  it("includes base font size with px unit", () => {
    const styles = { ...DEFAULT_GLOBAL_STYLES, baseFontSize: 18 };
    expect(buildCssVars(styles)).toContain("--font-size-base: 18px");
  });

  it("wraps font names in quotes", () => {
    const styles = { ...DEFAULT_GLOBAL_STYLES, fontHeading: "Playfair Display" };
    const css = buildCssVars(styles);
    expect(css).toContain('"Playfair Display"');
  });
});

describe("buildGoogleFontsHref", () => {
  it("includes both fonts", () => {
    const styles = { ...DEFAULT_GLOBAL_STYLES, fontHeading: "Poppins", fontBody: "Roboto" };
    const href = buildGoogleFontsHref(styles);
    expect(href).toContain("Poppins");
    expect(href).toContain("Roboto");
    expect(href).toContain("fonts.googleapis.com");
  });

  it("deduplicates when heading and body font are the same", () => {
    const styles = { ...DEFAULT_GLOBAL_STYLES, fontHeading: "Inter", fontBody: "Inter" };
    const href = buildGoogleFontsHref(styles);
    // Should appear only once
    expect(href.split("Inter").length - 1).toBe(1);
  });

  it("URL-encodes spaces in font names", () => {
    const styles = { ...DEFAULT_GLOBAL_STYLES, fontHeading: "Playfair Display", fontBody: "Open Sans" };
    const href = buildGoogleFontsHref(styles);
    expect(href).toContain("Playfair+Display");
    expect(href).toContain("Open+Sans");
  });
});
