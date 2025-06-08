// Define types (using JSDoc for type hinting)
/**
 * @typedef {'red' | 'black'} Player
 */

/**
 * @typedef {{row: number, col: number}} Coordinate
 */

/**
 * @typedef {'man' | 'king'} PieceType
 */

// Refactored Piece class
class Piece {
  /**
   * @param {Player} player
   * @param {PieceType} type
   * @param {Coordinate} position
   */
  constructor(player, type, position) {
    this.player = player;
    this.type = type;
    this.position = position;
  }

  /**
   * @param {Coordinate} newPosition
   */
  move(newPosition) {
    this.position = newPosition;
  }

  promote() {
    this.type = 'king';
  }
}

// Refactored Board class will go here
class Board {
    /**
     * @param {number} size
     */
    constructor(size = 8) {
        this.size = size;
        this.board = Array(size)
            .fill(null)
            .map(() => Array(size).fill(null));
    }

    initializeBoard() {
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

    /**
     * @param {Coordinate} position
     * @returns {Piece | null}
     */
    getPieceAt(position) {
        if (this.isValidCoordinate(position)) {
            return this.board[position.row][position.col];
        }
        return null;
    }

    /**
     * @param {Coordinate} position
     * @param {Piece | null} piece
     */
    setPieceAt(position, piece) {
        if (this.isValidCoordinate(position)) {
            this.board[position.row][position.col] = piece;
        }
    }

    /**
     * @param {Coordinate} position
     * @returns {boolean}
     */
    isValidCoordinate(position) {
        return (
            position.row >= 0 &&
            position.row < this.size &&
            position.col >= 0 &&
            position.col < this.size
        );
    }

    /**
     * @param {Coordinate} start
     * @param {Coordinate} end
     * @returns {boolean}
     */
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

    /**
     * @param {Coordinate} position
     */
    removePiece(position) {
        if (this.isValidCoordinate(position)) {
            this.setPieceAt(position, null);
        }
    }
}


// Refactored Game class
class Game {
    constructor() {
        this.board = new Board();
        this.board.initializeBoard();
        this.currentPlayer = 'red'; // Red typically starts in checkers
        this.selectedPiece = null; // To track the selected piece for movement
        this.awaitingMultiCapture = false; // Flag to indicate if the current player must continue a capture sequence
        // this.mustCapture = false; // Flag to indicate if a capture is mandatory (future implementation)
        // this.possibleCaptures = []; // Store possible capture moves (future implementation)
        this.setupBoardUI();
        this.updatePlayerIndicator();
    }

    // Método para reiniciar o jogo
    resetGame() {
        console.log("Reiniciando o jogo...");
        this.board = new Board();
        this.board.initializeBoard();
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.awaitingMultiCapture = false;
        this.setupBoardUI();
        this.updatePlayerIndicator();
    }

    setupBoardUI() {
        const gameBoardElement = document.getElementById('gameBoard');
        if (!gameBoardElement) return;

        gameBoardElement.innerHTML = ''; // Limpar tabuleiro existente

        for (let row = 0; row < this.board.size; row++) {
            for (let col = 0; col < this.board.size; col++) {
                const squareElement = document.createElement('div');
                squareElement.classList.add('square');
                squareElement.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                squareElement.dataset.row = row;
                squareElement.dataset.col = col;

                squareElement.addEventListener('click', () => this.handleSquareClick(row, col));

                const piece = this.board.getPieceAt({ row, col });
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece', piece.player);
                    if (piece.type === 'king') {
                        pieceElement.classList.add('king');
                    }
                    // Adicionar classe 'selected' se for a peça selecionada
                    if (this.selectedPiece && this.selectedPiece.position.row === row && this.selectedPiece.position.col === col) {
                        pieceElement.classList.add('selected');
                    }
                    squareElement.appendChild(pieceElement);
                }

                gameBoardElement.appendChild(squareElement);
            }
        }
    }

