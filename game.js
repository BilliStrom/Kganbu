let gameState = {
    isPlaying: false,
    score: 0,
    birdY: 300,
    velocity: 0,
    pipes: []
};

const GRAVITY = 0.5;
const FLAP_FORCE = -8;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;

document.addEventListener('keydown', () => {
    if (gameState.isPlaying) {
        gameState.velocity = FLAP_FORCE;
    }
});

function gameLoop() {
    if (!gameState.isPlaying) return;

    // Update bird position
    gameState.velocity += GRAVITY;
    gameState.birdY += gameState.velocity;
    document.getElementById('bird').style.top = `${gameState.birdY}px`;

    // Check collisions
    if (gameState.birdY < 0 || gameState.birdY > 560 || checkCollision()) {
        endGame();
        return;
    }

    // Update pipes
    updatePipes();
    requestAnimationFrame(gameLoop);
}

function updatePipes() {
    // Pipe generation and movement logic
}

function checkCollision() {
    // Collision detection logic
}

function endGame() {
    gameState.isPlaying = false;
    alert(`Game Over! Score: ${gameState.score}`);
    showGameMenu();
}

function showGameMenu() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('game-menu').style.display = 'block';
}