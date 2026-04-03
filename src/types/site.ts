export interface GlobalStyles {
  colorPrimary: string;    // --color-primary
  colorSecondary: string;  // --color-secondary
  colorAccent: string;     // --color-accent
  colorBackground: string; // --color-background
  colorText: string;       // --color-text
  fontHeading: string;     // --font-heading (e.g. "Inter")
  fontBody: string;        // --font-body
  baseFontSize: number;    // --font-size-base (px, 14-20)
}

export const DEFAULT_GLOBAL_STYLES: GlobalStyles = {
  colorPrimary: "#2563eb",
  colorSecondary: "#64748b",
  colorAccent: "#f59e0b",
  colorBackground: "#ffffff",
  colorText: "#111827",
  fontHeading: "Inter",
  fontBody: "Inter",
  baseFontSize: 16,
};

export const GOOGLE_FONTS = [
  "Inter",
  "Poppins",
  "Roboto",
  "Playfair Display",
  "Montserrat",
  "Open Sans",
  "Lato",
  "Raleway",
] as const;

export type GoogleFont = (typeof GOOGLE_FONTS)[number];
