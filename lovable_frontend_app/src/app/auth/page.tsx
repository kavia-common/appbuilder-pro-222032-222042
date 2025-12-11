"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setAuthToken } from "@/lib/apiClient";
import type { LoginResponse } from "@/types/api";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // If already logged in, go to dashboard
    try {
      const token = window.localStorage.getItem("auth_token");
      if (token) {
        router.replace("/projects");
      }
    } catch {
      // ignore
    }
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: { email },
        noAuth: true,
      });
      const token =
        (typeof res === "object" &&
          res !== null &&
          ("token" in res ? (res as { token: string }).token : undefined)) ||
        (typeof res === "object" &&
          res !== null &&
          ("access_token" in res
            ? (res as { access_token: string }).access_token
            : undefined)) ||
        (typeof res === "string" ? res : undefined);

      if (!token) {
        throw new Error("Login succeeded but no token returned");
      }
      setAuthToken(token);
      router.replace("/projects");
    } catch (e) {
      const message =
        typeof e === "object" && e && "message" in e
          ? String((e as { message?: unknown }).message || "Login failed")
          : "Login failed";
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in</h1>
        <p className="text-gray-500 mb-6">
          Enter your email to continue. A dummy token will be issued.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {err && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
