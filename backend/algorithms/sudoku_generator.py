import random
import copy

def generate_full_board():
    board = [[0] * 9 for _ in range(9)]

    def is_valid(num, row, col):
        for i in range(9):
            if board[row][i] == num or board[i][col] == num:
                return False
        start_row, start_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(3):
            for j in range(3):
                if board[start_row + i][start_col + j] == num:
                    return False
        return True

    def fill():
        for row in range(9):
            for col in range(9):
                if board[row][col] == 0:
                    random.shuffle(nums)
                    for num in nums:
                        if is_valid(num, row, col):
                            board[row][col] = num
                            if fill():
                                return True
                            board[row][col] = 0
                    return False
        return True

    nums = list(range(1, 10))
    fill()
    return board

def remove_numbers(board, difficulty=40):
    puzzle = copy.deepcopy(board)
    attempts = difficulty
    while attempts > 0:
        row, col = random.randint(0, 8), random.randint(0, 8)
        while puzzle[row][col] == 0:
            row, col = random.randint(0, 8), random.randint(0, 8)
        puzzle[row][col] = 0
        attempts -= 1
    return puzzle

def generate_sudoku_puzzle():
    full = generate_full_board()
    puzzle = remove_numbers(full)
    return puzzle, full
