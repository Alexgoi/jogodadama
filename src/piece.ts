import { Player, PieceType, Coordinate } from './types';

export class Piece {
  constructor(
    public player: Player,
    public type: PieceType,
    public position: Coordinate
  ) {}

  // Method to move the piece (basic for now)
  move(newPosition: Coordinate): void {
    this.position = newPosition;
  }

  // Method to upgrade piece to a king
  promote(): void {
    this.type = 'king';
  }
}
