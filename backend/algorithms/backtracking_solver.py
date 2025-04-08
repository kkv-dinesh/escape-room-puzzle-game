def solve_n_queens(n, colors):
    result = []
    board = [-1] * n

    def is_safe(row, col):
        for r in range(row):
            if board[r] == col or \
               abs(board[r] - col) == abs(r - row) or \
               colors[r][board[r]] == colors[row][col]:
                return False
        return True

    def solve(row):
        if row == n:
            result.append(board[:])
            return
        for col in range(n):
            if is_safe(row, col):
                board[row] = col
                solve(row + 1)
                board[row] = -1

    solve(0)
    return result[0] if result else None
