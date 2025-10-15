// Variables del juego
let score = 0;
let lives = 3;
let gameSpeed = 1;
let gameRunning = false;
let isPaused = false;
let playerPosition = 50;
let enemies = [];
let coins = [];
let gameInterval;
let spawnInterval;

// Elementos del DOM
const gameArea = document.getElementById('game-area');
const playerCar = document.getElementById('player-car');
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');
const livesElement = document.getElementById('lives');
const gameOverScreen = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const finalScoreElement = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Emojis para enemigos
const enemyCars = ['🚕', '🚙', '🚌', '🚐', '🚓'];
const coinEmoji = '🪙';

// Inicializar juego
function initGame() {
    score = 0;
    lives = 3;
    gameSpeed = 1;
    playerPosition = 50;
    enemies = [];
    coins = [];
    gameRunning = true;
    isPaused = false;
    
    updateUI();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    
    // Limpiar enemigos y monedas anteriores
    document.querySelectorAll('.enemy, .coin').forEach(el => el.remove());
    
    // Iniciar loops del juego
    gameInterval = setInterval(gameLoop, 20);
    spawnInterval = setInterval(spawnObjects, 1500);
}

// Loop principal del juego
function gameLoop() {
    if (!gameRunning || isPaused) return;
    
    // Mover enemigos y monedas
    enemies.forEach((enemy, index) => {
        enemy.position += gameSpeed * 2;
        enemy.element.style.top = enemy.position + 'px';
        
        // Verificar colisión
        if (checkCollision(enemy)) {
            hitPlayer();
            removeObject(enemy, enemies, index);
        }
        
        // Remover si sale de la pantalla
        if (enemy.position > gameArea.offsetHeight) {
            score += 10;
            removeObject(enemy, enemies, index);
            updateUI();
        }
    });
    
    coins.forEach((coin, index) => {
        coin.position += gameSpeed * 2;
        coin.element.style.top = coin.position + 'px';
        
        // Verificar recolección
        if (checkCollision(coin)) {
            score += 50;
            coin.element.classList.add('explosion');
            setTimeout(() => removeObject(coin, coins, index), 100);
            updateUI();
        }
        
        // Remover si sale de la pantalla
        if (coin.position > gameArea.offsetHeight) {
            removeObject(coin, coins, index);
        }
    });
    
    // Aumentar velocidad gradualmente
    if (score > 0 && score % 200 === 0) {
        gameSpeed += 0.1;
        speedElement.textContent = Math.floor(gameSpeed);
    }
}

// Generar objetos (enemigos y monedas)
function spawnObjects() {
    if (!gameRunning || isPaused) return;
    
    // 70% enemigos, 30% monedas
    const isEnemy = Math.random() > 0.3;
    const lanes = [20, 40, 60, 80];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    
    if (isEnemy) {
        spawnEnemy(lane);
    } else {
        spawnCoin(lane);
    }
}

// Crear enemigo
function spawnEnemy(lane) {
    const enemy = document.createElement('div');
    enemy.className = 'car enemy';
    enemy.textContent = enemyCars[Math.floor(Math.random() * enemyCars.length)];
    enemy.style.left = lane + '%';
    gameArea.appendChild(enemy);
    
    enemies.push({
        element: enemy,
        position: -60,
        lane: lane
    });
}

// Crear moneda
function spawnCoin(lane) {
    const coin = document.createElement('div');
    coin.className = 'coin';
    coin.textContent = coinEmoji;
    coin.style.left = lane + '%';
    gameArea.appendChild(coin);
    
    coins.push({
        element: coin,
        position: -60,
        lane: lane
    });
}

// Verificar colisión
function checkCollision(obj) {
    const playerRect = playerCar.getBoundingClientRect();
    const objRect = obj.element.getBoundingClientRect();
    
    return !(playerRect.right < objRect.left || 
             playerRect.left > objRect.right || 
             playerRect.bottom < objRect.top || 
             playerRect.top > objRect.bottom);
}

// Jugador es golpeado
function hitPlayer() {
    lives--;
    playerCar.classList.add('hit');
    setTimeout(() => playerCar.classList.remove('hit'), 300);
    
    if (lives <= 0) {
        endGame();
    }
    updateUI();
}

// Remover objeto
function removeObject(obj, array, index) {
    if (obj.element && obj.element.parentNode) {
        obj.element.remove();
    }
    array.splice(index, 1);
}

// Actualizar interfaz
function updateUI() {
    scoreElement.textContent = score;
    speedElement.textContent = Math.floor(gameSpeed);
    livesElement.textContent = '❤️'.repeat(lives);
}

// Terminar juego
function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// Pausar juego
function togglePause() {
    if (!gameRunning) return;
    isPaused = !isPaused;
}

// Controles del teclado
document.addEventListener('keydown', (e) => {
    if (!gameRunning || isPaused) return;
    
    const lanes = [20, 40, 60, 80];
    const currentIndex = lanes.indexOf(playerPosition);
    
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
        playerPosition = lanes[currentIndex - 1];
        playerCar.style.left = playerPosition + '%';
    }
    
    if (e.key === 'ArrowRight' && currentIndex < lanes.length - 1) {
        playerPosition = lanes[currentIndex + 1];
        playerCar.style.left = playerPosition + '%';
    }
    
    if (e.key === ' ') {
        e.preventDefault();
        togglePause();
    }
});

// Eventos de botones
startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);