    /**
     * @param {number} row
     * @param {number} col
     */
    handleSquareClick(row, col) {
        console.log(`--- handleSquareClick ---`);
        console.log(`Início: selectedPiece = ${this.selectedPiece ? `(${this.selectedPiece.position.row}, ${this.selectedPiece.position.col})` : 'null'}, currentPlayer = ${this.currentPlayer}, awaitingMultiCapture = ${this.awaitingMultiCapture}`);

        const clickedPosition = { row, col };
        const pieceAtClickedPosition = this.board.getPieceAt(clickedPosition);

        // Obter movimentos válidos para o jogador atual (respeitando captura forçada)
        const validMovesForCurrentPlayer = this.getValidMoves(this.currentPlayer);
        const hasForcedCaptures = validMovesForCurrentPlayer.some(move => move.capture);

        // Cenário 1: Nenhuma peça selecionada
        if (!this.selectedPiece) {
            // Clicou em uma peça do jogador atual
            if (pieceAtClickedPosition && pieceAtClickedPosition.player === this.currentPlayer) {
                 // Verificar se a peça clicada tem movimentos válidos (respeitando a regra de captura forçada)
                 const validMovesForClickedPiece = this.getValidMovesForPiece(pieceAtClickedPosition, clickedPosition);

                 if (hasForcedCaptures) {
                     const canClickedPieceCapture = validMovesForClickedPiece.some(move => move.capture);
                     if (canClickedPieceCapture) {
                          this.selectedPiece = pieceAtClickedPosition;
                          console.log(`Peça selecionada para captura forçada em (${row}, ${col}).`);
                          this.setupBoardUI(); // Renderizar novamente para mostrar a peça selecionada
                     } else {
                          console.log("Seleção inválida: Você deve realizar uma captura com outra peça.");
                     }
                 } else if (validMovesForClickedPiece.length > 0) {
                      // Não há capturas forçadas, permitir selecionar qualquer peça com movimentos válidos
                      this.selectedPiece = pieceAtClickedPosition;
                      console.log(`Peça selecionada em (${row}, ${col}).`);
                      this.setupBoardUI(); // Renderizar novamente para mostrar a peça selecionada
                 } else {
                      console.log("Seleção inválida: Esta peça não tem movimentos válidos.");
                 }
            } else {
                console.log("Seleção inválida: Nenhuma peça selecionada e clicou em um quadrado vazio ou peça adversária.");
            }
        }
        // Cenário 2: Uma peça já está selecionada
        else {
            // Clicou na mesma peça selecionada para deselecionar
            if (this.selectedPiece.position.row === row && this.selectedPiece.position.col === col) {
                console.log(`Deselecionando peça em (${row}, ${col}).`);
                this.selectedPiece = null;
                this.awaitingMultiCapture = false; // Garantir que o estado seja resetado ao deselecionar
                this.setupBoardUI(); // Renderizar novamente para remover o destaque
            }
            // Clicou em um quadrado diferente, tentar mover a peça selecionada
            else {
                 // Se estiver aguardando múltipla captura, só permitir cliques em destinos de captura válidos para a peça selecionada
                 if (this.awaitingMultiCapture) {
                     const validCapturesForSelected = this.getValidMovesForPiece(this.selectedPiece, this.selectedPiece.position).filter(move => move.capture);
                     const isValidCaptureDestination = validCapturesForSelected.some(move => move.end.row === row && move.end.col === col);

                     if (!isValidCaptureDestination) {
                         console.log("Movimento inválido: Você deve continuar a sequência de captura e o destino clicado não é um destino de captura válido.");
                         // Não deselecionar a peça, o jogador ainda deve fazer uma captura
                         console.log(`Fim (awaitingMultiCapture, movimento inválido): selectedPiece = (${this.selectedPiece.position.row}, ${this.selectedPiece.position.col}), awaitingMultiCapture = ${this.awaitingMultiCapture}`);
                         console.log(`--- Fim handleSquareClick ---`);
                         return; // Sair da função sem tentar mover
                     }
                 } else if (hasForcedCaptures) {
                      // Não está em sequência de captura, mas há capturas forçadas no tabuleiro
                      console.log("Movimento inválido: Você deve realizar uma captura.");
                      // Não deselecionar a peça, o jogador ainda deve fazer uma captura
                      console.log(`Fim (captura forçada, movimento inválido): selectedPiece = (${this.selectedPiece.position.row}, ${this.selectedPiece.position.col}), awaitingMultiCapture = ${this.awaitingMultiCapture}`);
                      console.log(`--- Fim handleSquareClick ---`);
                      return; // Sair da função sem tentar mover
                 }

                console.log(`Peça selecionada existe. Tentando mover de (${this.selectedPiece.position.row}, ${this.selectedPiece.position.col}) para (${clickedPosition.row}, ${clickedPosition.col})`);
                // Remover log de passagem de parâmetro
                // console.log(`Passando awaitingMultiCapture para handleMove: ${this.awaitingMultiCapture}`);
                // Tentar mover a peça selecionada para clickedPosition
                const moveResult = this.handleMove(this.selectedPiece.position, clickedPosition);

                if (moveResult.success) {
                    console.log("handleMove retornou sucesso.");
                    this.setupBoardUI(); // Renderizar o tabuleiro novamente

                    if (moveResult.capture) {
                        // Após uma captura, verificar se há mais capturas possíveis com a mesma peça na nova posição
                        const pieceAfterMove = this.board.getPieceAt(clickedPosition); // Obter a peça na nova posição
                        console.log(`Movimento de captura bem-sucedido para ${pieceAfterMove.player} em (${clickedPosition.row}, ${clickedPosition.col})`);

                        if (pieceAfterMove && this.checkForMultiCapture(pieceAfterMove, clickedPosition)) {
                            console.log("checkForMultiCapture retornou true. Captura múltipla possível.");
                            // Manter a mesma peça selecionada para múltiplas capturas
                            this.selectedPiece = pieceAfterMove;
                            this.awaitingMultiCapture = true; // Aguardando a próxima captura
                            console.log(`Após captura múltipla possível: selectedPiece = (${this.selectedPiece.position.row}, ${this.selectedPiece.position.col}), awaitingMultiCapture = ${this.awaitingMultiCapture}`);
                            // Não trocar de jogador ainda
                        } else {
                            console.log("checkForMultiCapture retornou false ou peça não encontrada. Nenhuma múltipla captura possível.");
                            // Nenhuma múltipla captura possível, trocar de jogador
                            this.selectedPiece = null;
                            this.awaitingMultiCapture = false;
                            console.log(`Após captura sem múltipla possível: selectedPiece = ${this.selectedPiece}, awaitingMultiCapture = ${this.awaitingMultiCapture}`);
                            this.switchPlayer();
                        }
                    } else {
                        console.log("Movimento simples bem-sucedido.");
                        // Movimento sem captura, trocar de jogador
                        this.selectedPiece = null;
                        this.awaitingMultiCapture = false;
                         console.log(`Após movimento simples: selectedPiece = ${this.selectedPiece}, awaitingMultiCapture = ${this.awaitingMultiCapture}`);
                        this.switchPlayer();
                    }

                    // Verificar condição de vitória após um movimento bem-sucedido
                    const winner = this.checkWin();
                    if (winner) {
                        alert(`${winner.toUpperCase()} venceu!`);
                        this.resetGame(); // Reiniciar o jogo após a vitória
                    } else {
                        // Verificar se o próximo jogador tem movimentos válidos APENAS se o turno foi trocado
                        if (!this.awaitingMultiCapture) { // Só verifica se o turno foi trocado
                             const nextPlayer = this.currentPlayer;
                             const nextPlayerValidMoves = this.getValidMoves(nextPlayer);
                             if (nextPlayerValidMoves.length === 0) {
                                 const winningPlayer = nextPlayer === 'red' ? 'black' : 'red';
                                 alert(`${winningPlayer.toUpperCase()} venceu! O jogador ${nextPlayer.toUpperCase()} não tem movimentos válidos.`);
                                 this.resetGame();
                             }
                        }
                    }

                } else {
                    console.log("handleMove retornou falha.");
                    // Movimento falhou, deselecionar a peça e remover destaque
                    // Se estava em sequência de captura, um movimento inválido encerra a sequência
                    this.selectedPiece = null;
                    this.awaitingMultiCapture = false; // Reset awaitingMultiCapture on failed move
                    console.log(`Após movimento falho: selectedPiece = ${this.selectedPiece}, awaitingMultiCapture = ${this.awaitingMultiCapture}`);
                    this.setupBoardUI(); // Renderizar novamente para limpar qualquer destaque de seleção
                }
            }
        }

        console.log(`Fim: selectedPiece = ${this.selectedPiece ? `(${this.selectedPiece.position.row}, ${this.selectedPiece.position.col})` : 'null'}, awaitingMultiCapture = ${this.awaitingMultiCapture}`);
        console.log(`--- Fim handleSquareClick ---`);
    }

