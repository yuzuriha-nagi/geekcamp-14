import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#f5f5f5",
        borderTop: "1px solid #e0e0e0",
        padding: "16px 24px",
        textAlign: "center",
      }}
    >
      <Typography sx={{ fontSize: "12px", color: "#666" }}>
        &copy; 2025 Re:Study All rights reserved.
      </Typography>
    </Box>
  );
}
