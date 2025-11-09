"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      size="small"
      onClick={handleLogout}
      disabled={loading}
      sx={{
        borderColor: "#e4e4e7",
        color: "#18181b",
        "&:hover": {
          borderColor: "#18181b",
        },
      }}
    >
      {loading ? "ログアウト中..." : "ログアウト"}
    </Button>
  );
}