    /**
     * Gets all valid moves for a given player, respecting the forced capture rule.
     * @param {Player} player - The player to check moves for.
     * @returns {{start: Coordinate, end: Coordinate, capture: boolean}[]} - An array of valid moves.
     */
    getValidMoves(player) {
        const allPossibleMoves = this.getAllPossibleMoves(player);

        // Remover a regra de captura forçada: retornar todos os movimentos possíveis
        return allPossibleMoves;
    }

    /**
     * Gets all possible moves (simple and capture) for a given player.
     * @param {Player} player - The player to check moves for.
     * @returns {{start: Coordinate, end: Coordinate, capture: boolean}[]} - An array of all possible moves.
     */
    getAllPossibleMoves(player) {
        const moves = [];
        for (let row = 0; row < this.board.size; row++) {
            for (let col = 0; col < this.board.size; col++) {
                const piece = this.board.getPieceAt({ row, col });
                if (piece && piece.player === player) {
                    moves.push(...this.getValidMovesForPiece(piece, { row, col }));
                }
            }
        }
        return moves;
    }

    /**
     * Gets all valid moves (simple and capture) for a single piece.
     * @param {Piece} piece - The piece to check moves for.
     * @param {Coordinate} position - The current position of the piece.
     * @returns {{start: Coordinate, end: Coordinate, capture: boolean}[]} - An array of valid moves for the piece.
     */
    getValidMovesForPiece(piece, position) {
        const moves = [];
        const directions = [
            { row: -1, col: -1 }, // Cima-esquerda
            { row: -1, col: 1 },  // Cima-direita
            { row: 1, col: -1 },  // Baixo-esquerda
            { row: 1, col: 1 }   // Baixo-direita
        ];

        for (const direction of directions) {
            // Verificar movimentos simples (1 casa diagonal)
            const simpleMoveEnd = { row: position.row + direction.row, col: position.col + direction.col }; // Corrigido: usar direction.row para col também
            if (this.board.isValidCoordinate(simpleMoveEnd) && this.board.getPieceAt(simpleMoveEnd) === null) {
                // Para peões, verificar direção para frente
                if (piece.type === 'man') {
                    const correctDirection = (piece.player === 'red' && direction.row > 0) || (piece.player === 'black' && direction.row < 0);
                    if (correctDirection) {
                        moves.push({ start: position, end: simpleMoveEnd, capture: false });
                    }
                } else { // Damas podem mover em qualquer direção
                    moves.push({ start: position, end: simpleMoveEnd, capture: false });
                }
            }

            // Verificar movimentos de captura (2 casas diagonal ou mais para damas)
            let jumpedPosition = { row: position.row + direction.row, col: position.col + direction.col };
            let landingPosition = { row: position.row + direction.row * 2, col: position.col + direction.col * 2 };

            if (piece.type === 'man') {
                 // Para peões, verificar captura a 2 casas de distância
                 if (this.board.isValidCoordinate(landingPosition) && this.board.getPieceAt(landingPosition) === null) {
                    const jumpedPiece = this.board.getPieceAt(jumpedPosition);
                    if (jumpedPiece && jumpedPiece.player !== piece.player) {
                         // Para peões, a primeira captura deve ser para frente, mas múltiplas podem ser para trás
                         // A lógica de se é uma múltipla captura contínua será tratada em handleMove/handleSquareClick
                         // Aqui, apenas listamos todas as *possíveis* capturas de 2 casas.
                         moves.push({ start: position, end: landingPosition, capture: true });
                    }
                 }
            } else if (piece.type === 'king') {
                // Para damas, verificar capturas a qualquer distância
                let piecesInPath = [];
                let currentCheckPos = { row: position.row + direction.row, col: position.col + direction.col };

                while(this.board.isValidCoordinate(currentCheckPos)) {
                    const pieceAtCurrent = this.board.getPieceAt(currentCheckPos);
                    if (pieceAtCurrent) {
                        piecesInPath.push(pieceAtCurrent);
                    } else if (piecesInPath.length > 0) {
                        // Encontrou um espaço vazio após uma ou mais peças
                        // Se houver exatamente uma peça adversária no caminho antes deste espaço vazio, é uma possível captura
                        const opponentPiecesInPath = piecesInPath.filter(p => p.player !== piece.player);
                        const ownPiecesInPath = piecesInPath.filter(p => p.player === piece.player);

                        if (opponentPiecesInPath.length === 1 && ownPiecesInPath.length === 0) {
                            // É uma possível captura de dama
                            moves.push({ start: position, end: currentCheckPos, capture: true });
                        }
                         // Não pode continuar verificando nesta direção após um espaço vazio depois de peças
                        break;
                    } else {
                         // Espaço vazio antes de encontrar qualquer peça, continuar verificando
                    }

                    // Mover para a próxima casa na diagonal
                    currentCheckPos.row += direction.row;
                    currentCheckPos.col += direction.col;
                }
            }
        }

        return moves;
    }

