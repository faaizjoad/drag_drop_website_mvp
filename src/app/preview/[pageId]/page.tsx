import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Render } from "@puckeditor/core/rsc";
import { puckConfigRsc } from "@/components/editor/puck-config-rsc";
import { resolveGlobalStyles, buildCssVars, buildGoogleFontsHref } from "@/lib/site-styles";

interface Props {
  params: { pageId: string };
}

export default async function PreviewPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const page = await prisma.page.findUnique({
    where: { id: params.pageId },
    include: { site: { select: { userId: true, globalStyles: true, name: true } } },
  });

  if (!page) notFound();
  // Only the site owner can preview
  if (page.site.userId !== session.user.id) notFound();

  const globalStyles = resolveGlobalStyles(page.site.globalStyles);
  const cssVars = buildCssVars(globalStyles);
  const fontsHref = buildGoogleFontsHref(globalStyles);

  return (
    <>
      {/* Preview banner */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          background: "#1e293b",
          color: "#f8fafc",
          fontSize: "12px",
          textAlign: "center",
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
        }}
      >
        <span>
          Preview — <strong>{page.title}</strong>{" "}
          {page.isPublished ? "" : <span style={{ color: "#fbbf24" }}>(unpublished)</span>}
        </span>
        <a
          href="javascript:window.close()"
          style={{ color: "#94a3b8", textDecoration: "underline", fontSize: "11px" }}
        >
          close
        </a>
      </div>

      {/* Offset content below banner */}
      <div style={{ paddingTop: "32px" }}>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontsHref} />

        <style
          dangerouslySetInnerHTML={{
            __html: `:root { ${cssVars} } body { font-family: var(--font-body); font-size: var(--font-size-base); background-color: var(--color-background); color: var(--color-text); }`,
          }}
        />

        <Render
          config={puckConfigRsc}
          data={page.puckData as Parameters<typeof Render>[0]["data"]}
        />
      </div>
    </>
  );
}
