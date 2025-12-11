"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, clearAuthToken } from "@/lib/apiClient";
import { useAuthGuard } from "@/lib/auth";
import type { Project } from "@/types/api";

export default function ProjectsPage() {
  const router = useRouter();
  const { ready, authed } = useAuthGuard("/auth");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (!ready || !authed) return;
    void loadProjects();
  }, [ready, authed]);

  async function loadProjects() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<Project[]>("/projects", { method: "GET" });
      setProjects(Array.isArray(res) ? res : []);
    } catch (e) {
      const message =
        typeof e === "object" && e && "message" in e
          ? String((e as { message?: unknown }).message || "Failed to load projects")
          : "Failed to load projects";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const created = await apiFetch<Project>("/projects", {
        method: "POST",
        body: { name: newName.trim() },
      });
      setNewName("");
      setProjects((prev) => [created, ...prev]);
    } catch (e) {
      const message =
        typeof e === "object" && e && "message" in e
          ? String((e as { message?: unknown }).message || "Failed to create project")
          : "Failed to create project";
      setError(message);
    } finally {
      setCreating(false);
    }
  }

  function logout() {
    clearAuthToken();
    router.replace("/auth");
  }

  const Header = (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/projects" className="text-lg font-semibold text-gray-900">
          Lovable App Builder
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/projects"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Projects
          </Link>
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!authed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {Header}
      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <section className="bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Create a new project
          </h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="My new project"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createProject}
              disabled={creating || !newName.trim()}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create project"}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            After creation, open the project in the builder to start generating
            and previewing your app.
          </p>
        </section>

        <section className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Your projects
            </h2>
          </div>
          <div className="divide-y">
            {loading ? (
              <div className="p-4 text-gray-500">Loading projects...</div>
            ) : error ? (
              <div className="p-4 text-red-600">{error}</div>
            ) : projects.length === 0 ? (
              <div className="p-4 text-gray-500">No projects yet.</div>
            ) : (
              projects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.id}
                      {p.updated_at ? ` • Updated ${p.updated_at}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/builder/${encodeURIComponent(p.id)}`}
                      className="inline-flex items-center justify-center rounded-md bg-cyan-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-cyan-700"
                    >
                      Open Builder
                    </Link>
                    <Link
                      href={`/preview/${encodeURIComponent(p.id)}`}
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
