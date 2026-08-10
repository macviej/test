"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAdminGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const res = await fetch("/api/admin/me");
      if (cancelled) return;
      if (!res.ok) {
        router.replace("/admin/login");
        return;
      }
      setReady(true);
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return ready;
}
