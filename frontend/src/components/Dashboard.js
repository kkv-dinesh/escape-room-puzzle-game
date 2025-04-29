import React, { useEffect, useState } from "react";
import {
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Dialog,
  DialogContent, DialogTitle, IconButton
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import ExtensionIcon from '@mui/icons-material/Extension';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';  // Import Close icon

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.post("http://localhost:8000/game/dashboard", {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [response.data];

        // Map through the data and format total_time (in seconds) into a readable format
        const parsed = data.map(user => ({
          ...user,
          formattedTime: formatDuration(user.total_time) // Format time directly using total_time (in seconds)
        }));
        console.log("Parsed Data:", parsed); // Log the parsed data for debugging
        // Sort by total_time (ascending)
        parsed.sort((a, b) => a.total_time - b.total_time);

        setUsers(parsed);
      })
      .catch((error) => {
        console.error("Error fetching dashboard:", error);
      });
  }, []);

  // Converts seconds into a readable format "hh:mm:ss"
  const formatDuration = (totalSeconds) => {
    if (isNaN(totalSeconds)) {
      console.warn("Invalid totalSeconds:", totalSeconds);
      return "Invalid Time"; // Return a fallback for invalid totalSeconds
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <div style={{
      backgroundColor: "black",
      minHeight: "100vh",
      color: "#b7a14e",
      textAlign: "center",
      padding: "20px"
    }}>
      <Navbar />

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
        {/* Info icon to open the dialog */}
        <IconButton
          onClick={handleDialogOpen}
          style={{
            color: "#b7a14e",
            marginLeft: "10px"
          }}
        >
          <InfoIcon />
        </IconButton>
      </Typography>

      {users.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
          <TableContainer
            component={Paper}
            style={{
              backgroundColor: "black",
              maxWidth: "80%",
              minWidth: "600px",
              margin: "0 auto",
              padding: "10px",
              border: "2px solid #b7a14e"
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={headerStyle}>
                    <MilitaryTechIcon style={{ verticalAlign: "middle", marginRight: 5 }} />
                    Rank
                  </TableCell>
                  <TableCell style={headerStyle}>Username</TableCell>
                  <TableCell style={headerStyle}>
                    <ExtensionIcon style={{ verticalAlign: "middle", marginRight: 5 }} />
                    N Queens
                  </TableCell>
                  <TableCell style={headerStyle}>
                    <ExtensionIcon style={{ verticalAlign: "middle", marginRight: 5 }} />
                    Sudoku
                  </TableCell>
                  <TableCell style={headerStyle}>
                    <HourglassTopIcon style={{ verticalAlign: "middle", marginRight: 5 }} />
                    Total Time
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell style={cellStyle}>{index + 1}</TableCell>
                    <TableCell style={cellStyle}>{user.username || "N/A"}</TableCell>
                    <TableCell style={cellStyle}>{user.n_queens?.duration || "N/A"}</TableCell>
                    <TableCell style={cellStyle}>{user.sudoku?.duration || "N/A"}</TableCell>
                    <TableCell style={cellStyle}>{user.formattedTime || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}

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

      {/* Info Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle
          style={{
            backgroundColor: "#b7a14e",
            color: "black",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Space out title and close icon
            fontWeight: "bold",
            paddingBottom: 0, // Remove extra padding on the bottom of the title section
          }}
        >
          <div style={{ display: "flex", alignItems: "center",justifyContent: "center" }}>
            <ExtensionIcon style={{ marginRight: "10px" }} />
            Escape Room Puzzle Game
          </div>
          {/* Close icon */}
          <IconButton
            onClick={handleDialogClose}
            style={{
              color: "black", // Color for the close icon
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ backgroundColor: "#b7a14e", color: "black", paddingBottom: 0 }}>
          <Typography variant="h6" style={{ fontWeight: "bold" }}>
            1. 8 Queens Game
          </Typography>
          <ul>
            <li>Place 8 queens on a chessboard such that no two queens threaten each other.</li>
            <li>The queens must be placed on the board so that no two queens share the same row, column, or diagonal.</li>
            <li>The challenge is to find a configuration where all queens are safely placed.</li>
            <li>Complete this puzzle to reveal the key for the next step !!!</li>
          </ul>

          <Typography variant="h6" style={{ fontWeight: "bold", marginTop: "20px" }}>
            2. Sudoku Game
          </Typography>
          <ul>
            <li>Sudoku is a logic-based number placement puzzle.</li>
            <li>The grid consists of 9 rows, 9 columns, and 9 3x3 subgrids.</li>
            <li>Each row, each column, and each subgrid must contain all the digits from 1 to 9 without repetition.</li>
            <li>The puzzle starts with some numbers pre-filled, and the goal is to fill the remaining cells.</li>
            <li>Complete this puzzle to reveal the key and escape the room.</li>
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 🟨 Styles
const headerStyle = {
  color: "#b7a14e",
  fontWeight: "bold",
  border: "1px solid #b7a14e"
};

const cellStyle = {
  color: "#b7a14e",
  border: "1px solid #b7a14e"
};

export default Dashboard;
