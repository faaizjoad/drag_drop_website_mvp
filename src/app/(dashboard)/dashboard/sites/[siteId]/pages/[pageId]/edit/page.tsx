import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { EditorClient } from "@/components/editor/editor-client";

export default async function EditPagePage({
  params,
}: {
  params: { siteId: string; pageId: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const page = await prisma.page.findFirst({
    where: {
      id: params.pageId,
      siteId: params.siteId,
      site: { userId: session.user.id },
    },
  });

  if (!page) notFound();

  return (
    <EditorClient
      pageId={page.id}
      siteId={params.siteId}
      initialData={page.puckData as Record<string, unknown>}
    />
  );
}
