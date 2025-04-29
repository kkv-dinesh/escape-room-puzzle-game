import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define the is_valid_move function
def is_valid_move(board, row, col, num):
    # Check the row and column for duplicates
    for i in range(9):
        if board[row][i] == num or board[i][col] == num:
            return False
    
    # Check the 3x3 subgrid for duplicates
    start_row, start_col = 3 * (row // 3), 3 * (col // 3)
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    
    # If no conflicts, the move is valid
    return True

# The get_sudoku_hint function with logging and valid move checks
def get_sudoku_hint(board, solution):
    # Step 1: Look for the next empty cell and suggest the correct value
    for row in range(9):
        for col in range(9):
            # Skip cells that are already filled and correct
            if board[row][col] != 0 and board[row][col] == solution[row][col]:
                continue  # This cell is already correctly filled, so skip it

            # Check if the cell is empty (value is 0) and suggest the correct value
            if board[row][col] == 0:
                correct_value = solution[row][col]
                
                # Check if the correct value is a valid move
                if is_valid_move(board, row, col, correct_value):
                    logger.info(f"Suggested hint: Try placing {correct_value} at ({row}, {col})")
                    return {
                        "hint_type": "next_move",
                        "row": row,
                        "col": col,
                        "value": correct_value,
                        "message": f"Try placing {correct_value} at ({row}, {col})"
                    }
                else:
                    logger.warning(f"Correct value {correct_value} is not valid at ({row}, {col}) — possible earlier mistake")
                    break  # Stop checking further cells, go to Step 2

    # Step 2: Look for wrongly placed cells
    for row in range(9):
        for col in range(9):
            user_val = board[row][col]
            if user_val != 0 and user_val != solution[row][col]:
                logger.warning(f"Incorrect value at ({row},{col}): user has {user_val}, expected {solution[row][col]}")
                return {
                    "hint_type": "wrong_cell",
                    "row": row,
                    "col": col,
                    "user_value": user_val,
                    "correct_value": solution[row][col],
                    "message": f"Incorrect value at ({row}, {col}): You have {user_val}, should be {solution[row][col]}"
                }

    logger.info("No hints found: the puzzle might be solved or empty.")
    return {
        "hint_type": "solved_or_empty",
        "message": "No hints available. Puzzle may be solved or empty."
    }
