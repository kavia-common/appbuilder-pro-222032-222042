"use client";

export { generateStaticParams } from "../gsp";

import React from "react";
import { useParams } from "next/navigation";
import EditorPanel from "@/components/workspace/EditorPanel";

/**
 * PUBLIC_INTERFACE
 * EditorWorkspacePage renders the Editor tab for a project workspace.
 */
export default function EditorWorkspacePage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id as string;

  return <EditorPanel projectId={projectId} />;
}
