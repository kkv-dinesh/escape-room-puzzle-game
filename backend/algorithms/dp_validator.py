from functools import lru_cache

@lru_cache(maxsize=None)
def is_valid_board(board, colors):
    n = len(board)
    col_mask = 0
    diag1_mask = 0
    diag2_mask = 0
    color_queen = {}

    for row in range(n):
        col = board[row]
        if col == -1:
            continue

        print(f"Row {row}, Col {col}, Color {colors[row][col]}")
        
        if (col_mask >> col) & 1:
            print(f"❌ Column conflict at {col}")
            return False

        d1 = row - col + n - 1
        d2 = row + col
        if (diag1_mask >> d1) & 1:
            print(f"❌ Diagonal1 conflict at row {row}, col {col}")
            return False
        if (diag2_mask >> d2) & 1:
            print(f"❌ Diagonal2 conflict at row {row}, col {col}")
            return False

        color = colors[row][col]
        if color in color_queen:
            print(f"❌ Color conflict for color {color} at row {row}")
            return False

        col_mask |= (1 << col)
        diag1_mask |= (1 << d1)
        diag2_mask |= (1 << d2)
        color_queen[color] = True

    print("✅ Board is valid!")
    return True
