import React, { useState } from "react";
import { TextField, Button, Typography, Paper, Container, Box, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [openDialog, setOpenDialog] = useState(false);  // Dialog state
  const [dialogMessage, setDialogMessage] = useState(""); // Store the message for the dialog
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignUp ? "/auth/register" : "/auth/login";
    
    try {
      const response = await axios.post(`http://127.0.0.1:8000${endpoint}`, formData);
  
      setDialogMessage(response.data.message || "Logged in successfully!");
      setOpenDialog(true);
  
      if (!isSignUp) {
        // ✅ Store token in localStorage
        const token = response.data.access_token;
        localStorage.setItem("token", token);
  
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        // After successful signup, just close the dialog and let the user manually login
        setTimeout(() => {
          // You don't need to navigate anywhere after sign-up.
          setOpenDialog(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert(error.response?.data?.detail || "Something went wrong!");
    }
  };
  
  

  const handleDialogClose = () => {
    setOpenDialog(false); // Close dialog
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "black",
      }}
    >
      <Paper
        elevation={5}
        sx={{
          padding: 4,
          textAlign: "center",
          backgroundColor: "black",
          color: "#b7a14e",
          fontFamily: "Brandmark Sans",
          width: "100%",
        }}
      >
        {/* Logo */}
        <img
          src="/logo1.jpg" // The image path of your logo
          alt="Logo"
          style={{
            width: "200px",
            height: "auto",
            marginBottom: "20px",
          }}
        />
        <Typography variant="h4" sx={{ mb: 2, fontFamily: "Brandmark Sans" }}>
          {isSignUp ? "Sign Up" : "Sign In"}
        </Typography>

        <Box
          sx={{
            border: `2px solid #b7a14e`,
            padding: 3,
            borderRadius: 2,
          }}
        >
          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                name="username"
                value={formData.username}
                onChange={handleChange}
                sx={{
                  mb: 2,
                  "& label": { color: "#b7a14e" },
                  "& input": { color: "#b7a14e" },
                  "& fieldset": { borderColor: "#b7a14e" },
                }}
              />
            )}

            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              name="email"
              value={formData.email}
              onChange={handleChange}
              sx={{
                mb: 2,
                "& label": { color: "#b7a14e" },
                "& input": { color: "#b7a14e" },
                "& fieldset": { borderColor: "#b7a14e" },
              }}
            />

            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              name="password"
              value={formData.password}
              onChange={handleChange}
              sx={{
                mb: 2,
                "& label": { color: "#b7a14e" },
                "& input": { color: "#b7a14e" },
                "& fieldset": { borderColor: "#b7a14e" },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                backgroundColor: "#b7a14e",
                color: "black",
                "&:hover": { backgroundColor: "#b7a14e" },
              }}
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>
        </Box>

        <Typography
          variant="body2"
          sx={{ mt: 2, cursor: "pointer", textDecoration: "underline" }}
          onClick={toggleForm}
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Typography>
      </Paper>

      {/* Dialog for successful login */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#b7a14e", // Dialog background color
            color: "black", // Text color inside dialog
          },
        }}
      >
        <DialogTitle sx={{ color: "black",alignItems:'center' }}>Success!!!</DialogTitle>
        <DialogContent sx={{ color: "black" }}>
          <Typography variant="body1" sx={{ fontWeight: "bold" }}>
            {dialogMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDialogClose}
            color="primary"
            sx={{
              backgroundColor: "black", // Close button background color
              color: "#b7a14e", // Close button text color
              "&:hover": { backgroundColor: "#333" }, // Close button hover effect
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AuthPage;
