"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  deleteProjectFile,
  listProjectFiles,
  upsertProjectFile,
  updateProjectFileMeta,
  type ProjectFile,
} from "@/lib/workspaceApi";

/**
 * PUBLIC_INTERFACE
 * EditorPanel shows a two-pane view with file tree and a simple code editor.
 * To avoid heavy deps, we use a textarea-based editor and a primitive inline-diff view.
 */
export default function EditorPanel({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selected, setSelected] = useState<ProjectFile | null>(null);
  const [content, setContent] = useState("");
  const [original, setOriginal] = useState("");
  const [pathInput, setPathInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const list = await listProjectFiles(projectId);
      setFiles(list);
      // If a selected file exists, refresh its content from list if present
      if (selected?.id) {
        const fresh = list.find((f) => f.id === selected.id);
        if (fresh) {
          setSelected(fresh);
          setContent(fresh.content || "");
          setOriginal(fresh.content || "");
        }
      }
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load files";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const selectFile = (f: ProjectFile) => {
    setSelected(f);
    setContent(f.content || "");
    setOriginal(f.content || "");
    setPathInput(f.path);
  };

  const createNew = async () => {
    const p = prompt("Enter new file path (e.g., src/index.html):");
    if (!p) return;
    try {
      await upsertProjectFile(projectId, p, "");
      await refresh();
      const nf = (await listProjectFiles(projectId)).find((f) => f.path === p);
      if (nf) selectFile(nf);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create file";
      setError(msg);
    }
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      if (pathInput !== selected.path) {
        await updateProjectFileMeta(projectId, selected.id, { path: pathInput });
      }
      await upsertProjectFile(projectId, pathInput, content);
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    if (!confirm(`Delete file ${selected.path}?`)) return;
    try {
      await deleteProjectFile(projectId, selected.id);
      setSelected(null);
      setContent("");
      setOriginal("");
      await refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to delete file";
      setError(msg);
    }
  };

  const dirty = content !== original || pathInput !== (selected?.path || "");
  const diff = useMemo(() => simpleDiff(original, content), [original, content]);

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-140px)]">
      <div className="col-span-3 rounded-lg border bg-white overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="text-sm font-semibold">Files</div>
          <button className="text-xs text-blue-600" onClick={createNew}>
            + New
          </button>
        </div>
        <div className="p-2 overflow-auto text-sm">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <ul className="space-y-1">
              {files.map((f) => (
                <li key={f.id}>
                  <button
                    onClick={() => selectFile(f)}
                    className={`w-full text-left px-2 py-1 rounded ${
                      selected?.id === f.id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100"
                    }`}
                  >
                    {f.path}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="col-span-9 rounded-lg border bg-white overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 p-3 border-b">
          <input
            className="flex-1 rounded border px-2 py-1 text-sm"
            placeholder="path/to/file.ext"
            value={pathInput}
            onChange={(e) => setPathInput(e.target.value)}
            disabled={!selected}
          />
          <button
            onClick={save}
            disabled={!selected || !dirty || saving}
            className="rounded bg-blue-600 text-white text-sm px-3 py-1.5 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={remove}
            disabled={!selected}
            className="rounded bg-red-600 text-white text-sm px-3 py-1.5 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
        {error ? <div className="px-3 py-2 text-sm text-red-600 border-b">{error}</div> : null}
        <div className="grid grid-cols-2 gap-0 flex-1 min-h-0">
          <div className="flex flex-col min-h-0">
            <div className="px-3 py-2 text-xs text-gray-600 border-b">Editor</div>
            <textarea
              className="flex-1 m-3 rounded border p-2 font-mono text-xs"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Select or create a file to edit..."
            />
          </div>
          <div className="flex flex-col min-h-0 border-l">
            <div className="px-3 py-2 text-xs text-gray-600 border-b">Diff</div>
            <pre className="flex-1 m-3 rounded border p-2 font-mono text-xs overflow-auto whitespace-pre-wrap">
              {diff}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function simpleDiff(a: string, b: string): string {
  if (a === b) return "No changes.";
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const max = Math.max(aLines.length, bLines.length);
  const out: string[] = ["--- original", "+++ modified"];
  for (let i = 0; i < max; i++) {
    const l = aLines[i];
    const r = bLines[i];
    if (l === r) {
      out.push(" " + (l ?? ""));
    } else {
      if (l !== undefined) out.push("-" + l);
      if (r !== undefined) out.push("+" + r);
    }
  }
  return out.join("\n");
}
