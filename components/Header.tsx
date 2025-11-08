import { AppBar, Toolbar, Typography, Box } from "@mui/material";

export default function Header() {
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
          WebClass
        </Typography>
        <Box sx={{ fontSize: "14px", color: "#666" }}>
          <Typography component="strong" sx={{ fontWeight: "bold" }}>
            ユーザー名
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
