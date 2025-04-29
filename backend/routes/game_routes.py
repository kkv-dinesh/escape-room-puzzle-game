from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from datetime import datetime, timedelta
from colors import predefined_colors
from algorithms.backtracking_solver import solve_n_queens
from algorithms.dp_validator import is_valid_board
from algorithms.greedy_hint import get_next_hint
from database import game_sessions, users_collection
from models import GameState
from algorithms.sudoku_generator import generate_sudoku_puzzle
from algorithms.sudoku_validator import is_valid_sudoku
from algorithms.sudoku_hint import get_sudoku_hint
from routes.auth_routes import get_current_user
from helper import calculate_duration


# ✅ Enforce JWT Auth Globally
router = APIRouter(dependencies=[Depends(get_current_user)])


# -------- MODELS --------
class BoardData(BaseModel):
    room_id: str
    board: List[int]
    colors: List[List[int]]

class TimerData(BaseModel):
    puzzle_time: Optional[str] = None

class SudokuBoard(BaseModel):
    board: List[List[int]]  # 9x9 grid

# ------------------------------------------- N QUEENS -------------------------------------------
@router.post("/generate")
def generate_board(user_id: str = Depends(get_current_user)):
    room = game_sessions.find_one({"user_id": user_id})
    
    if not room:
        game_sessions.insert_one(GameState(user_id=user_id).dict())
    elif room.get("puzzle1_end_time"):
        raise HTTPException(status_code=400, detail="N-Queens already completed")

    return {
        "board": [-1] * 8,
        "colors": predefined_colors[8],
        "size": 8
    }

