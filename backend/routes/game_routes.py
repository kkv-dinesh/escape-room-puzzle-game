from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from colors import predefined_colors
from algorithms.backtracking_solver import solve_n_queens
from algorithms.dp_validator import is_valid_board
from algorithms.greedy_hint import get_next_hint
from database import game_sessions
from models import GameState
from algorithms.sudoku_generator import generate_sudoku_puzzle
from algorithms.sudoku_validator import is_valid_sudoku
from algorithms.sudoku_hint import get_sudoku_hint


router = APIRouter()

# -------- N QUEENS MODELS --------
class BoardData(BaseModel):
    user_id: str
    room_id: str
    board: List[int]
    colors: List[List[int]]

class UserInfo(BaseModel):
    user_id: str

class TimerData(BaseModel):
    user_id: str
    puzzle_time: Optional[str] = None


# -------- SUDOKU MODELS --------
class SudokuBoard(BaseModel):
    user_id: str
    board: List[List[int]]  # 9x9 grid



# ------------------------------------------- N QUEENS GAME -------------------------------------------
# -------- BOARD GENERATION --------
@router.post("/generate")
def generate_board(data: UserInfo):
    room = game_sessions.find_one({"user_id": data.user_id})
    
    if not room:
        game_sessions.insert_one({
            "user_id": data.user_id,
            "start_time": datetime.utcnow(),
            "puzzle_start": None,
            "puzzle_end": None,
            "total_time": None
        })
    elif room.get("puzzle_end"):
        raise HTTPException(status_code=400, detail="Puzzle already completed")

    return {
        "board": [-1] * 8,
        "colors": predefined_colors[8],
        "size": 8
    }


# -------- START TIMER --------
@router.post("/start")
def start_timer(data: TimerData):
    session = game_sessions.find_one({"user_id": data.user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.get("puzzle_start"):
        return {"message": "Puzzle already started"}

    game_sessions.update_one(
        {"user_id": data.user_id},
        {"$set": {"puzzle_start": datetime.utcnow()}}
    )
    return {"message": "Puzzle started"}


# -------- END TIMER --------
@router.post("/end-timer")
def end_timer(data: TimerData):
    session = game_sessions.find_one({"user_id": data.user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    start_time = session.get("puzzle_start")
    if not start_time:
        raise HTTPException(status_code=400, detail="Puzzle not started yet")

    end_time = datetime.utcnow()
    duration = end_time - start_time

    game_sessions.update_one(
        {"user_id": data.user_id},
        {"$set": {
            "puzzle_end": end_time,
            "total_time": str(duration)
        }}
    )

    return {"message": "Puzzle completed"}


# -------- VALIDATE BOARD --------
@router.post("/validate")
def validate_board(data: BoardData):
    if -1 in data.board:
        return {"valid": False, "message": "Place all queens first."}
    
    board_tuple = tuple(data.board)
    colors_tuple = tuple(tuple(row) for row in data.colors)
    valid = is_valid_board(board_tuple, colors_tuple)

    return {"valid": valid, "message": "Valid!" if valid else "Invalid arrangement!"}


# -------- SOLVE PUZZLE --------
@router.post("/solve")
def solve_puzzle(data: BoardData):
    solution = solve_n_queens(8, data.colors)
    return {"solution": solution}


# -------- HINT GENERATION --------
@router.post("/hint")
def get_hint(data: BoardData):
    result = get_next_hint(data.board, data.colors)
    return result

# -------- DASHBOARD --------
@router.post("/dashboard")
def get_user_dashboard(data: UserInfo):
    session = game_sessions.find_one({"user_id": data.user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "start": session.get("puzzle_start"),
        "end": session.get("puzzle_end"),
        "total_time": session.get("total_time")
    }


# -------- LEADERBOARD --------
@router.get("/leaderboard")
def leaderboard():
    players = list(game_sessions.find({"total_time": {"$ne": None}}))
    players.sort(key=lambda x: x["total_time"])  # Still a string—ideally store as timedelta

    return [
        {
            "user_id": p["user_id"],
            "total_time": p["total_time"],
            "start": p.get("puzzle_start"),
            "end": p.get("puzzle_end")
        }
        for p in players
    ]


# ------------------------------------------- SUDOKU GAME -------------------------------------------
# -------- SUDOKU GENERATION --------
@router.post("/sudoku/generate")
def generate_sudoku(data: UserInfo):
    session = game_sessions.find_one({"user_id": data.user_id})
    
    if not session:
        game_sessions.insert_one({
            "user_id": data.user_id,
            "start_time": datetime.utcnow(),
            "puzzle_start": None,
            "puzzle_end": None,
            "total_time": None,
            "sudoku_start": None,
            "sudoku_end": None,
            "sudoku_time": None
        })
    elif session.get("sudoku_end"):
        raise HTTPException(status_code=400, detail="Sudoku already completed")

    puzzle, solution = generate_sudoku_puzzle()
    
    game_sessions.update_one(
        {"user_id": data.user_id},
        {"$set": {"sudoku_solution": solution}}
    )

    return {
        "board": puzzle
    }



# -------- SUDOKU START TIMER --------
@router.post("/sudoku/start")
def start_sudoku_timer(data: TimerData):
    session = game_sessions.find_one({"user_id": data.user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.get("sudoku_start"):
        return {"message": "Sudoku already started"}

    game_sessions.update_one(
        {"user_id": data.user_id},
        {"$set": {"sudoku_start": datetime.utcnow()}}
    )
    return {"message": "Sudoku timer started"}


# -------- SUDOKU END TIMER --------
@router.post("/sudoku/end-timer")
def end_sudoku_timer(data: TimerData):
    session = game_sessions.find_one({"user_id": data.user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    start_time = session.get("sudoku_start")
    if not start_time:
        raise HTTPException(status_code=400, detail="Sudoku not started yet")

    end_time = datetime.utcnow()
    duration = end_time - start_time

    game_sessions.update_one(
        {"user_id": data.user_id},
        {"$set": {
            "sudoku_end": end_time,
            "sudoku_time": str(duration)
        }}
    )

    return {"message": "Sudoku completed"}


# -------- SUDOKU VALIDATION --------
@router.post("/sudoku/validate")
def validate_sudoku(data: SudokuBoard):
    is_valid = is_valid_sudoku(data.board)
    return {
        "valid": is_valid,
        "message": "Valid Sudoku!" if is_valid else "Invalid Sudoku!"
    }


# -------- SUDOKU HINT --------
@router.post("/sudoku/hint")
def sudoku_hint(data: SudokuBoard):
    hint = get_sudoku_hint(data.board)
    return {"hint": hint}
