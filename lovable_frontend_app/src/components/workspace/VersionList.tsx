"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  createProjectVersion,
  listProjectVersions,
  restoreProjectVersion,
} from "@/lib/workspaceExtras";

type VersionItem = {
  number: number;
  created_at?: string;
  message?: string;
};

export default function VersionList({ projectId }: { projectId: string }) {
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const sorted = useMemo(
    () => [...versions].sort((a, b) => (b.number ?? 0) - (a.number ?? 0)),
    [versions]
  );

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await listProjectVersions(projectId);
      const items = Array.isArray(data) ? data : (data as { items?: VersionItem[] })?.items ?? [];
      setVersions(items as VersionItem[]);
    } catch (e: unknown) {
      let message = "Failed to load versions";
      if (e && typeof e === "object" && "message" in e) {
        const maybe = (e as Record<string, unknown>).message;
        if (typeof maybe === "string") {
          message = maybe;
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const snapshot = async () => {
    setError(null);
    setBusy(true);
    try {
      await createProjectVersion(projectId, message || undefined);
      setMessage("");
      await load();
    } catch (e: unknown) {
      let msg = "Failed to create version";
      if (e && typeof e === "object" && "message" in e) {
        const maybe = (e as Record<string, unknown>).message;
        if (typeof maybe === "string") {
          msg = maybe;
        }
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const restore = async (number: number) => {
    setError(null);
    setBusy(true);
    try {
      await restoreProjectVersion(projectId, number);
      await load();
    } catch (e: unknown) {
      let msg = "Failed to restore version";
      if (e && typeof e === "object" && "message" in e) {
        const maybe = (e as Record<string, unknown>).message;
        if (typeof maybe === "string") {
          msg = maybe;
        }
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Versions</h3>
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
          placeholder="Snapshot message (optional)"
        />
        <button
          onClick={snapshot}
          className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={busy}
        >
          Snapshot
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      <ul className="space-y-2">
        {sorted.length === 0 && !loading ? (
          <li className="text-sm text-gray-500">No versions yet.</li>
        ) : (
          sorted.map((v) => (
            <li
              key={v.number}
              className="rounded border border-gray-200 p-3 bg-white hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">Version {v.number}</div>
                  <div className="text-xs text-gray-600">
                    {v.message || "Snapshot"}{" "}
                    {v.created_at ? `• ${new Date(v.created_at).toLocaleString()}` : ""}
                  </div>
                </div>
                <button
                  onClick={() => restore(v.number)}
                  className="px-3 py-1.5 text-sm rounded bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
                  disabled={busy}
                >
                  Restore
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
