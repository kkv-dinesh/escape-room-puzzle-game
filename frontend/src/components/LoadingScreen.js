import React from "react";
import { Box, CircularProgress } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#0f0f0f",
      }}
    >
      {/* Replace with your logo */}
      <img
        src="/logo1.jpg" // Update with your logo path
        alt="Escape Room Logo"
        style={{ width: "500px", height: "150px", marginBottom: "20px" }}
      />
      <CircularProgress sx={{ color: "#b7a14e" }} />
    </Box>
  );
};

export default LoadingScreen;
