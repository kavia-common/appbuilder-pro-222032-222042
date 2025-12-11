"use client";

import React, { useState } from "react";
import { downloadProjectZip } from "@/lib/workspaceExtras";

export default function ExportButton({ projectId }: { projectId: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onExport = async () => {
    setErr(null);
    setBusy(true);
    try {
      await downloadProjectZip(projectId);
    } catch (e: unknown) {
      let message = "Export failed";
      if (e && typeof e === "object" && "message" in e) {
        const maybe = (e as Record<string, unknown>).message;
        if (typeof maybe === "string") {
          message = maybe;
        }
      }
      setErr(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onExport}
        className="px-3 py-2 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
        disabled={busy}
      >
        {busy ? "Preparing ZIP…" : "Export ZIP"}
      </button>
      {err && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
          {err}
        </div>
      )}
    </div>
  );
}
