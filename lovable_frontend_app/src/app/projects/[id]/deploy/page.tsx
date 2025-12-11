"use client";

export { generateStaticParams } from "../gsp";

import React from "react";
import { useParams } from "next/navigation";
import DeployPanel from "@/components/workspace/DeployPanel";

/**
 * PUBLIC_INTERFACE
 * DeployWorkspacePage renders the Deploy tab for a project workspace.
 */
export default function DeployWorkspacePage() {
  const params = useParams<{ id: string }>();
  const projectId = params?.id as string;

  return <DeployPanel projectId={projectId} />;
}
