"use client";

import React, { useEffect, useRef, useState } from "react";
import { connectPreview } from "@/lib/workspaceWs";
import { exportZipUrl, getPreviewUrl } from "@/lib/workspaceApi";

/**
 * PUBLIC_INTERFACE
 * PreviewPanel shows a live preview iframe and auto-reloads when backend WS sends reload events.
 */
export default function PreviewPanel({ projectId }: { projectId: string }) {
  const [url, setUrl] = useState<string>("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    getPreviewUrl(projectId).then(setUrl);
  }, [projectId]);

  useEffect(() => {
    const ws = connectPreview(projectId);
    let pingInterval: ReturnType<typeof setInterval> | undefined;

    ws.onopen = () => {
      // keep-alive
      pingInterval = setInterval(() => {
        try {
          ws.send("ping");
        } catch {}
      }, 25000);
    };
    ws.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data?.type === "reload") {
          // reload iframe
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.location.reload();
          }
        } else if (evt.data === "pong") {
          // ignore keep-alive
        }
      } catch {
        // ignore
      }
    };
    ws.onclose = () => {
      if (pingInterval) clearInterval(pingInterval);
    };
    ws.onerror = () => {
      if (pingInterval) clearInterval(pingInterval);
    };
    return () => {
      ws.close();
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [projectId]);

  const onDownload = async () => {
    const u = await exportZipUrl(projectId);
    window.open(u, "_blank");
  };

  return (
    <div className="grid grid-rows-[auto_1fr] gap-3 h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
        <div className="text-sm">
          Preview URL:{" "}
          <a className="text-blue-600 hover:underline" href={url} target="_blank">
            {url}
          </a>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => iframeRef.current?.contentWindow?.location.reload()}
            className="rounded bg-gray-700 text-white text-sm px-3 py-1.5"
          >
            Reload
          </button>
          <button onClick={onDownload} className="rounded bg-blue-600 text-white text-sm px-3 py-1.5">
            Download ZIP
          </button>
        </div>
      </div>
      <div className="rounded-lg border bg-white overflow-hidden">
        {url ? (
          <iframe ref={iframeRef} src={url} className="w-full h-full min-h-[70vh]" />
        ) : (
          <div className="p-6 text-sm text-gray-600">Loading preview...</div>
        )}
      </div>
    </div>
  );
}
