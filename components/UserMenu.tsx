"use client";

import { useState } from "react";
import { Box, Typography, Menu, MenuItem } from "@mui/material";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type UserMenuProps = {
  userEmail: string | null;
  userRole: string | null;
};

export default function UserMenu({ userEmail, userRole }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    handleClose();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <Box
        sx={{
          fontSize: "14px",
          color: "#666",
          cursor: "pointer",
          "&:hover": { color: "#000" },
        }}
        onClick={handleClick}
      >
        <Typography component="strong" sx={{ fontWeight: "bold" }}>
          {userEmail || "ゲスト"}
          {userRole && ` ${userRole}`}
        </Typography>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
      </Menu>
    </>
  );
}
