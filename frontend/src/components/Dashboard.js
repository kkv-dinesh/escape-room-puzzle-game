import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar"; 
import LeaderboardIcon from '@mui/icons-material/Leaderboard';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8000/game/dashboard")
      .then((response) => setUsers(response.data.dashboard))
      .catch((error) => console.error("Error fetching Dashboard:", error));
  }, []);

  return (
    <div style={{ 
      backgroundColor: "black", 
      minHeight: "100vh", 
      color: "#b7a14e", 
      textAlign: "center", 
      padding: "20px" 
    }}>
      {/* Navbar */}
      <Navbar />

      {/* Dashboard Title */}
      <Typography 
        variant="h4" 
        gutterBottom 
        style={{ 
          color: "#b7a14e", 
          fontWeight: "bold", 
          marginTop: "20px" 
        }}
      >
        <LeaderboardIcon 
          style={{ 
            color: "#b7a14e", 
            fontSize: "40px", 
            marginBottom: "-5px" 
          }} 
        />
        Dashboard
      </Typography>

      {/* Centered Table with Gold Border */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
        <TableContainer 
          component={Paper} 
          style={{ 
            backgroundColor: "black", 
            maxWidth: "80%", 
            minWidth: "600px", 
            margin: "0 auto", 
            padding: "10px", 
            border: "2px solid #b7a14e"  // Outer border for the table
          }}
        >
          <Table style={{ borderCollapse: "collapse" }}>
            <TableHead>
              <TableRow style={{ border: "1px solid #b7a14e" }}>
                <TableCell style={{ color: "#b7a14e", fontWeight: "bold", border: "1px solid #b7a14e" }}>Username</TableCell>
                <TableCell style={{ color: "#b7a14e", fontWeight: "bold", border: "1px solid #b7a14e" }}>Puzzle 1</TableCell>
                <TableCell style={{ color: "#b7a14e", fontWeight: "bold", border: "1px solid #b7a14e" }}>Puzzle 2</TableCell>
                <TableCell style={{ color: "#b7a14e", fontWeight: "bold", border: "1px solid #b7a14e" }}>Puzzle 3</TableCell>
                <TableCell style={{ color: "#b7a14e", fontWeight: "bold", border: "1px solid #b7a14e" }}>Total Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index} style={{ border: "1px solid #b7a14e" }}>
                  <TableCell style={{ color: "#b7a14e", border: "1px solid #b7a14e" }}>{user.username}</TableCell>
                  <TableCell style={{ color: "#b7a14e", border: "1px solid #b7a14e" }}>
                    {user.puzzle1_time !== "00:00:00" ? `${parseFloat(user.puzzle1_time).toFixed(2)}s` : "N/A"}
                  </TableCell>
                  <TableCell style={{ color: "#b7a14e", border: "1px solid #b7a14e" }}>
                    {user.puzzle2_time !== "00:00:00" ? `${parseFloat(user.puzzle2_time).toFixed(2)}s` : "N/A"}
                  </TableCell>
                  <TableCell style={{ color: "#b7a14e", border: "1px solid #b7a14e" }}>
                    {user.puzzle3_time !== "00:00:00" ? `${parseFloat(user.puzzle3_time).toFixed(2)}s` : "N/A"}
                  </TableCell>
                  <TableCell style={{ color: "#b7a14e", fontWeight: "bold", border: "1px solid #b7a14e" }}>
                    {user.total_time !== "00:00:00" ? `${parseFloat(user.total_time).toFixed(2)}s` : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Start Game Button */}
      <Button
        variant="contained"
        onClick={() => navigate("/game/puzzle1")}
        style={{
          marginTop: "20px",
          backgroundColor: "#b7a14e",
          color: "black",
          fontWeight: "bold",
        }}
      >
        Can You Finish It Faster? Start Game
      </Button>
    </div>
  );
};

export default Dashboard;
