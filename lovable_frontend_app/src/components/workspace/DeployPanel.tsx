"use client";

import React, { useEffect, useState } from "react";
import { getDeploy, listDeploys, startDeploy, type DeployRecord } from "@/lib/workspaceApi";

/**
 * PUBLIC_INTERFACE
 * DeployPanel triggers deployments and polls status.
 */
export default function DeployPanel({ projectId }: { projectId: string }) {
  const [deploys, setDeploys] = useState<DeployRecord[]>([]);
  const [current, setCurrent] = useState<DeployRecord | null>(null);
  const [polling, setPolling] = useState<ReturnType<typeof setInterval> | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshList = async () => {
    const list = await listDeploys(projectId);
    setDeploys(list);
  };

  useEffect(() => {
    refreshList();
    return () => {
      if (polling) clearInterval(polling);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const trigger = async () => {
    setLoading(true);
    try {
      const d = await startDeploy(projectId);
      setCurrent(d);
      setDeploys((prev) => [d, ...prev]);
      const id = setInterval(async () => {
        const latest = await getDeploy(projectId, d.id);
        setCurrent(latest);
        setDeploys((prev) => [latest, ...prev.filter((x) => x.id !== latest.id)]);
        if (latest.status === "succeeded" || latest.status === "failed") {
          clearInterval(id);
          setPolling(null);
        }
      }, 2000);
      setPolling(id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
      <div className="col-span-7 rounded-lg border bg-white overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="text-sm font-semibold">Deploy</div>
          <button
            onClick={trigger}
            disabled={loading}
            className="rounded bg-blue-600 text-white text-sm px-3 py-1.5 disabled:opacity-50"
          >
            {loading ? "Starting..." : "Deploy"}
          </button>
        </div>
        <div className="p-4 text-sm">
          {current ? (
            <div>
              <div className="mb-2">
                <span className="text-gray-500">Current:</span>{" "}
                <span className="font-mono">{current.id}</span> •{" "}
                <span
                  className={`px-2 py-0.5 rounded text-white text-xs ${
                    current.status === "succeeded"
                      ? "bg-emerald-600"
                      : current.status === "failed"
                      ? "bg-red-600"
                      : "bg-gray-600"
                  }`}
                >
                  {current.status}
                </span>
              </div>
              {current.url ? (
                <div>
                  <a href={current.url} target="_blank" className="text-blue-600 hover:underline">
                    Open deployment
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-gray-600">No active deployment.</div>
          )}
        </div>
      </div>
      <div className="col-span-5 rounded-lg border bg-white overflow-hidden">
        <div className="p-3 border-b text-sm font-semibold">History</div>
        <div className="p-3 text-sm">
          {deploys.length ? (
            <ul className="space-y-2">
              {deploys.map((d) => (
                <li key={d.id} className="flex items-center justify-between border rounded px-2 py-1">
                  <div className="truncate">
                    <div className="font-mono text-xs">{d.id}</div>
                    <div className="text-xs text-gray-500">{d.created_at || ""}</div>
                  </div>
                  <div
                    className={`px-2 py-0.5 rounded text-white text-xs ${
                      d.status === "succeeded" ? "bg-emerald-600" : d.status === "failed" ? "bg-red-600" : "bg-gray-600"
                    }`}
                  >
                    {d.status}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-600">No deployments yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