    /**
     * Basic method to handle a move
     * @param {Coordinate} start - The starting position.
     * @param {Coordinate} end - The ending position.
     * @returns {{success: boolean, capture: boolean}} - Indicates if the move was successful and if it was a capture.
     */
    handleMove(start, end) { // Remover parâmetro isContinuingCapture
        console.log(`--- Início handleMove ---`);
        console.log(`awaitingMultiCapture (estado): ${this.awaitingMultiCapture}`); // Log do estado

        const piece = this.board.getPieceAt(start);

        // Verificar se existe uma peça e se ela pertence ao jogador atual
        if (!piece || piece.player !== this.currentPlayer) {
            console.log("Movimento inválido: Nenhuma peça ou não é sua peça.");
            console.log(`--- Fim handleMove (Falha) ---`);
            return { success: false, capture: false };
        }

        // Verificar se o destino é uma casa escura (válido para movimento)
        if ((end.row + end.col) % 2 === 0) {
            console.log("Movimento inválido: Não pode mover para uma casa clara.");
            console.log(`--- Fim handleMove (Falha) ---`);
            return { success: false, capture: false };
        }

        const rowDiff = end.row - start.row;
        const colDiff = end.col - start.col;
        const rowDiffAbs = Math.abs(rowDiff);
        const colDiffAbs = Math.abs(colDiff);

        // Verificar se o movimento é diagonal
        if (rowDiffAbs !== colDiffAbs) {
            console.log("Movimento inválido: Peças só podem mover diagonalmente.");
            console.log(`--- Fim handleMove (Falha) ---`);
            return { success: false, capture: false };
        }

        // Lógica de movimento e captura para 'man' (peões) e 'king' (damas)
        if (piece.type === 'man') {
            // Verificar movimento diagonal simples
            if (rowDiffAbs === 1 && colDiffAbs === 1) {
                 // Movimento simples só é permitido se não estiver em uma sequência de captura
                if (this.awaitingMultiCapture) {
                    console.log("Movimento inválido: Você deve continuar a sequência de captura.");
                    console.log(`--- Fim handleMove (Falha) ---`);
                    return { success: false, capture: false };
                }

                // Verificar se movendo na direção correta (apenas para frente em movimentos simples)
                const correctForwardDirection = (piece.player === 'red' && rowDiff > 0) || (piece.player === 'black' && rowDiff < 0);
                if (correctForwardDirection) {
                    // Verificar se o destino está vazio
                    if (this.board.getPieceAt(end) === null) {
                        // Realizar o movimento
                        if (this.board.movePiece(start, end)) {
                            // Verificar promoção
                            if ((piece.player === 'red' && end.row === this.board.size - 1) || (piece.player === 'black' && end.row === 0)) {
                                piece.promote();
                                console.log(`Peça ${piece.player} em ${end.row}, ${end.col} promovida a dama!`);
                            }
                            console.log(`--- Fim handleMove (Sucesso - Movimento Simples) ---`);
                            // Movimento sem captura bem-sucedido
                            return { success: true, capture: false };
                        }
                    } else {
                        console.log("Movimento inválido: Destino não está vazio.");
                        console.log(`--- Fim handleMove (Falha) ---`);
                        return { success: false, capture: false };
                    }
                } else {
                    console.log("Movimento inválido: Peões só podem mover diagonalmente para frente em movimentos simples.");
                    console.log(`--- Fim handleMove (Falha) ---`);
                    return { success: false, capture: false };
                }
            }
            // Verificar movimento de captura (pulando uma peça)
            else if (rowDiffAbs === 2 && colDiffAbs === 2) {
                // Para a primeira captura, verificar direção para frente.
                // Para capturas em sequência, permitir qualquer direção diagonal.
                const correctForwardDirection = (piece.player === 'red' && rowDiff > 0) || (piece.player === 'black' && rowDiff < 0);

                console.log(`--- Debug Captura Peão - Antes da Validação de Direção ---`);
                console.log(`awaitingMultiCapture (estado neste ponto): ${this.awaitingMultiCapture}`);
                console.log(`correctForwardDirection: ${correctForwardDirection}`);
                console.log(`---------------------------------------------------------`);

                let isValidCaptureDirection = false;
                if (this.awaitingMultiCapture) { // Usar o estado diretamente
                    // Em uma captura contínua, qualquer direção diagonal é válida
                    isValidCaptureDirection = true;
                } else {
                    // Não é uma captura contínua, deve ser uma captura para frente
                    isValidCaptureDirection = correctForwardDirection;
                }

                // Remover logs de depuração anteriores
                // console.log(`--- Debug Captura Peão ---`);
                // console.log(`Start: (${start.row}, ${start.col}), End: (${end.row}, ${end.col})`);
                // console.log(`isContinuingCapture (param): ${isContinuingCapture}`); // Log do parâmetro
                // console.log(`correctForwardDirection: ${correctForwardDirection}`);
                // console.log(`isValidCaptureDirection: ${isValidCaptureDirection}`);
                // console.log(`--------------------------`);

                if (isValidCaptureDirection) {
                    const jumpedRow = start.row + rowDiff / 2;
                    const jumpedCol = start.col + colDiff / 2;
                    const jumpedPosition = { row: jumpedRow, col: jumpedCol };
                    const jumpedPiece = this.board.getPieceAt(jumpedPosition);

                    // Verificar se há uma peça adversária para pular e se o destino está vazio
                    if (jumpedPiece && jumpedPiece.player !== this.currentPlayer && this.board.getPieceAt(end) === null) {
                         console.log(`Captura válida detectada. Peça a ser capturada em: (${jumpedPosition.row}, ${jumpedPosition.col})`);
                         // Realizar o movimento e remover a peça pulada
                        if (this.board.movePiece(start, end)) {
                            console.log(`Movimento da peça realizado com sucesso para: (${end.row}, ${end.col})`);
                            this.board.removePiece(jumpedPosition);
                            console.log(`Função removePiece chamada para: (${jumpedPosition.row}, ${jumpedPosition.col})`);
                            console.log(`${this.currentPlayer} capturou uma peça em ${jumpedRow}, ${jumpedCol}`);
                             // Verificar promoção após captura
                            if ((piece.player === 'red' && end.row === this.board.size - 1) || (piece.player === 'black' && end.row === 0)) {
                                piece.promote();
                                console.log(`Peça ${piece.player} em ${end.row}, ${end.col} promovida a dama!`);
                            }
                            console.log(`--- Fim handleMove (Sucesso - Captura Peão) ---`);
                            // Movimento de captura bem-sucedido
                            return { success: true, capture: true };
                        }
                    } else {
                        console.log("Movimento inválido: Nenhuma peça adversária para capturar ou destino não está vazio.");
                        console.log(`--- Fim handleMove (Falha) ---`);
                        return { success: false, capture: false };
                    }
                } else {
                    console.log("Movimento inválido: Peões só podem capturar diagonalmente para frente no início de uma sequência.");
                    console.log(`--- Fim handleMove (Falha) ---`);
                    return { success: false, capture: false };
                }
            }
             else {
                console.log("Movimento inválido: Peões só podem mover uma casa diagonalmente ou pular duas casas diagonalmente para captura.");
                console.log(`--- Fim handleMove (Falha) ---`);
                return { success: false, capture: false };
            }
        } else if (piece.type === 'king') {
            // Lógica para damas (reis)
            // Damas podem mover e capturar a qualquer distância diagonal

            const path = this.getDiagonalPath(start, end);
            if (!path) {
                 console.log("Movimento inválido: Caminho diagonal inválido.");
                 console.log(`--- Fim handleMove (Falha) ---`);
                 return { success: false, capture: false };
            }

            const piecesInPath = path.map(pos => this.board.getPieceAt(pos)).filter(p => p !== null);

            if (piecesInPath.length === 0) {
                 // Movimento simples só é permitido se não estiver em uma sequência de captura
                if (this.awaitingMultiCapture) { // Usar o estado diretamente
                    console.log("Movimento inválido: Você deve continuar a sequência de captura.");
                    console.log(`--- Fim handleMove (Falha) ---`);
                    return { success: false, capture: false };
                }

                // Movimento simples (caminho livre)
                 if (this.board.movePiece(start, end)) {
                     console.log(`--- Fim handleMove (Sucesso - Movimento Simples Dama) ---`);
                     // Movimento sem captura bem-sucedido\n                    return { success: true, capture: false };
                 } else {
                     console.log("Movimento inválido: Destino não está vazio para movimento simples.");
                     console.log(`--- Fim handleMove (Falha) ---`);
                     return { success: false, capture: false };
                 }
            } else if (piecesInPath.length === 1) {
                // Possível captura
                const capturedPiece = piecesInPath[0];

                // Verificar se a peça no caminho é adversária e se o destino está vazio
                if (capturedPiece.player !== this.currentPlayer && this.board.getPieceAt(end) === null) {
                    // Verificar se a peça capturada está no caminho correto (entre o início e o fim)
                    const capturedPiecePosition = capturedPiece.position;
                    const isCapturedPieceInPath = path.some(pos => pos.row === capturedPiecePosition.row && pos.col === capturedPiecePosition.col);

                    if (isCapturedPieceInPath) {
                         console.log(`Captura válida detectada para Dama. Peça a ser capturada em: (${capturedPiecePosition.row}, ${capturedPiecePosition.col})`);
                         // Realizar o movimento e remover a peça pulada
                        if (this.board.movePiece(start, end)) {
                            console.log(`Movimento da dama realizado com sucesso para: (${end.row}, ${end.col})`);
                            this.board.removePiece(capturedPiecePosition);
                            console.log(`Função removePiece chamada para: (${capturedPiecePosition.row}, ${capturedPiecePosition.col})`);
                            console.log(`${this.currentPlayer} capturou uma peça em ${capturedPiecePosition.row}, ${capturedPiecePosition.col}`);
                            console.log(`--- Fim handleMove (Sucesso - Captura Dama) ---`);
                            // Movimento de captura bem-sucedido
                            return { success: true, capture: true };
                        }
                    } else {
                         console.log("Movimento inválido: Peça capturada não está no caminho diagonal.");
                         console.log(`--- Fim handleMove (Falha) ---`);
                         return { success: false, capture: false };
                    }
                } else {
                    console.log("Movimento inválido: Não há peça adversária para capturar ou destino não está vazio.");
                    console.log(`--- Fim handleMove (Falha) ---`);
                    return { success: false, capture: false };
                }
            } else {
                // Mais de uma peça no caminho, movimento inválido
                console.log("Movimento inválido: Não pode pular sobre mais de uma peça.");
                console.log(`--- Fim handleMove (Falha) ---`);
                return { success: false, capture: false };
            }
        }

        console.log(`--- Fim handleMove (Falha Geral) ---`);
        return { success: false, capture: false }; // Movimento falhou por outros motivos
    }

