// Piezas de ajedrez
const pieces = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

// Estado del juego
let board = [];
let currentPlayer = 'white';
let selectedSquare = null;
let validMoves = [];
let capturedWhite = [];
let capturedBlack = [];
let whiteKingPos = { row: 7, col: 4 };
let blackKingPos = { row: 0, col: 4 };

// Elementos DOM
const chessBoard = document.getElementById('chess-board');
const currentPlayerEl = document.getElementById('current-player');
const statusMessage = document.getElementById('status-message');
const capturedWhiteEl = document.getElementById('captured-white');
const capturedBlackEl = document.getElementById('captured-black');
const gameOverModal = document.getElementById('game-over-modal');
const winnerText = document.getElementById('winner-text');
const winnerMessage = document.getElementById('winner-message');

// Inicializar tablero
function initBoard() {
    board = [
        [
            { type: 'rook', color: 'black' },
            { type: 'knight', color: 'black' },
            { type: 'bishop', color: 'black' },
            { type: 'queen', color: 'black' },
            { type: 'king', color: 'black' },
            { type: 'bishop', color: 'black' },
            { type: 'knight', color: 'black' },
            { type: 'rook', color: 'black' }
        ],
        Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' })),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' })),
        [
            { type: 'rook', color: 'white' },
            { type: 'knight', color: 'white' },
            { type: 'bishop', color: 'white' },
            { type: 'queen', color: 'white' },
            { type: 'king', color: 'white' },
            { type: 'bishop', color: 'white' },
            { type: 'knight', color: 'white' },
            { type: 'rook', color: 'white' }
        ]
    ];
    
    currentPlayer = 'white';
    selectedSquare = null;
    validMoves = [];
    capturedWhite = [];
    capturedBlack = [];
    whiteKingPos = { row: 7, col: 4 };
    blackKingPos = { row: 0, col: 4 };
    
    renderBoard();
    updateStatus();
}

// Renderizar tablero
function renderBoard() {
    chessBoard.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            
            const piece = board[row][col];
            if (piece) {
                const pieceEl = document.createElement('span');
                pieceEl.className = 'piece';
                pieceEl.textContent = pieces[piece.color][piece.type];
                square.appendChild(pieceEl);
                square.classList.add('has-piece');
            }
            
            square.addEventListener('click', () => handleSquareClick(row, col));
            chessBoard.appendChild(square);
        }
    }
    
    updateCapturedPieces();
}

// Manejar clic en casilla
function handleSquareClick(row, col) {
    const square = board[row][col];
    
    // Si hay una pieza seleccionada
    if (selectedSquare) {
        // Verificar si es un movimiento válido
        if (validMoves.some(move => move.row === row && move.col === col)) {
            movePiece(selectedSquare.row, selectedSquare.col, row, col);
            clearSelection();
            switchPlayer();
        } else if (square && square.color === currentPlayer) {
            // Seleccionar otra pieza del mismo color
            selectSquare(row, col);
        } else {
            clearSelection();
        }
    } else {
        // Seleccionar pieza si es del jugador actual
        if (square && square.color === currentPlayer) {
            selectSquare(row, col);
        }
    }
}

// Seleccionar casilla
function selectSquare(row, col) {
    selectedSquare = { row, col };
    validMoves = getValidMoves(row, col);
    highlightSquares();
}

// Limpiar selección
function clearSelection() {
    selectedSquare = null;
    validMoves = [];
    highlightSquares();
}

// Resaltar casillas
function highlightSquares() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(sq => {
        sq.classList.remove('selected', 'valid-move', 'check');
    });
    
    if (selectedSquare) {
        const index = selectedSquare.row * 8 + selectedSquare.col;
        squares[index].classList.add('selected');
    }
    
    validMoves.forEach(move => {
        const index = move.row * 8 + move.col;
        squares[index].classList.add('valid-move');
    });
    
    // Resaltar rey en jaque
    if (isKingInCheck(currentPlayer)) {
        const kingPos = currentPlayer === 'white' ? whiteKingPos : blackKingPos;
        const index = kingPos.row * 8 + kingPos.col;
        squares[index].classList.add('check');
    }
}

// Obtener movimientos válidos
function getValidMoves(row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    
    let moves = [];
    
    switch (piece.type) {
        case 'pawn':
            moves = getPawnMoves(row, col, piece.color);
            break;
        case 'rook':
            moves = getRookMoves(row, col, piece.color);
            break;
        case 'knight':
            moves = getKnightMoves(row, col, piece.color);
            break;
        case 'bishop':
            moves = getBishopMoves(row, col, piece.color);
            break;
        case 'queen':
            moves = getQueenMoves(row, col, piece.color);
            break;
        case 'king':
            moves = getKingMoves(row, col, piece.color);
            break;
    }
    
    return moves.filter(move => !wouldBeInCheck(row, col, move.row, move.col, piece.color));
}

// Movimientos del peón
function getPawnMoves(row, col, color) {
    const moves = [];
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    
    // Mover adelante
    if (!board[row + direction]?.[col]) {
        moves.push({ row: row + direction, col });
        
        // Doble movimiento inicial
        if (row === startRow && !board[row + 2 * direction]?.[col]) {
            moves.push({ row: row + 2 * direction, col });
        }
    }
    
    // Capturar diagonal
    [-1, 1].forEach(dc => {
        const newCol = col + dc;
        if (board[row + direction]?.[newCol]?.color === (color === 'white' ? 'black' : 'white')) {
            moves.push({ row: row + direction, col: newCol });
        }
    });
    
    return moves;
}

