"use client";

import React, { useEffect, useState } from "react";
import { applyTemplateToProject, fetchTemplates } from "@/lib/workspaceExtras";

type Template = {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
};

export default function TemplatePicker({ projectId }: { projectId: string }) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchTemplates();
        if (mounted) {
          const items = Array.isArray(data) ? data : (data as { items?: Template[] })?.items ?? [];
          setTemplates(items as Template[]);
        }
      } catch (e: unknown) {
        let message = "Failed to load templates";
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
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onApply = async (id: string) => {
    setError(null);
    setApplyingId(id);
    try {
      await applyTemplateToProject(projectId, id);
    } catch (e: unknown) {
      let message = "Failed to apply template";
      if (e && typeof e === "object" && "message" in e) {
        const maybe = (e as Record<string, unknown>).message;
        if (typeof maybe === "string") {
          message = maybe;
        }
      }
      setError(message);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Templates</h3>
        {loading && <span className="text-xs text-gray-500">Loading…</span>}
      </div>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
      <div className="space-y-2">
        {templates.length === 0 && !loading ? (
          <div className="text-sm text-gray-500">No templates found.</div>
        ) : (
          templates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded border border-gray-200 p-3 bg-white hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{tpl.name}</div>
                  {tpl.description && (
                    <div className="text-xs text-gray-600 mt-0.5">{tpl.description}</div>
                  )}
                  {tpl.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {tpl.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <button
                  onClick={() => onApply(tpl.id)}
                  className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={!!applyingId}
                  aria-busy={applyingId === tpl.id}
                >
                  {applyingId === tpl.id ? "Applying…" : "Apply"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