@router.post("/start")
def start_timer(user_id: str = Depends(get_current_user)):
    session = game_sessions.find_one({"user_id": user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.get("puzzle1_start_time"):
        return {"message": "N-Queens already started"}

    game_sessions.update_one(
        {"user_id": user_id},
        {"$set": {"puzzle1_start_time": datetime.utcnow()}}
    )
    return {"message": "N-Queens timer started"}

@router.post("/end-timer")
def end_timer(user_id: str = Depends(get_current_user)):
    session = game_sessions.find_one({"user_id": user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    start_time = session.get("puzzle1_start_time")
    if not start_time:
        raise HTTPException(status_code=400, detail="Puzzle not started yet")

    end_time = datetime.utcnow()
    duration = end_time - start_time

    game_sessions.update_one(
        {"user_id": user_id},
        {"$set": {
            "puzzle1_end_time": end_time,
            "total_time": str(duration)
        }}
    )

    return {"message": "N-Queens completed"}

@router.post("/validate")
def validate_board(data: BoardData):
    if -1 in data.board:
        return {"valid": False, "message": "Place all queens first."}
    
    board_tuple = tuple(data.board)
    colors_tuple = tuple(tuple(row) for row in data.colors)
    valid = is_valid_board(board_tuple, colors_tuple)

    return {"valid": valid, "message": "Valid!" if valid else "Invalid arrangement!"}

@router.post("/solve")
def solve_puzzle(data: BoardData):
    solution = solve_n_queens(8, data.colors)
    return {"solution": solution}

@router.post("/hint")
def get_hint(data: BoardData):
    result = get_next_hint(data.board, data.colors)
    return result

# ------------------------------------------- SUDOKU -------------------------------------------
@router.post("/sudoku/generate")
def generate_sudoku(user_id: str = Depends(get_current_user)):
    session = game_sessions.find_one({"user_id": user_id})
    
    if not session:
        game_sessions.insert_one(GameState(user_id=user_id).dict())
    elif session.get("puzzle2_end_time"):
        raise HTTPException(status_code=400, detail="Sudoku already completed")

    puzzle, solution = generate_sudoku_puzzle()

    game_sessions.update_one(
        {"user_id": user_id},
        {"$set": {
            "sudoku_board": puzzle,  
            "sudoku_solution": solution
        }}
    )

    return {"board": puzzle}

@router.post("/sudoku/start")
def start_sudoku_timer(user_id: str = Depends(get_current_user)):
    session = game_sessions.find_one({"user_id": user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.get("puzzle2_start_time"):
        return {"message": "Sudoku already started"}

    game_sessions.update_one(
        {"user_id": user_id},
        {"$set": {"puzzle2_start_time": datetime.utcnow()}}
    )
    return {"message": "Sudoku timer started"}

@router.post("/sudoku/end-timer")
def end_sudoku_timer(user_id: str = Depends(get_current_user)):
    session = game_sessions.find_one({"user_id": user_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    start_time = session.get("puzzle2_start_time")
    if not start_time:
        raise HTTPException(status_code=400, detail="Sudoku not started yet")

    end_time = datetime.utcnow()
    duration = end_time - start_time

    game_sessions.update_one(
        {"user_id": user_id},
        {"$set": {
            "puzzle2_end_time": end_time,
            "total_time": str(duration)
        }}
    )

    return {"message": "Sudoku completed"}

@router.post("/sudoku/validate")
def validate_sudoku(data: SudokuBoard):
    is_valid = is_valid_sudoku(data.board)
    return {
        "valid": is_valid,
        "message": "Valid Sudoku!" if is_valid else "Invalid Sudoku!"
    }

@router.post("/sudoku/hint")
async def get_sudoku_hint_route(
    request: Request,
    user_id: str = Depends(get_current_user)
):
    data = await request.json()
    board = data.get("board")

    if not board:
        raise HTTPException(status_code=400, detail="Missing board in request")

    session = game_sessions.find_one({"user_id": user_id})
    if not session or not session.get("sudoku_solution"):
        raise HTTPException(status_code=404, detail="No active Sudoku game found")

    solution = session["sudoku_solution"]

    print("Generating Sudoku hint...")
    hint = get_sudoku_hint(board, solution)
    print("Returning hint:", hint)

    return hint

# ------------------------------------------- USER DATA -------------------------------------------
@router.post("/dashboard")
def get_all_user_dashboards(current_user_email: str = Depends(get_current_user)):
    # Fetch users and game sessions from database and convert to hash tables
    users = {user["email"]: user for user in users_collection.find()}
    sessions = {session["user_id"]: session for session in game_sessions.find()}

    # Prepare the list of dashboards (hash tables for fast lookup)
    dashboards = []

    # Iterate over the users to build the dashboards
    for user_email, user in users.items():
        session = sessions.get(user_email)

        if not session:
            # Skip if no session exists for the user
            continue

        # Retrieve the total time and check if it's valid
        total_time = session.get("total_time")

        if total_time is None:
            # Skip the user if total_time is None
            continue

        # Convert total_time to seconds if it's a string
        if isinstance(total_time, str):
            try:
                # Parse the string into a timedelta object
                hours, minutes, seconds = total_time.split(":")
                seconds, microseconds = seconds.split(".")
                total_time = timedelta(
                    hours=int(hours),
                    minutes=int(minutes),
                    seconds=int(seconds),
                    microseconds=int(microseconds)
                )
            except ValueError:
                # If the format is incorrect, skip this user
                continue
        
        # Convert timedelta to total seconds
        total_seconds = total_time.total_seconds()

        # Construct the dashboard for the current user
        dashboard = {
            "username": user.get("username"),
            "rank": "Rank",  # Placeholder for rank (this can be calculated later if needed)
            "n_queens": {
                "duration": calculate_duration(session.get("puzzle1_start_time"), session.get("puzzle1_end_time"))
            },
            "sudoku": {
                "duration": calculate_duration(session.get("puzzle2_start_time"), session.get("puzzle2_end_time"))
            },
            "total_time": total_seconds,  # Send total time as seconds
        }

        dashboards.append(dashboard)

    # Sort the dashboards based on the total_time (timedelta will work naturally for sorting)
    dashboards.sort(key=lambda x: x["total_time"])

    # Return the list of all user dashboards
    return dashboards
