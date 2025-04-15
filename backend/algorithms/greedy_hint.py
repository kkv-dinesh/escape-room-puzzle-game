def get_next_hint(board, colors, room_id=None):
    n = 8
    if len(board) != n:
        return {"hint": None, "invalid": []}

    used_colors = set()
    invalid_indices = []

    for row in range(n):
        col = board[row]
        if col == -1:
            continue

        color = colors[row][col]
        if color in used_colors or not is_safe(board, row, col):
            print(f"Invalid at row {row}: color={color}, col={col}, board={board}")
            invalid_indices.append(row)
        else:
            used_colors.add(color)

    if invalid_indices:
        return {"hint": None, "invalid": invalid_indices}

    row = next((r for r in range(n) if board[r] == -1), None)
    if row is None:
        return {"hint": None, "invalid": []}  # board is full

    for col in range(n):
        current_color = colors[row][col]
        if current_color in used_colors:
            continue
        if not is_safe(board, row, col):
            continue

        trial_board = board[:]
        trial_board[row] = col
        print(f"Trying hint at row={row}, col={col}, used_colors={used_colors}")
        if can_solve_from(trial_board, colors, row + 1, used_colors | {current_color}):
            return {"hint": (row, col), "invalid": []}

    return {"hint": None, "invalid": []}

def can_solve_from(board, colors, row, used_colors):
    n = 8
    if row == n:
        return True

    if board[row] != -1:
        return can_solve_from(board, colors, row + 1, used_colors)

    for col in range(n):
        current_color = colors[row][col]
        if current_color in used_colors:
            continue
        if is_safe(board, row, col):
            board[row] = col
            print(f"can_solve_from: placing at row={row}, col={col}, used_colors={used_colors}")
            if can_solve_from(board, colors, row + 1, used_colors | {current_color}):
                board[row] = -1
                return True
            board[row] = -1
    return False


def is_safe(board, row, col):
    for r in range(row):
        c = board[r]
        if c == -1:
            continue
        if c == col or abs(row - r) == abs(col - c):
            return False
    return True
