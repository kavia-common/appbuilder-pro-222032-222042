"use client";

import React from "react";
import { useParams } from "next/navigation";
import ChatPanel from "@/components/workspace/ChatPanel";

/**
 * PUBLIC_INTERFACE
 * ChatWorkspacePage renders the Chat tab for a project workspace.
 */
export default function ChatWorkspacePage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id as string;

  return (
    <div className="grid grid-rows-[1fr] gap-4">
      <ChatPanel projectId={projectId} />
    </div>
  );
}
