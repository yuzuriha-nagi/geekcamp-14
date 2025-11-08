"use client";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserEmail(user?.email || null);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component="h1"
          sx={{
            margin_left: "100rem",
            fontSize: "20px",
            fontWeight: "bold",
            color: "#000",
          }}
        >
          WebSchool
        </Typography>
        <Box sx={{ fontSize: "14px", color: "#666" }}>
          <Typography component="strong" sx={{ fontWeight: "bold" }}>
            {userEmail || "ゲスト"}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
