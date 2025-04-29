def get_next_hint(board, colors):
    n = len(board)
    
    def is_safe(board, row, col):
        for r in range(row):
            c = board[r]
            if c == col or abs(row - r) == abs(col - c):
                return False
        return True

    def is_color_safe(used_colors, row, col):
        color = colors[row][col]
        if color in used_colors:
            return False
        return True

    def is_valid_board(board, colors):
        used_colors = set()
        invalid_rows = []
        
        for row in range(n):
            col = board[row]
            if col != -1:
                if not is_safe(board, row, col):
                    invalid_rows.append(row)
                color = colors[row][col]
                if color in used_colors:
                    invalid_rows.append(row)
                used_colors.add(color)

        return invalid_rows

    def backtrack(row, used_colors):
        if row == n:
            return True
        
        for col in range(n):
            if is_safe(board, row, col) and is_color_safe(used_colors, row, col):
                board[row] = col
                color = colors[row][col]
                used_colors.add(color)

                if backtrack(row + 1, used_colors):
                    return True

                board[row] = -1
                used_colors.remove(color)
        
        return False

    used_colors = set()
    next_row = next((r for r in range(n) if board[r] == -1), None)
    
    if next_row is None:
        print("All queens are placed. No further hints available.")
        return {"hint": None, "invalid": []}

    if backtrack(0, used_colors):
        print("Board is valid!")
        invalid_rows = is_valid_board(board, colors)
        
        if invalid_rows:
            print(f"Invalid queens found at rows: {invalid_rows}")
            return {"hint": None, "invalid": invalid_rows}
        
        return {"hint": (next_row, board[next_row]), "invalid": []}
    else:
        print("No valid placement found.")
        return {"hint": None, "invalid": []}
