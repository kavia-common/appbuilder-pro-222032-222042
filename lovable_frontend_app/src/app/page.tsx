"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Root route redirects to the Projects dashboard.
 */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/projects");
  }, [router]);
  return null;
}
