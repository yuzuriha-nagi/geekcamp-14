"use client";

import { Typography } from "@mui/material";

type UserMenuProps = {
  userEmail: string | null;
  userRole: string | null;
};

export default function UserMenu({ userEmail, userRole }: UserMenuProps) {
  return (
    <Typography component="strong" sx={{ fontWeight: "bold", fontSize: "14px" }}>
      {userEmail || "ゲスト"}
      {userRole && ` ${userRole}`}
    </Typography>
  );
}
