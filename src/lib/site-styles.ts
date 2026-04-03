import type { GlobalStyles } from "@/types/site";
import { DEFAULT_GLOBAL_STYLES } from "@/types/site";

/** Merge partial DB-stored styles with defaults. */
export function resolveGlobalStyles(raw: unknown): GlobalStyles {
  if (!raw || typeof raw !== "object") return DEFAULT_GLOBAL_STYLES;
  return { ...DEFAULT_GLOBAL_STYLES, ...(raw as Partial<GlobalStyles>) };
}

/** CSS custom-property block to be injected in a <style> tag. */
export function buildCssVars(styles: GlobalStyles): string {
  const fontHeadingStack = `"${styles.fontHeading}", system-ui, sans-serif`;
  const fontBodyStack = `"${styles.fontBody}", system-ui, sans-serif`;
  return `
    --color-primary: ${styles.colorPrimary};
    --color-secondary: ${styles.colorSecondary};
    --color-accent: ${styles.colorAccent};
    --color-background: ${styles.colorBackground};
    --color-text: ${styles.colorText};
    --font-heading: ${fontHeadingStack};
    --font-body: ${fontBodyStack};
    --font-size-base: ${styles.baseFontSize}px;
  `.trim();
}

/** Google Fonts <link> href for the unique set of selected fonts. */
export function buildGoogleFontsHref(styles: GlobalStyles): string {
  const seen = new Set<string>();
  const families = [styles.fontHeading, styles.fontBody].filter((f) => {
    if (seen.has(f)) return false;
    seen.add(f);
    return true;
  });
  const params = families
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700;800`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
