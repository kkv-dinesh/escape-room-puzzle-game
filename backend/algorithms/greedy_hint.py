def get_next_hint(board, colors, room_id):
    board_sizes = {"room1": 5, "room2": 7, "room3": 9}
    n = board_sizes.get(room_id, None)
    if n is None or len(board) != n:
        return None

    row = next((r for r in range(n) if board[r] == -1), None)
    if row is None:
        return None  # Board is full

    used_colors = {colors[r][c] for r, c in enumerate(board) if c != -1}

    for col in range(n):
        current_color = colors[row][col]
        if current_color in used_colors:
            continue
        if not is_safe(board, row, col):
            continue

        trial_board = board[:]
        trial_board[row] = col
        if can_solve_from(trial_board, colors, row + 1, used_colors | {current_color}):
            return (row, col)

    return None


def can_solve_from(board, colors, row, used_colors):
    n = len(board)
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
            if can_solve_from(board, colors, row + 1, used_colors | {current_color}):
                board[row] = -1
                return True
            board[row] = -1
    return False


def is_safe(board, row, col):
    for r in range(len(board)):
        c = board[r]
        if c == -1:
            continue
        if c == col or abs(row - r) == abs(col - c):
            return False
    return True
