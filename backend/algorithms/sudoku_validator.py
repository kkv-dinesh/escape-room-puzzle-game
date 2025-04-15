def is_valid_sudoku(board):
    def is_valid_group(group):
        nums = [n for n in group if n != 0]
        return len(nums) == len(set(nums))

    for row in board:
        if not is_valid_group(row):
            return False

    for col in zip(*board):
        if not is_valid_group(col):
            return False

    for i in range(0, 9, 3):
        for j in range(0, 9, 3):
            block = [
                board[x][y]
                for x in range(i, i + 3)
                for y in range(j, j + 3)
            ]
            if not is_valid_group(block):
                return False

    return True
