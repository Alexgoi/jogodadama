"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Piece = void 0;
class Piece {
    constructor(player, type, position) {
        this.player = player;
        this.type = type;
        this.position = position;
    }
    // Method to move the piece (basic for now)
    move(newPosition) {
        this.position = newPosition;
    }
    // Method to upgrade piece to a king
    promote() {
        this.type = 'king';
    }
}
exports.Piece = Piece;
