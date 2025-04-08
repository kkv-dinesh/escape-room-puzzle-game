import React from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";


const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear auth token (modify as needed)
    navigate("/login"); // Redirect to login page
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "black", padding: "5px 0" }}>
        <Toolbar>
          {/* Logo */}
          <img
            src="/logo1.jpg" // Since it's in public folder, direct path works
            alt="Escape Room Logo"
            style={{ height: "50px", cursor: "pointer" }}
            onClick={() => navigate("/")}
          />

          {/* Spacer to push logout button to the right */}
          <div style={{ flexGrow: 1 }} />

          {/* Logout Button with Icon */}
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              borderColor: "#b7a14e",
              color: "#b7a14e",
              "&:hover": { backgroundColor: "#b7a14e", color: "black" },
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <LogoutIcon sx={{ color: "#b7a14e" }} />
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Line under the navbar */}
      <div style={{ height: "4px", backgroundColor: "#b7a14e" }} />
    </>
  );
};

export default Navbar;