// Movimientos de la torre
function getRookMoves(row, col, color) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    directions.forEach(([dr, dc]) => {
        let r = row + dr;
        let c = col + dc;
        
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r][c]) {
                moves.push({ row: r, col: c });
            } else {
                if (board[r][c].color !== color) {
                    moves.push({ row: r, col: c });
                }
                break;
            }
            r += dr;
            c += dc;
        }
    });
    
    return moves;
}

// Movimientos del caballo
function getKnightMoves(row, col, color) {
    const moves = [];
    const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    
    offsets.forEach(([dr, dc]) => {
        const r = row + dr;
        const c = col + dc;
        
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r][c] || board[r][c].color !== color) {
                moves.push({ row: r, col: c });
            }
        }
    });
    
    return moves;
}

// Movimientos del alfil
function getBishopMoves(row, col, color) {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    
    directions.forEach(([dr, dc]) => {
        let r = row + dr;
        let c = col + dc;
        
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r][c]) {
                moves.push({ row: r, col: c });
            } else {
                if (board[r][c].color !== color) {
                    moves.push({ row: r, col: c });
                }
                break;
            }
            r += dr;
            c += dc;
        }
    });
    
    return moves;
}

// Movimientos de la reina
function getQueenMoves(row, col, color) {
    return [...getRookMoves(row, col, color), ...getBishopMoves(row, col, color)];
}

// Movimientos del rey
function getKingMoves(row, col, color) {
    const moves = [];
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];
    
    directions.forEach(([dr, dc]) => {
        const r = row + dr;
        const c = col + dc;
        
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (!board[r][c] || board[r][c].color !== color) {
                moves.push({ row: r, col: c });
            }
        }
    });
    
    return moves;
}

// Mover pieza
function movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    const captured = board[toRow][toCol];
    
    // Capturar pieza
    if (captured) {
        if (captured.color === 'white') {
            capturedWhite.push(captured);
        } else {
            capturedBlack.push(captured);
        }
    }
    
    // Mover pieza
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;
    
    // Actualizar posición del rey
    if (piece.type === 'king') {
        if (piece.color === 'white') {
            whiteKingPos = { row: toRow, col: toCol };
        } else {
            blackKingPos = { row: toRow, col: toCol };
        }
    }
    
    renderBoard();
}

// Verificar si el rey está en jaque
function isKingInCheck(color) {
    const kingPos = color === 'white' ? whiteKingPos : blackKingPos;
    const enemyColor = color === 'white' ? 'black' : 'white';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === enemyColor) {
                const moves = getValidMovesWithoutCheckTest(row, col);
                if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Obtener movimientos sin verificar jaque (para evitar recursión)
function getValidMovesWithoutCheckTest(row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    
    switch (piece.type) {
        case 'pawn': return getPawnMoves(row, col, piece.color);
        case 'rook': return getRookMoves(row, col, piece.color);
        case 'knight': return getKnightMoves(row, col, piece.color);
        case 'bishop': return getBishopMoves(row, col, piece.color);
        case 'queen': return getQueenMoves(row, col, piece.color);
        case 'king': return getKingMoves(row, col, piece.color);
        default: return [];
    }
}

// Verificar si el movimiento pondría al rey en jaque
function wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
    // Simular movimiento
    const piece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];
    const oldKingPos = color === 'white' ? { ...whiteKingPos } : { ...blackKingPos };
    
    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;
    
    if (piece.type === 'king') {
        if (color === 'white') {
            whiteKingPos = { row: toRow, col: toCol };
        } else {
            blackKingPos = { row: toRow, col: toCol };
        }
    }
    
    const inCheck = isKingInCheck(color);
    
    // Deshacer movimiento
    board[fromRow][fromCol] = piece;
    board[toRow][toCol] = capturedPiece;
    
    if (piece.type === 'king') {
        if (color === 'white') {
            whiteKingPos = oldKingPos;
        } else {
            blackKingPos = oldKingPos;
        }
    }
    
    return inCheck;
}

// Verificar jaque mate
function isCheckmate(color) {
    if (!isKingInCheck(color)) return false;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === color) {
                const moves = getValidMoves(row, col);
                if (moves.length > 0) return false;
            }
        }
    }
    
    return true;
}

// Cambiar jugador
function switchPlayer() {
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updateStatus();
    
    if (isCheckmate(currentPlayer)) {
        endGame(currentPlayer === 'white' ? 'black' : 'white');
    }
}

// Actualizar estado
function updateStatus() {
    currentPlayerEl.textContent = currentPlayer === 'white' ? 'Blancas' : 'Negras';
    currentPlayerEl.className = currentPlayer === 'white' ? 'white-turn' : 'black-turn';
    
    if (isKingInCheck(currentPlayer)) {
        statusMessage.textContent = '¡Jaque! El rey está en peligro';
        statusMessage.style.color = '#e74c3c';
        statusMessage.style.fontWeight = 'bold';
    } else {
        statusMessage.textContent = `Turno de las ${currentPlayer === 'white' ? 'blancas' : 'negras'}`;
        statusMessage.style.color = '#333';
        statusMessage.style.fontWeight = '500';
    }
}

// Actualizar piezas capturadas
function updateCapturedPieces() {
    capturedBlackEl.innerHTML = capturedBlack.map(p => pieces.black[p.type]).join(' ');
    capturedWhiteEl.innerHTML = capturedWhite.map(p => pieces.white[p.type]).join(' ');
}

// Terminar juego
function endGame(winner) {
    winnerText.textContent = '¡Jaque Mate!';
    winnerMessage.textContent = `¡Las ${winner === 'white' ? 'blancas' : 'negras'} ganan!`;
    gameOverModal.classList.remove('hidden');
}

// Event listeners
document.getElementById('restart-btn').addEventListener('click', initGame);
document.getElementById('new-game-btn').addEventListener('click', () => {
    gameOverModal.classList.add('hidden');
    initGame();
});

// Iniciar juego
initGame();