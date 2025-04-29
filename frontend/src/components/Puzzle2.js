import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, TextField
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

const Puzzle2 = () => {
  const boardSize = 9;
  const [board, setBoard] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);
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
  const room_id = "room2";  // Example room_id, change as per your use case
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Memoize headers to avoid unnecessary re-renders
  const headers = useMemo(() => {
    return {
      Authorization: `Bearer ${token}`,
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      console.error("Token not found in localStorage");
      return;
    }

    axios.post("http://localhost:8000/game/sudoku/generate", { user_id: token, room_id }, { headers })
      .then(res => {
        if (res.data.board) {
          setBoard(res.data.board);
          setInitialBoard(res.data.board.map(row => [...row]));
        } else {
          console.error("Board not returned from API");
        }
      })
      .catch(console.error);
  }, [token, headers]); // 'headers' will now only change when 'token' changes

  const startTimer = () => {
    if (timerRunning) return;
    setPuzzleStarted(true);
    setTimerRunning(true);
    setTimeElapsed(0);

    axios.post("http://localhost:8000/game/sudoku/start", { user_id: token, room_id }, { headers })
      .then(() => {
        timerIntervalRef.current = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
      })
      .catch(console.error);
  };

  const endTimer = () => {
    axios.post("http://localhost:8000/game/sudoku/validate", { user_id: token, board, room_id }, { headers })
      .then(response => {
        if (response.data.valid) {
          setSolutionCorrect(true);
          setCompletionMessage("You have successfully completed the puzzle!");
          axios.post("http://localhost:8000/game/sudoku/end-timer", { user_id: token, room_id }, { headers });
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
    const cleared = board.map((row, rIdx) =>
      row.map((cell, cIdx) => (initialBoard[rIdx][cIdx] === 0 ? 0 : cell))
    );
    setBoard(cleared);
    setSolutionCorrect(false);
    restartTimer();
  };

  const updateCell = (row, col, value) => {
    if (!puzzleStarted || solutionCorrect || initialBoard[row][col] !== 0) return;

    const val = parseInt(value, 10);
    const newBoard = board.map((r, i) => [...r]);
    newBoard[row][col] = (val >= 1 && val <= 9) ? val : 0;
    setBoard(newBoard);
  };

  const getHint = async () => {
    try {
      const response = await axios.post("http://localhost:8000/game/sudoku/hint", {
        user_id: token,
        board,
        room_id
      }, { headers });
  
      // Check if the hint response contains the expected hint_type
      if (response.data && response.data.hint_type) {
        const { message } = response.data;  // Only destructure 'message'
  
        // Update the UI with the hint message
        setHintMessage(message);
        setShowHintDialog(true);
      } else {
        alert("No Hints Available");
      }
    } catch (error) {
      console.log("Error fetching hint", error);
    }
  };
  

  const handleRetry = () => {
    setShowResultDialog(false);
    navigate("/game/puzzle2");
  };

  const handleNextPuzzle = () => navigate("/dashboard");

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
        9×9 Sudoku Puzzle
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

      {board.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${boardSize}, 40px)`,
          justifyContent: "center",
          marginTop: "20px"
        }}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <TextField
                key={`${rowIndex}-${colIndex}`}
                value={cell === 0 ? '' : cell}
                onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: "center",
                    fontWeight: initialBoard[rowIndex][colIndex] !== 0 ? "bold" : "normal"
                  },
                  readOnly: initialBoard[rowIndex][colIndex] !== 0
                }}
                sx={{
                  width: 40, height: 40,
                  '& .MuiInputBase-root': {
                    height: "100%",
                    backgroundColor: initialBoard[rowIndex][colIndex] === 0 ? "white" : "#ddd"
                  }
                }}
              />
            ))
          )}
        </div>
      ) : (
        <Typography sx={{ marginTop: 4 }}>Loading puzzle...</Typography>
      )}

      <Button onClick={getHint} variant="contained" style={{ backgroundColor: "#b7a14e", color: "black", marginTop: "20px" }}>
        <TipsAndUpdatesIcon /> Get Hint
      </Button>

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

      {/* Result Dialog */}

      <Dialog open={showResultDialog} onClose={() => setShowResultDialog(false)}
        PaperProps={{ sx: { backgroundColor: '#b7a14e', color: 'black', alignItems: 'center' } }}>
        <DialogTitle sx={{ color: 'black', fontWeight: 'bold' }}>
          {solutionCorrect ? "Congratulations!" : "OOPS!"}
        </DialogTitle>
        <DialogContent>
          {solutionCorrect && (
            // Display the GIF when the solution is correct
            <img src="/unlock.gif" alt="Unlock Animation" style={{ maxWidth: "100%", height: "auto", marginBottom: "20px" }} />
          )}
          <Typography>{completionMessage}</Typography>
        </DialogContent>
        <DialogActions>
          {solutionCorrect ? (
            <Button onClick={handleNextPuzzle} sx={{ backgroundColor: 'black', color: 'white' }}>Dashboard</Button>
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
          <Typography>This is the 9×9 Sudoku puzzle. Fill the grid with numbers from 1-9 such that each row, column, and subgrid contains all digits exactly once.</Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Puzzle2;
