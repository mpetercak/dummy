const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;
const INITIAL_SPEED = 100;

// Game state
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isPaused = false;
let gameStarted = false;

highScoreElement.textContent = highScore;

// Initialize game
function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    dx = 1;
    dy = 0;
    score = 0;
    isPaused = false;
    gameStarted = true;
    scoreElement.textContent = score;
    gameOverElement.classList.remove('show');
    spawnFood();
}

// Start game
function startGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    initGame();
    gameLoop = setInterval(update, INITIAL_SPEED);
}

// Toggle pause
function togglePause() {
    if (!gameStarted) return;
    isPaused = !isPaused;
}

// Spawn food at random location
function spawnFood() {
    let maxAttempts = 100;
    let attempts = 0;

    while (attempts < maxAttempts) {
        food = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };

        // Check if food doesn't spawn on snake
        let onSnake = false;
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                onSnake = true;
                break;
            }
        }

        if (!onSnake) {
            return;
        }

        attempts++;
    }
}

// Update game state
function update() {
    if (isPaused) return;

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        endGame();
        return;
    }

    // Check self collision
    for (let segment of snake) {
        if (segment.x === head.x && segment.y === head.y) {
            endGame();
            return;
        }
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;

        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        spawnFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }

    draw();
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid with dark green lines
    ctx.strokeStyle = '#0a3d0a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }

    // Draw snake with neon glow effect
    snake.forEach((segment, index) => {
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;

        // Draw glow layers
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00FF00';

        // Create gradient for snake segment
        let gradient;
        if (index === 0) {
            // Head - brightest
            gradient = ctx.createRadialGradient(
                x + GRID_SIZE / 2, y + GRID_SIZE / 2, 0,
                x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2
            );
            gradient.addColorStop(0, '#7FFF00');
            gradient.addColorStop(0.5, '#00FF00');
            gradient.addColorStop(1, '#00CC00');
        } else {
            // Body - gradient from bright to darker
            const brightness = 1 - (index / snake.length) * 0.5;
            gradient = ctx.createRadialGradient(
                x + GRID_SIZE / 2, y + GRID_SIZE / 2, 0,
                x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2
            );
            gradient.addColorStop(0, `rgba(127, 255, 0, ${brightness})`);
            gradient.addColorStop(0.5, `rgba(0, 255, 0, ${brightness})`);
            gradient.addColorStop(1, `rgba(0, 204, 0, ${brightness * 0.8})`);
        }

        ctx.fillStyle = gradient;

        // Draw rounded rectangle for organic look
        drawRoundedRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4, 4);

        // Add scales/texture
        if (index === 0) {
            // Add eyes for head
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            const eyeSize = 2;
            if (dx === 1) { // Right
                ctx.fillRect(x + GRID_SIZE - 8, y + 5, eyeSize, eyeSize);
                ctx.fillRect(x + GRID_SIZE - 8, y + GRID_SIZE - 7, eyeSize, eyeSize);
            } else if (dx === -1) { // Left
                ctx.fillRect(x + 6, y + 5, eyeSize, eyeSize);
                ctx.fillRect(x + 6, y + GRID_SIZE - 7, eyeSize, eyeSize);
            } else if (dy === -1) { // Up
                ctx.fillRect(x + 5, y + 6, eyeSize, eyeSize);
                ctx.fillRect(x + GRID_SIZE - 7, y + 6, eyeSize, eyeSize);
            } else if (dy === 1) { // Down
                ctx.fillRect(x + 5, y + GRID_SIZE - 8, eyeSize, eyeSize);
                ctx.fillRect(x + GRID_SIZE - 7, y + GRID_SIZE - 8, eyeSize, eyeSize);
            }
        }

        // Reset shadow
        ctx.shadowBlur = 0;
    });

    // Draw food as glossy apple
    drawApple(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE);

    // Draw pause overlay
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#7FFF00';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00FF00';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;
    }
}

// Helper function to draw rounded rectangles
function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// Draw glossy apple
function drawApple(x, y, size) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2 - 2;

    // Draw apple glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#DC143C';

    // Apple body with gradient
    const appleGradient = ctx.createRadialGradient(
        centerX - radius / 3, centerY - radius / 3, 0,
        centerX, centerY, radius
    );
    appleGradient.addColorStop(0, '#FF6B6B');
    appleGradient.addColorStop(0.4, '#DC143C');
    appleGradient.addColorStop(1, '#8B0000');

    ctx.fillStyle = appleGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Glossy highlight
    ctx.shadowBlur = 0;
    const highlightGradient = ctx.createRadialGradient(
        centerX - radius / 3, centerY - radius / 3, 0,
        centerX - radius / 3, centerY - radius / 3, radius / 2
    );
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(centerX - radius / 3, centerY - radius / 3, radius / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw stem
    ctx.fillStyle = '#4A2511';
    ctx.fillRect(centerX - 1, y + 2, 2, size / 5);

    // Draw leaf
    ctx.fillStyle = '#228B22';
    ctx.beginPath();
    ctx.ellipse(centerX + 3, y + 4, 3, 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
}

// End game
function endGame() {
    clearInterval(gameLoop);
    gameStarted = false;
    finalScoreElement.textContent = score;
    gameOverElement.classList.add('show');
}

// Handle keyboard input
let inputQueue = [];
const movementKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D'];

document.addEventListener('keydown', (e) => {
    if (!gameStarted && e.key !== ' ') {
        startGame();
    }

    // Prevent default for arrow keys and space
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    if (e.key === ' ') {
        togglePause();
        return;
    }

    // Queue only movement keys to avoid unnecessary processing
    if (movementKeys.includes(e.key) && inputQueue.length < 2) {
        inputQueue.push(e.key);
    }
});

// Process input queue
setInterval(() => {
    if (inputQueue.length > 0) {
        const key = inputQueue.shift();

        // Arrow keys
        if ((key === 'ArrowUp' || key === 'w' || key === 'W') && dy === 0) {
            dx = 0;
            dy = -1;
        } else if ((key === 'ArrowDown' || key === 's' || key === 'S') && dy === 0) {
            dx = 0;
            dy = 1;
        } else if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && dx === 0) {
            dx = -1;
            dy = 0;
        } else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && dx === 0) {
            dx = 1;
            dy = 0;
        }
    }
}, 50);

// Draw initial state
draw();
