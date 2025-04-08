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

router = APIRouter()

# Models
class BoardData(BaseModel):
    user_id: str
    room_id: str
    board: List[int]
    colors: List[List[int]]

class UserInfo(BaseModel):
    user_id: str

class PuzzleCompletion(BaseModel):
    user_id: str
    puzzle_number: int

class TimerData(BaseModel):
    user_id: str
    size: int  # 5, 7, or 9
    puzzle_time: Optional[str] = None 

# Size -> puzzle number mapping
SIZE_MAP = {5: 1, 7: 2, 9: 3}


# -------- BOARD GENERATION --------
@router.post("/generate")
def generate_board(data: UserInfo):
    room = game_sessions.find_one({"user_id": data.user_id})
    
    if not room:
        game_sessions.insert_one({
            "user_id": data.user_id,
            "start_time": datetime.utcnow(),
            "current_puzzle": 1,
            "puzzle1_start": None, "puzzle1_end": None,
            "puzzle2_start": None, "puzzle2_end": None,
            "puzzle3_start": None, "puzzle3_end": None,
            "total_time": None
        })
        puzzle_number = 1
    else:
        puzzle_number = room.get("current_puzzle", 1)
        if puzzle_number > 3:
            raise HTTPException(status_code=400, detail="All puzzles already completed")

    n = {1: 5, 2: 7, 3: 9}[puzzle_number]

    return {
        "board": [-1] * n,
        "colors": predefined_colors[n],
        "size": n
    }


# -------- START TIMER --------
@router.post("/start")
def start_timer(data: TimerData):
    puzzle_number = SIZE_MAP.get(data.size)
    if not puzzle_number:
        raise HTTPException(status_code=400, detail="Invalid board size")

    session = game_sessions.find_one({"user_id": data.user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    field = f"puzzle{puzzle_number}_start"
    if session.get(field):
        return {"message": "Puzzle already started"}

    game_sessions.update_one(
        {"user_id": data.user_id},
        {"$set": {field: datetime.utcnow()}}
    )
    return {"message": f"Puzzle {puzzle_number} started"}


# -------- END TIMER & COMPLETE PUZZLE --------
@router.post("/end-timer")
def end_timer(data: TimerData):
    puzzle_number = SIZE_MAP.get(data.size)
    if not puzzle_number:
        raise HTTPException(status_code=400, detail="Invalid board size")

    session = game_sessions.find_one({"user_id": data.user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    start_field = f"puzzle{puzzle_number}_start"
    end_field = f"puzzle{puzzle_number}_end"
    time_field = f"puzzle{puzzle_number}_time"

    start_time = session.get(start_field)
    if not start_time:
        raise HTTPException(status_code=400, detail="Puzzle not started yet")

    end_time = datetime.utcnow()

    # Calculate duration and store it as a string
    duration = end_time - start_time

    game_sessions.update_one(
        {"user_id": data.user_id},
        {"$set": {
            end_field: end_time,
            time_field: str(duration)
        }}
    )

    # Final total time if last puzzle
    if puzzle_number == 3:
        p1_start = session.get("puzzle1_start")
        if p1_start:
            total_duration = end_time - p1_start
            game_sessions.update_one(
                {"user_id": data.user_id},
                {"$set": {"total_time": str(total_duration)}}
            )
    
    # After updating puzzleX_end and puzzleX_time
    if puzzle_number < 3:
        game_sessions.update_one(
            {"user_id": data.user_id},
            {"$set": {"current_puzzle": puzzle_number + 1}}
        )


    return {"message": f"Puzzle {puzzle_number} ended"}

# -------- VALIDATE PUZZLE --------
@router.post("/validate")
def validate_board(data: BoardData):
    if -1 in data.board:
        return {"valid": False, "message": "Place all queens first."}
    
    board_tuple = tuple(data.board)
    colors_tuple = tuple(tuple(row) for row in data.colors)  # make hashable

    valid = is_valid_board(board_tuple, colors_tuple)
    return {"valid": valid, "message": "Valid!" if valid else "Invalid arrangement!"}


# -------- SOLVE PUZZLE --------
@router.post("/solve")
def solve_puzzle(data: BoardData):
    solution = solve_n_queens(len(data.board), data.colors)
    return {"solution": solution}


# -------- HINT GENERATION --------
@router.post("/hint")
def get_hint(data: BoardData):
    print("Board:", data.board)
    print("Colors:", data.colors)
    hint = get_next_hint(data.board, data.colors, data.room_id)
    return {"hint": hint}  # Already a list or None


# -------- DASHBOARD VIEW --------
@router.post("/dashboard")
def get_user_dashboard(data: UserInfo):
    session = game_sessions.find_one({"user_id": data.user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "puzzle1": {
            "start": session.get("puzzle1_start"),
            "end": session.get("puzzle1_end")
        },
        "puzzle2": {
            "start": session.get("puzzle2_start"),
            "end": session.get("puzzle2_end")
        },
        "puzzle3": {
            "start": session.get("puzzle3_start"),
            "end": session.get("puzzle3_end")
        },
        "total_time": session.get("total_time")
    }


# -------- GLOBAL LEADERBOARD --------
@router.get("/leaderboard")
def leaderboard():
    players = list(game_sessions.find({"total_time": {"$ne": None}}))
    players.sort(key=lambda x: x["total_time"])  # total_time is a string, so ideally store as timedelta

    return [
        {
            "user_id": p["user_id"],
            "total_time": p["total_time"],
            "puzzle1": {"start": p.get("puzzle1_start"), "end": p.get("puzzle1_end")},
            "puzzle2": {"start": p.get("puzzle2_start"), "end": p.get("puzzle2_end")},
            "puzzle3": {"start": p.get("puzzle3_start"), "end": p.get("puzzle3_end")}
        }
        for p in players
    ]
