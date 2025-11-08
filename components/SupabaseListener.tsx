"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SupabaseListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      fetch("/auth/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ event: _event, session: _session }),
      }).finally(() => {
        router.refresh();
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
