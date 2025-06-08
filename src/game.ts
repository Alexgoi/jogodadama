import { Board } from './board';
import { Player, Coordinate } from './types';

export class Game {
  board: Board;
  currentPlayer: Player;

  constructor() {
    this.board = new Board();
    this.board.initializeBoard();
    this.currentPlayer = 'red'; // Red typically starts in checkers
  }

  // Basic method to handle a move
  handleMove(start: Coordinate, end: Coordinate): boolean {
    const piece = this.board.getPieceAt(start);

    // Check if there's a piece and it belongs to the current player
    if (!piece || piece.player !== this.currentPlayer) {
      console.log("Invalid move: No piece or not your piece.");
      return false;
    }

    // Basic move validation (needs more complex logic for checkers rules)
    // For now, just check if the destination is empty
    if (this.board.getPieceAt(end) !== null) {
        console.log("Invalid move: Destination is not empty.");
        return false;
    }

    // Perform the move
    if (this.board.movePiece(start, end)) {
      // Switch player after a successful move (needs to account for captures)
      this.switchPlayer();
      return true;
    }

    return false; // Move failed
  }

  // Switch the current player
  switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
    console.log(`It's ${this.currentPlayer}'s turn.`);
  }

  // Method to check for win condition (basic for now)
  checkWin(): Player | null {
    // This is a placeholder. Real win condition logic is more complex.
    // A player wins when the other player has no pieces left or no valid moves.
    return null;
  }

  // Method to display the board (basic console output)
  displayBoard(): void {
    console.log("Current Board:");
    for (let row = 0; row < this.board.size; row++) {
      let rowStr = "";
      for (let col = 0; col < this.board.size; col++) {
        const piece = this.board.getPieceAt({ row, col });
        if (piece) {
          rowStr += piece.player === 'red' ? (piece.type === 'man' ? 'r ' : 'R ') : (piece.type === 'man' ? 'b ' : 'B ');
        } else {
          rowStr += '. '; // Empty square
        }
      }
      console.log(rowStr);
    }
    console.log("\n");
  }
}
