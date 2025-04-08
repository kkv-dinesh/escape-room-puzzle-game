import React, { useEffect, useState, useRef } from "react";
import {
  Button, Typography, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton
} from "@mui/material";
import axios from "axios";
import PlayCircleOutlineSharpIcon from '@mui/icons-material/PlayCircleOutlineSharp';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const Puzzle1 = () => {
  const [boardSize, setBoardSize] = useState(5);
  const [board, setBoard] = useState([]);
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
  const userId = "67d9147284d2d7833af40528";
  const room_id = "room1";
  const navigate = useNavigate();

  useEffect(() => {
    axios.post("http://localhost:8000/game/generate", { user_id: userId })
      .then(res => {
        console.log("Board:", res.data.board);
        console.log("Colors:", res.data.colors);
        console.log("Size:", res.data.size);
        setBoardSize(res.data.size);
        setBoard(res.data.board);
        setColors(res.data.colors);
      })
      .catch(console.error);
  }, []);
  

  const startTimer = () => {
    if (timerRunning) return;
    setPuzzleStarted(true);
    setTimerRunning(true);
    setTimeElapsed(0);

    axios.post("http://localhost:8000/game/start", {
      user_id: userId,
      size: boardSize  // should be 5, 7, or 9
    })
    
      .then(() => {
        timerIntervalRef.current = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
      })
      .catch(console.error);
  };

  const endTimer = () => {
    axios.post("http://localhost:8000/game/validate", { user_id: userId, board, colors })
      .then(response => {
        if (response.data.valid) {
          setSolutionCorrect(true);
          setCompletionMessage("You have successfully completed the puzzle!");
          axios.post("http://localhost:8000/game/end-timer", { user_id: userId, room_id , colors, size:board.length});
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

  const placeQueen = (row, col) => {
    if (!puzzleStarted || solutionCorrect) return;
    const newBoard = [...board];
    newBoard[row] = col;
    setBoard(newBoard);

    axios.post("http://localhost:8000/game/validate", {
      user_id: userId,
      board: newBoard,
      colors: colors
    })
    
      .then(response => {
        if (response.data.correct) {
          endTimer();
          setSolutionCorrect(true);
        }
      })
      .catch(console.error);
  };

  const getHint = async () => {
    try {
      const response = await axios.post('http://localhost:8000/game/hint', {
        user_id: userId, // Make sure this is defined somewhere
        board,
        colors,
      });
  
      console.log("Hint response:", response.data);
  
      if (response.data.hint && Array.isArray(response.data.hint)) {
        const [row, col] = response.data.hint;
        setHintMessage(`Try placing the 😀 on row ${row + 1}, column ${col + 1}`);
        setShowHintDialog(true);
      } else {
        alert("No Hints Available");
      }
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
  
    if (!colorMap[val]) {
      console.warn("Missing color for value:", val);
    }
  
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
        5 - 😀 Challenge
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

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${boardSize}, 40px)`, justifyContent: "center", marginTop: "20px" }}>
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
              {board[row] === col ? <InsertEmoticonIcon style={{ color: "#000" }} /> : null}
            </div>
          ))
        )}
      </div>

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
          <Typography>{completionMessage}</Typography>
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
        <DialogTitle style={{ textAlign: "center", fontWeight: "bold" }}>
          5 - 😀 Challenge Info
          <IconButton onClick={() => setShowInfoDialog(false)} style={{ position: "absolute", right: "10px", top: "10px" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography style={{ textAlign: "center", marginBottom: "20px" }}>
            Solve this puzzle to get a key and escape this room.
          </Typography>
          <Typography>
            <strong>Rules:</strong>
            <ul>
              <li>The game is played on a standard 5x5 chessboard.</li>
              <li>Place exactly 5 😀 emojis on the board without any attacking each other.</li>
              <li>They attack vertically, horizontally, and diagonally.</li>
              <li>No two emojis may share the same row, column, or diagonal.</li>
            </ul>
          </Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Puzzle1;
