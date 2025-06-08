"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("./game");
// Create a new game instance
const game = new game_1.Game();
console.log("Starting game application...");
// Display the initial board
game.displayBoard();
// Example of a basic move (from row 5, col 0 to row 4, col 1)
// This is just an example and doesn't follow actual game rules yet.
console.log("Attempting to move piece from (5, 0) to (4, 1)");
const moveSuccessful = game.handleMove({ row: 5, col: 0 }, { row: 4, col: 1 });
if (moveSuccessful) {
    console.log("Move successful!");
    game.displayBoard(); // Display the board after the move
}
else {
    console.log("Move failed.");
}
// You can add more game loop logic or user input handling here later.
