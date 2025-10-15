class Minesweeper {
    constructor() {
        this.levels = {
            easy: { rows: 8, cols: 8, mines: 10 },
            medium: { rows: 12, cols: 12, mines: 20 },
            hard: { rows: 16, cols: 16, mines: 40 }
        };
        
        this.currentLevel = 'easy';
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.timerInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createBoard();
    }
    
    setupEventListeners() {
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentLevel = e.target.dataset.level;
                this.resetGame();
            });
        });
    }
    
    createBoard() {
        const { rows, cols, mines } = this.levels[this.currentLevel];
        const boardElement = document.getElementById('game-board');
        
        boardElement.innerHTML = '';
        boardElement.style.gridTemplateColumns = `repeat(${cols}, 35px)`;
        boardElement.style.gridTemplateRows = `repeat(${rows}, 35px)`;
        
        this.board = Array(rows).fill(null).map(() => Array(cols).fill(0));
        this.revealed = Array(rows).fill(null).map(() => Array(cols).fill(false));
        this.flagged = Array(rows).fill(null).map(() => Array(cols).fill(false));
        
        document.getElementById('mines-count').textContent = mines;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', () => this.handleClick(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(i, j);
                });
                
                boardElement.appendChild(cell);
            }
        }
    }
    
    placeMines(excludeRow, excludeCol) {
        const { rows, cols, mines } = this.levels[this.currentLevel];
        let minesPlaced = 0;
        
        while (minesPlaced < mines) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            
            const isExcluded = Math.abs(row - excludeRow) <= 1 && Math.abs(col - excludeCol) <= 1;
            
            if (this.board[row][col] !== -1 && !isExcluded) {
                this.board[row][col] = -1;
                minesPlaced++;
                
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const newRow = row + i;
                        const newCol = col + j;
                        if (this.isValid(newRow, newCol) && this.board[newRow][newCol] !== -1) {
                            this.board[newRow][newCol]++;
                        }
                    }
                }
            }
        }
    }
    
    isValid(row, col) {
        const { rows, cols } = this.levels[this.currentLevel];
        return row >= 0 && row < rows && col >= 0 && col < cols;
    }
    
    handleClick(row, col) {
        if (this.gameOver || this.revealed[row][col] || this.flagged[row][col]) return;
        
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        if (this.board[row][col] === -1) {
            this.revealMine(row, col);
            this.endGame(false);
        } else {
            this.revealCell(row, col);
            this.checkWin();
        }
    }
    
    handleRightClick(row, col) {
        if (this.gameOver || this.revealed[row][col]) return;
        
        this.flagged[row][col] = !this.flagged[row][col];
        this.updateCell(row, col);
        this.updateMineCount();
    }
    
    revealCell(row, col) {
        if (!this.isValid(row, col) || this.revealed[row][col] || this.flagged[row][col]) return;
        
        this.revealed[row][col] = true;
        this.updateCell(row, col);
        
        if (this.board[row][col] === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    this.revealCell(row + i, col + j);
                }
            }
        }
    }
    
    revealMine(row, col) {
        const { rows, cols } = this.levels[this.currentLevel];
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (this.board[i][j] === -1) {
                    this.revealed[i][j] = true;
                    this.updateCell(i, j);
                }
            }
        }
    }
    
    updateCell(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (this.flagged[row][col]) {
            cell.classList.add('flagged');
            cell.textContent = '🚩';
            return;
        } else {
            cell.classList.remove('flagged');
        }
        
        if (this.revealed[row][col]) {
            cell.classList.add('revealed');
            
            if (this.board[row][col] === -1) {
                cell.classList.add('mine');
                cell.textContent = '💣';
            } else if (this.board[row][col] > 0) {
                cell.textContent = this.board[row][col];
                cell.classList.add(`number-${this.board[row][col]}`);
            } else {
                cell.textContent = '';
            }
        } else {
            cell.textContent = '';
        }
    }
    
    updateMineCount() {
        const { mines } = this.levels[this.currentLevel];
        let flagCount = 0;
        
        this.flagged.forEach(row => {
            row.forEach(cell => {
                if (cell) flagCount++;
            });
        });
        
        document.getElementById('mines-count').textContent = mines - flagCount;
    }
    
    checkWin() {
        const { rows, cols, mines } = this.levels[this.currentLevel];
        let revealedCount = 0;
        
        this.revealed.forEach(row => {
            row.forEach(cell => {
                if (cell) revealedCount++;
            });
        });
        
        if (revealedCount === rows * cols - mines) {
            this.endGame(true);
        }
    }
    
    endGame(won) {
        this.gameOver = true;
        this.gameWon = won;
        this.stopTimer();
        
        const message = document.getElementById('game-message');
        message.classList.remove('hidden', 'win', 'lose');
        
        if (won) {
            message.classList.add('win');
            message.textContent = `🎉 ¡Ganaste! Tiempo: ${this.timer}s`;
        } else {
            message.classList.add('lose');
            message.textContent = '💥 ¡Perdiste! Intenta de nuevo';
        }
    }
    
    startTimer() {
        this.timer = 0;
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.timer;
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    resetGame() {
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.stopTimer();
        this.timer = 0;
        document.getElementById('timer').textContent = '0';
        document.getElementById('game-message').classList.add('hidden');
        this.createBoard();
    }
}

const game = new Minesweeper();