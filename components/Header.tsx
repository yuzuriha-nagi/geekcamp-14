import { AppBar, Toolbar, Typography, Link } from "@mui/material";
import { createClient } from "@/lib/supabase/server";
import UserMenu from "./UserMenu";

export default async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userEmail = user?.email || null;

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
        <Link href="/" underline="none">
          <Typography
            variant="h6"
            component="h1"
            sx={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#000",
            }}
          >
            WebCampus
          </Typography>
        </Link>
        <UserMenu userEmail={userEmail} />
      </Toolbar>
    </AppBar>
  );
}
