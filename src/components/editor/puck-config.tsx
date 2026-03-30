/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Config } from "@puckeditor/core";

export const puckConfig: Config = {
  components: {
    Heading: {
      fields: {
        text: { type: "text" },
        level: {
          type: "select",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
          ],
        },
      },
      defaultProps: { text: "Heading", level: "h2" },
      render: ({ text, level }: any) => {
        const Tag = level as "h1" | "h2" | "h3";
        const sizes: Record<string, string> = {
          h1: "text-4xl font-bold",
          h2: "text-3xl font-semibold",
          h3: "text-2xl font-medium",
        };
        return <Tag className={sizes[level]}>{text}</Tag>;
      },
    },

    Text: {
      fields: {
        content: { type: "textarea" },
      },
      defaultProps: { content: "Your text here…" },
      render: ({ content }: any) => (
        <p className="text-base leading-relaxed text-gray-700">{content}</p>
      ),
    },

    Image: {
      fields: {
        src: { type: "text" },
        alt: { type: "text" },
      },
      defaultProps: { src: "", alt: "" },
      render: ({ src, alt }: any) =>
        src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="w-full rounded-lg object-cover" />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        ),
    },

    Hero: {
      fields: {
        heading: { type: "text" },
        subheading: { type: "text" },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
      },
      defaultProps: {
        heading: "Welcome to your site",
        subheading: "Built with the drag-and-drop website builder.",
        ctaLabel: "Get started",
        ctaHref: "#",
      },
      render: ({ heading, subheading, ctaLabel, ctaHref }: any) => (
        <section className="py-20 px-6 text-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{heading}</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{subheading}</p>
          <a
            href={ctaHref}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {ctaLabel}
          </a>
        </section>
      ),
    },
  },
};