    /**
     * Gets the diagonal path between two coordinates.
     * @param {Coordinate} start - The starting coordinate.
     * @param {Coordinate} end - The ending coordinate.
     * @returns {Coordinate[] | null} - An array of coordinates in the path (excluding start and end), or null if not a valid diagonal path.
     */
    getDiagonalPath(start, end) {
        const rowDiff = end.row - start.row;
        const colDiff = end.col - start.col;
        const rowDiffAbs = Math.abs(rowDiff);
        const colDiffAbs = Math.abs(colDiff);

        if (rowDiffAbs !== colDiffAbs || rowDiffAbs === 0) {
            return null; // Não é um caminho diagonal válido ou é o mesmo ponto
        }

        const rowStep = rowDiff / rowDiffAbs; // 1 ou -1
        const colStep = colDiff / colDiffAbs; // 1 ou -1

        const path = [];
        // Começar do quadrado imediatamente após o início e ir até o quadrado imediatamente antes do fim
        for (let i = 1; i < rowDiffAbs; i++) {
            const pathRow = start.row + i * rowStep;
            const pathCol = start.col + i * colStep;
            path.push({ row: pathRow, col: pathCol });
        }

        return path;
    }

    /**
     * Checks if a piece at a given position has any available captures.
     * @param {Piece} piece - The piece to check.
     * @param {Coordinate} position - The current position of the piece.
     * @returns {boolean} - True if a capture is possible, false otherwise.
     */
    checkForMultiCapture(piece, position) {
        console.log(`--- Início checkForMultiCapture para ${piece.player} ${piece.type} em (${position.row}, ${position.col}) ---`);
        const directions = [
            { row: -1, col: -1 }, // Cima-esquerda
            { row: -1, col: 1 },  // Cima-direita
            { row: 1, col: -1 },  // Baixo-esquerda
            { row: 1, col: 1 }   // Baixo-direita
        ];

        for (const direction of directions) {
            let currentRow = position.row + direction.row;
            let currentCol = position.col + direction.col;

            // Para peões, verificar apenas a próxima casa diagonal para uma peça adversária e a casa seguinte vazia
            if (piece.type === 'man') {
                 const jumpRow = position.row + direction.row;
                const jumpCol = position.col + direction.col;
                const landRow = position.row + direction.row * 2;
                const landCol = position.col + direction.col * 2;

                const jumpedPosition = { row: jumpRow, col: jumpCol };
                const landingPosition = { row: landRow, col: landCol };

                console.log(`Verificando direção: (${direction.row}, ${direction.col})`);
                console.log(`Posição de salto: (${jumpedPosition.row}, ${jumpedPosition.col}), Posição de aterrissagem: (${landingPosition.row}, ${landingPosition.col})`);

                if (this.board.isValidCoordinate(landingPosition) && this.board.getPieceAt(landingPosition) === null) {
                    const jumpedPiece = this.board.getPieceAt(jumpedPosition);
                    console.log(`Posição de aterrissagem válida e vazia. Peça na posição de salto: ${jumpedPiece ? jumpedPiece.player + ' ' + jumpedPiece.type : 'null'}`);
                    if (jumpedPiece && jumpedPiece.player !== piece.player) {
                        console.log("Captura possível encontrada para peão nesta direção.");
                        console.log(`--- Fim checkForMultiCapture (Retorna true) ---`);
                        return true; // Captura possível encontrada para peão
                    }
                } else {
                     console.log("Posição de aterrissagem inválida ou não vazia nesta direção.");
                }

            } else if (piece.type === 'king') {
                 // Para damas, verificar ao longo da diagonal por uma peça adversária seguida por um espaço vazio
                 console.log(`Verificando direção (Dama): (${direction.row}, ${direction.col})`);
                 while(this.board.isValidCoordinate({ row: currentRow, col: currentCol })) {
                    const currentPosition = { row: currentRow, col: currentCol };
                    const pieceAtCurrent = this.board.getPieceAt(currentPosition);

                    if (pieceAtCurrent) {
                        if (pieceAtCurrent.player !== piece.player) {
                            // Encontrou uma peça adversária, verificar se há um quadrado vazio depois dela
                            const landingRow = currentRow + direction.row;
                            const landingCol = currentCol + direction.col;
                            const landingPosition = { row: landingRow, col: landingCol };

                            console.log(`  Encontrou peça adversária em (${currentPosition.row}, ${currentPosition.col}). Verificando aterrissagem em (${landingPosition.row}, ${landingPosition.col})`);

                            if (this.board.isValidCoordinate(landingPosition) && this.board.getPieceAt(landingPosition) === null) {
                                console.log("Captura possível encontrada para dama nesta direção.");
                                console.log(`--- Fim checkForMultiCapture (Retorna true) ---`);
                                return true; // Captura possível encontrada para dama
                            } else {
                                // Não há quadrado vazio depois da peça adversária, ou fora do tabuleiro
                                console.log("  Não há espaço vazio para aterrissar após a peça adversária.");
                                break; // Sair deste caminho diagonal
                            }
                        } else {
                            // Encontrou uma peça do mesmo jogador, não pode pular
                            console.log("  Encontrou peça do mesmo jogador. Não pode pular.");
                            break; // Sair deste caminho diagonal
                        }
                    } else {
                        // Quadrado vazio, continuar verificando ao longo da diagonal
                        console.log(`  Quadrado vazio em (${currentPosition.row}, ${currentPosition.col}). Continuar.`);
                        currentRow += direction.row;
                        currentCol += direction.col;
                    }
                }
            }
        }

        console.log(`--- Fim checkForMultiCapture (Retorna false) ---`);
        return false; // Nenhuma captura encontrada
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
        this.awaitingMultiCapture = false; // Resetar o estado de múltipla captura no início do novo turno
        console.log(`É a vez do jogador ${this.currentPlayer === 'red' ? 'Vermelho' : 'Preto'}.`);
        this.updatePlayerIndicator();
    }

    // Method to update the player indicator in the UI
    updatePlayerIndicator() {
        const playerIndicatorElement = document.getElementById('playerIndicator');
        if (playerIndicatorElement) {
            playerIndicatorElement.textContent = `Current Turn: ${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}`;
        }
    }

    checkWin() {
        // This is a placeholder. Real win condition logic is more complex.
        // A player wins when the other player has no pieces left or no valid moves.
        let redPieces = 0;
        let blackPieces = 0;
        for (let row = 0; row < this.board.size; row++) {
            for (let col = 0; col < this.board.size; col++) {
                const piece = this.board.getPieceAt({ row, col });
                if (piece) {
                    if (piece.player === 'red') {
                        redPieces++;
                    } else {
                        blackPieces++;
                    }
                }
            }
        }

        if (redPieces === 0) {
            return 'black';
        } else if (blackPieces === 0) {
            return 'red';
        }

        return null; // No winner yet
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    // game.updatePlayerIndicator(); // Já chamado dentro de resetGame
});
