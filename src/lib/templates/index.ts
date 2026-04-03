import blank from "./blank.json";
import landingPage from "./landing-page.json";
import aboutPage from "./about-page.json";
import contactPage from "./contact-page.json";
import blogPost from "./blog-post.json";
import portfolio from "./portfolio.json";

export interface BuiltinTemplate {
  id: string;
  name: string;
  description: string;
  /** Emoji used as the visual in the picker card */
  icon: string;
  /** Color used as card background accent */
  color: string;
  puckData: Record<string, unknown>;
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: "blank",
    name: "Blank page",
    description: "Start with an empty canvas",
    icon: "✨",
    color: "#f8fafc",
    puckData: blank as Record<string, unknown>,
  },
  {
    id: "landing-page",
    name: "Landing page",
    description: "Hero, features, testimonial, CTA, footer",
    icon: "🚀",
    color: "#eef2ff",
    puckData: landingPage as Record<string, unknown>,
  },
  {
    id: "about-page",
    name: "About page",
    description: "Hero, values grid, team section",
    icon: "👥",
    color: "#f0fdf4",
    puckData: aboutPage as Record<string, unknown>,
  },
  {
    id: "contact-page",
    name: "Contact page",
    description: "Contact form and info cards",
    icon: "✉️",
    color: "#fff7ed",
    puckData: contactPage as Record<string, unknown>,
  },
  {
    id: "blog-post",
    name: "Blog post",
    description: "Article layout with heading, body, pull-quote",
    icon: "📝",
    color: "#fdf4ff",
    puckData: blogPost as Record<string, unknown>,
  },
  {
    id: "portfolio",
    name: "Portfolio",
    description: "Hero, project cards, about, contact",
    icon: "🎨",
    color: "#f0f9ff",
    puckData: portfolio as Record<string, unknown>,
  },
];
