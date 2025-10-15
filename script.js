document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('chessboard');
    const playerTurnElement = document.getElementById('player-turn');
    const whiteCapturedElement = document.getElementById('white-captured');
    const blackCapturedElement = document.getElementById('black-captured');

    let board = [];
    let selectedPiece = null;
    let selectedSquare = null;
    const game = new Chess();

    function createBoard() {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((i + j) % 2 === 0 ? 'white' : 'black');
                square.dataset.row = i;
                square.dataset.col = j;
                boardElement.appendChild(square);
                board.push(square);
            }
        }
    }

    function getPieceUnicode(piece) {
        const pieces = {
            'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
            'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
        };
        return pieces[piece.type] || '';
    }

    function renderBoard() {
        const boardState = game.board();
        board.forEach((square, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const piece = boardState[row][col];
            if (piece) {
                const pieceElement = document.createElement('span');
                pieceElement.classList.add('piece');
                pieceElement.style.color = piece.color === 'w' ? '#fff' : '#000';
                pieceElement.innerHTML = getPieceUnicode(piece);
                square.innerHTML = '';
                square.appendChild(pieceElement);
            } else {
                square.innerHTML = '';
            }
        });
        playerTurnElement.textContent = game.turn() === 'w' ? 'Blancas' : 'Negras';
    }

    function handleSquareClick(event) {
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const algebraic = String.fromCharCode('a'.charCodeAt(0) + col) + (8 - row);
        const piece = game.get(algebraic);

        if (selectedPiece) {
            const move = {
                from: selectedSquare,
                to: algebraic,
                promotion: 'q' // Promociona a reina por defecto
            };
            const result = game.move(move);
            if (result) {
                renderBoard();
                updateCapturedPieces();
            }
            selectedPiece = null;
            selectedSquare = null;
            board.forEach(s => s.style.backgroundColor = ''); // Limpia el resaltado
        } else if (piece && piece.color === game.turn()) {
            selectedPiece = piece;
            selectedSquare = algebraic;
            square.style.backgroundColor = 'yellow'; // Resalta la casilla seleccionada
        }
    }
    
    function updateCapturedPieces() {
        // Esta es una implementación simple, se podría mejorar para mostrar las piezas exactas.
        // Por ahora, solo es un marcador de posición.
    }


    board.forEach(square => square.addEventListener('click', handleSquareClick));

    createBoard();
    renderBoard();
});