import { Piece } from './piece';
import { Coordinate, Player } from './types';

export class Board {
  board: (Piece | null)[][];
  size: number;

  constructor(size: number = 8) {
    this.size = size;
    this.board = Array(size)
      .fill(null)
      .map(() => Array(size).fill(null));
  }

  // Initialize the board with pieces
  initializeBoard(): void {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if ((row + col) % 2 !== 0) { // Pieces are placed on dark squares
          if (row < 3) {
            this.board[row][col] = new Piece('red', 'man', { row, col });
          } else if (row > this.size - 4) {
            this.board[row][col] = new Piece('black', 'man', { row, col });
          }
        }
      }
    }
  }

  // Get piece at a specific coordinate
  getPieceAt(position: Coordinate): Piece | null {
    if (this.isValidCoordinate(position)) {
      return this.board[position.row][position.col];
    }
    return null;
  }

  // Set piece at a specific coordinate
  setPieceAt(position: Coordinate, piece: Piece | null): void {
    if (this.isValidCoordinate(position)) {
      this.board[position.row][position.col] = piece;
    }
  }

  // Check if a coordinate is valid
  isValidCoordinate(position: Coordinate): boolean {
    return (
      position.row >= 0 &&
      position.row < this.size &&
      position.col >= 0 &&
      position.col < this.size
    );
  }

  // Basic method to move a piece on the board
  movePiece(start: Coordinate, end: Coordinate): boolean {
    const pieceToMove = this.getPieceAt(start);
    if (pieceToMove && this.isValidCoordinate(end)) {
      this.setPieceAt(end, pieceToMove);
      this.setPieceAt(start, null);
      pieceToMove.move(end);
      return true;
    }
    return false;
  }

  // Method to remove a piece from the board (for captures)
  removePiece(position: Coordinate): void {
    if (this.isValidCoordinate(position)) {
      this.setPieceAt(position, null);
    }
  }
}
