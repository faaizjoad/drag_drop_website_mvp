"use client";

import { Puck } from "@puckeditor/core";
import "@puckeditor/core/dist/index.css";
import { puckConfig } from "./puck-config";
import { useRouter } from "next/navigation";

interface EditorClientProps {
  pageId: string;
  siteId: string;
  initialData: Record<string, unknown>;
}

export function EditorClient({ pageId, siteId, initialData }: EditorClientProps) {
  const router = useRouter();

  async function handlePublish(data: Record<string, unknown>) {
    await fetch(`/api/sites/${siteId}/pages/${pageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ puckData: data }),
    });
    router.refresh();
  }

  return (
    <div className="h-screen">
      <Puck
        config={puckConfig}
        data={initialData as Parameters<typeof Puck>[0]["data"]}
        onPublish={handlePublish}
      />
    </div>
  );
}
