"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Board = void 0;
const piece_1 = require("./piece");
class Board {
    constructor(size = 8) {
        this.size = size;
        this.board = Array(size)
            .fill(null)
            .map(() => Array(size).fill(null));
    }
    // Initialize the board with pieces
    initializeBoard() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if ((row + col) % 2 !== 0) { // Pieces are placed on dark squares
                    if (row < 3) {
                        this.board[row][col] = new piece_1.Piece('red', 'man', { row, col });
                    }
                    else if (row > this.size - 4) {
                        this.board[row][col] = new piece_1.Piece('black', 'man', { row, col });
                    }
                }
            }
        }
    }
    // Get piece at a specific coordinate
    getPieceAt(position) {
        if (this.isValidCoordinate(position)) {
            return this.board[position.row][position.col];
        }
        return null;
    }
    // Set piece at a specific coordinate
    setPieceAt(position, piece) {
        if (this.isValidCoordinate(position)) {
            this.board[position.row][position.col] = piece;
        }
    }
    // Check if a coordinate is valid
    isValidCoordinate(position) {
        return (position.row >= 0 &&
            position.row < this.size &&
            position.col >= 0 &&
            position.col < this.size);
    }
    // Basic method to move a piece on the board
    movePiece(start, end) {
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
    removePiece(position) {
        if (this.isValidCoordinate(position)) {
            this.setPieceAt(position, null);
        }
    }
}
exports.Board = Board;
