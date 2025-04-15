def get_sudoku_hint(current_board):
    # We'll use a very simple hint system here:
    # Find the first empty cell and return the correct value using a solver.

    from .sudoku_generator import generate_full_board
    import copy

    # First, try to solve it using backtracking
    def solve(board):
        for row in range(9):
            for col in range(9):
                if board[row][col] == 0:
                    for num in range(1, 10):
                        if is_valid(num, row, col, board):
                            board[row][col] = num
                            if solve(board):
                                return True
                            board[row][col] = 0
                    return False
        return True

    def is_valid(num, row, col, board):
        for i in range(9):
            if board[row][i] == num or board[i][col] == num:
                return False
        sr, sc = 3 * (row // 3), 3 * (col // 3)
        for i in range(3):
            for j in range(3):
                if board[sr + i][sc + j] == num:
                    return False
        return True

    board_copy = copy.deepcopy(current_board)
    if solve(board_copy):
        for i in range(9):
            for j in range(9):
                if current_board[i][j] == 0:
                    return {"row": i, "col": j, "value": board_copy[i][j]}
    return {"message": "No hints available"}
