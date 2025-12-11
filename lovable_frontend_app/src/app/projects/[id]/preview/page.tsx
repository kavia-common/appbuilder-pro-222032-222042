"use client";

import React from "react";
import { useParams } from "next/navigation";
import PreviewPanel from "@/components/workspace/PreviewPanel";

/**
 * PUBLIC_INTERFACE
 * PreviewWorkspacePage renders the Preview tab for a project workspace.
 */
export default function PreviewWorkspacePage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id as string;

  return <PreviewPanel projectId={projectId} />;
}
