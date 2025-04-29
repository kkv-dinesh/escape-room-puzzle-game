import React, { useEffect, useState, useRef } from "react";
import {
  Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle, IconButton
} from "@mui/material";
import axios from "axios";
import PlayCircleOutlineSharpIcon from '@mui/icons-material/PlayCircleOutlineSharp';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const Puzzle1 = () => {
  const boardSize = 8;
  const [board, setBoard] = useState(Array(boardSize).fill(-1));
  const [colors, setColors] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [puzzleStarted, setPuzzleStarted] = useState(false);
  const [solutionCorrect, setSolutionCorrect] = useState(false);
  const [completionMessage, setCompletionMessage] = useState("");
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showHintDialog, setShowHintDialog] = useState(false);
  const [hintMessage, setHintMessage] = useState("");
  const timerIntervalRef = useRef(null);
  const [showInvalidDialog, setShowInvalidDialog] = useState(false);



  const room_id = "room1";
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.post("http://localhost:8000/game/generate", { room_id }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setBoard(Array(boardSize).fill(-1));
        setColors(res.data.colors);
      })
      .catch(console.error);
  }, []);

  const startTimer = () => {
    if (timerRunning) return;
    setPuzzleStarted(true);
    setTimerRunning(true);
    setTimeElapsed(0);
  
    const token = localStorage.getItem("token");
    axios.post("http://localhost:8000/game/start", { room_id }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        timerIntervalRef.current = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
      })
      .catch(console.error);
  };
  const endTimer = () => {
    const token = localStorage.getItem("token");
    axios.post("http://localhost:8000/game/validate", {
      board, colors, room_id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        if (response.data.valid) {
          setSolutionCorrect(true);
          setCompletionMessage("You have successfully completed the puzzle!");
          axios.post("http://localhost:8000/game/end-timer", { room_id }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          setCompletionMessage("OOPS! Incorrect solution! Keep trying.");
        }
        setShowResultDialog(true);
        setTimerRunning(false);
        clearInterval(timerIntervalRef.current);
      })
      .catch(console.error);
  };

  const restartTimer = () => {
    setTimeElapsed(0);
    setTimerRunning(false);
    clearInterval(timerIntervalRef.current);
  };

  const clearBoard = () => {
    setBoard(Array(boardSize).fill(-1));
    setSolutionCorrect(false);
    restartTimer();
  };

  const isValidMove = (row, col) => {
    for (let r = 0; r < boardSize; r++) {
      if (r === row) continue; // 👈 Skip the current row
  
      // Column conflict
      if (board[r] === col) {
        return false;
      }
  
      // Diagonal conflict
      if (board[r] !== -1 && Math.abs(r - row) === Math.abs(board[r] - col)) {
        return false;
      }
    }
  
    // Color restriction check
    if (colors[row][col] === 9) {
      return false;
    }
  
    return true;
  };
  

  const placeQueen = (row, col) => {
    if (!puzzleStarted || solutionCorrect) return;
  
    const newBoard = [...board];
  
    // If a queen is already in this cell, remove it
    if (newBoard[row] === col) {
      newBoard[row] = -1;
      setBoard(newBoard);
      return;
    }
  
    // Otherwise, validate before placing
    if (!isValidMove(row, col)) {
      setShowInvalidDialog(true);
      return;
    }    
  
    newBoard[row] = col;
    setBoard(newBoard);
  };
  

  const getHint = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:8000/game/hint", {
        board, colors, room_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.data.invalid.length > 0) {
        setHintMessage(`Some queens are wrongly placed at rows: ${response.data.invalid.join(", ")}`);
      } else {
        const [row, col] = response.data.hint;
        setHintMessage(`Try placing the 👑 on row ${row + 1}, column ${col + 1}`);
      }
      setShowHintDialog(true);
    } catch (error) {
      console.log("Error fetching hint", error);
    }
  };

  const getColorCode = (val) => {
    const colorMap = {
      1: "#f28b82", 2: "#fbbc04", 3: "#ccff90",
      4: "#a7ffeb", 5: "#aecbfa", 6: "#d7aefb",
      7: "#fdcfe8", 8: "#e6c9a8", 9: "#ffffff"
    };
    return colorMap[val] || "#ffffff";
  };

  const handleRetry = () => {
    setShowResultDialog(false);
    navigate("/game/puzzle1");
  };

  const handleNextPuzzle = () => navigate("/game/puzzle2");

  return (
    <div style={{
      backgroundColor: "black", minHeight: "100vh", color: "#b7a14e",
      textAlign: "center", padding: "20px", fontFamily: 'Brandmark Sans, sans-serif'
    }}>
      <Navbar />
      <Typography variant="h4" style={{
        fontWeight: "bold", marginTop: "20px",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        8 - 👑 Challenge
        <IconButton onClick={() => setShowInfoDialog(true)} style={{ color: "#b7a14e", marginLeft: "10px" }}>
          <InfoIcon />
        </IconButton>
      </Typography>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
        <Button onClick={startTimer} variant="contained" style={{ backgroundColor: "#b7a14e", color: "black" }}>
          <PlayCircleOutlineSharpIcon /> Start
        </Button>

        <Button onClick={clearBoard} variant="contained" style={{ backgroundColor: "#b7a14e", color: "black" }}>
          <CancelRoundedIcon /> Clear
        </Button>

        <Button disabled variant="contained" style={{ backgroundColor: "#444", color: "#b7a14e" }}>
          <HourglassTopIcon /> {new Date(timeElapsed * 1000).toISOString().substr(11, 8)}
        </Button>

        <Button onClick={restartTimer} variant="contained" style={{ backgroundColor: "#b7a14e", color: "black" }}>
          <RestartAltIcon /> Restart
        </Button>

        <Button onClick={endTimer} variant="contained" style={{ backgroundColor: "#b7a14e", color: "black" }}>
          <CheckCircleOutlineIcon /> Validate
        </Button>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${boardSize}, 40px)`,
        justifyContent: "center",
        marginTop: "20px"
      }}>
        {Array(boardSize).fill().map((_, row) =>
          Array(boardSize).fill().map((_, col) => (
            <div
              key={`${row}-${col}`}
              onClick={() => placeQueen(row, col)}
              style={{
                width: "40px", height: "40px",
                backgroundColor: getColorCode(colors[row]?.[col]),
                border: "1px solid #b7a14e",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: puzzleStarted && !solutionCorrect ? "pointer" : "not-allowed"
              }}>
              {board[row] === col ? <span style={{ fontSize: "24px" }}>👑</span> : null}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
        <Button onClick={getHint} variant="contained" style={{ backgroundColor: "#b7a14e", color: "black" }}>
          <TipsAndUpdatesIcon /> Get Hint
        </Button>
      </div>

      {/* Hint Dialog */}
      <Dialog open={showHintDialog} onClose={() => setShowHintDialog(false)}
        PaperProps={{ sx: { backgroundColor: '#b7a14e', color: 'black' } }}>
        <DialogTitle>
          <Typography style={{ fontWeight: "bold", textAlign: "center" }}>Here is your hint 🫣</Typography>
          <IconButton onClick={() => setShowHintDialog(false)} style={{ position: "absolute", right: "10px", top: "10px" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography style={{ color: 'black', textAlign: 'center' }}>{hintMessage}</Typography>
        </DialogContent>
      </Dialog>

      {/* Invalid Move Dialog */}
      <Dialog open={showInvalidDialog} onClose={() => setShowInvalidDialog(false)}
        PaperProps={{ sx: { backgroundColor: '#b7a14e', color: 'black' } }}>
        <DialogTitle>
          <Typography variant="h6" style={{ fontWeight: "bold", textAlign: "center" }}>
            🎭 No Room on This Stage for the Queen 👑
          </Typography>
          <IconButton onClick={() => setShowInvalidDialog(false)} style={{ position: "absolute", right: "10px", top: "10px" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography style={{ textAlign: "center" }}>
            Invalid move: Queen cannot be placed here due to column, diagonal, or color conflict.
          </Typography>
        </DialogContent>
      </Dialog>


      {/* Result Dialog */}
      <Dialog open={showResultDialog} onClose={() => setShowResultDialog(false)}
        PaperProps={{ sx: { backgroundColor: '#b7a14e', color: 'black', alignItems: 'center' } }}>
        <DialogTitle sx={{ color: 'black', fontWeight: 'bold' }}>
          {solutionCorrect ? "Congratulations!" : "OOPS!"}
        </DialogTitle>
        <DialogContent>
          <Typography>{completionMessage}</Typography>

          {/* Add the unlock gif here */}
          {solutionCorrect && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <img 
                src="/unlock.gif" 
                alt="Unlock Animation" 
                style={{ maxWidth: "100%", height: "auto", margin: "20px 0" }} 
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {solutionCorrect ? (
            <Button onClick={handleNextPuzzle} sx={{ backgroundColor: 'black', color: 'white' }}>Next Puzzle</Button>
          ) : (
            <Button onClick={handleRetry} sx={{ backgroundColor: 'black', color: 'white' }}>Retry</Button>
          )}
        </DialogActions>
      </Dialog>


      {/* Info Dialog */}
      <Dialog open={showInfoDialog} onClose={() => setShowInfoDialog(false)}
        PaperProps={{ sx: { backgroundColor: '#b7a14e', color: 'black' } }}>
        <DialogTitle>
          <Typography variant="h6" style={{ fontWeight: 'bold', textAlign: 'center' }}>Info</Typography>
          <IconButton onClick={() => setShowInfoDialog(false)} style={{ position: "absolute", right: "10px", top: "10px" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>This is the 8×8 puzzle challenge. You need to place one "👑" on each row such that no two are in the same column or diagonal.</Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Puzzle1;
