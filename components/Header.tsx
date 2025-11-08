import { AppBar, Toolbar, Typography } from "@mui/material";
import NextLink from "next/link";
import { createClient } from "@/lib/supabase/server";
import UserMenu from "./UserMenu";

export default async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email || null;

  // Fetch user role
  let userRole: string | null = null;
  if (user) {
    const { data: roleData } = await supabase
      .from("roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (roleData) {
      // Convert role to Japanese
      const roleMap: Record<string, string> = {
        student: "(学生)",
        teacher: "(教員)",
        admin: "(管理者)",
      };
      userRole = roleMap[roleData.role] || null;
    }
  }

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
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <NextLink href="/" style={{ textDecoration: "none" }}>
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#000",
              }}
            >
              WebCampus
            </Typography>
          </NextLink>
          <NextLink
            href="/notifications"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: "0.95rem",
                color: "#71717a",
                "&:hover": { color: "#18181b" },
              }}
            >
              通知
            </Typography>
          </NextLink>
        </div>
        <UserMenu userEmail={userEmail} userRole={userRole} />
      </Toolbar>
    </AppBar>
  );
}
