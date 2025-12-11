"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import TemplatePicker from "@/components/workspace/TemplatePicker";
import VersionList from "@/components/workspace/VersionList";
import ExportButton from "@/components/workspace/ExportButton";

/**
 * PUBLIC_INTERFACE
 * WorkspaceLayout provides the shell for project workspace with tabs for Chat, Editor, Preview, and Deploy,
 * plus a left sidebar for templates, versions, and export.
 */
export const dynamic = "force-static";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const projectId = params?.id as string;

  const tabs = [
    { name: "Chat", href: `/projects/${projectId}` },
    { name: "Editor", href: `/projects/${projectId}/editor` },
    { name: "Preview", href: `/projects/${projectId}/preview` },
    { name: "Deploy", href: `/projects/${projectId}/deploy` },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="border-b bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/projects" className="text-sm text-blue-600 hover:underline">
              ← Projects
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-lg font-semibold text-gray-900">Workspace</h1>
            <span className="ml-2 text-xs text-gray-500">Project: {projectId}</span>
          </div>
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
            {tabs.map((t) => {
              const active = pathname === t.href || (t.name === "Chat" && pathname === `/projects/${projectId}`);
              return (
                <Link
                  key={t.name}
                  href={t.href}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    active ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-4 grid grid-cols-12 gap-4">
        <aside className="col-span-4 lg:col-span-3 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <TemplatePicker projectId={projectId} />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <VersionList projectId={projectId} />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <ExportButton projectId={projectId} />
          </div>
        </aside>
        <main className="col-span-8 lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}
