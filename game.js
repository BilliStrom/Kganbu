let gameState = {
    isPlaying: false,
    score: 0,
    birdY: 300,
    velocity: 0,
    pipes: [],
    pipeInterval: null,
    gameLoopInterval: null
};

const GRAVITY = 0.5;
const FLAP_FORCE = -8;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;

// Привязка событий
document.getElementById('play-button').addEventListener('click', startGame);
document.addEventListener('keydown', handleFlap);
document.addEventListener('touchstart', handleFlap);

function startGame() {
    if (gameState.isPlaying) return;

    // Сброс состояния игры
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.birdY = 300;
    gameState.velocity = 0;
    gameState.pipes = [];

    // Очистка экрана
    document.getElementById('game').innerHTML = `
        <div id="score">0</div>
        <div id="bird"></div>
    `;

    // Запуск игрового цикла
    gameState.gameLoopInterval = setInterval(gameLoop, 20);
    gameState.pipeInterval = setInterval(createPipe, 1500);

    // Скрыть меню и показать игру
    document.getElementById('game-menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
}

function gameLoop() {
    if (!gameState.isPlaying) return;

    // Обновление позиции птицы
    gameState.velocity += GRAVITY;
    gameState.birdY += gameState.velocity;
    document.getElementById('bird').style.top = `${gameState.birdY}px`;

    // Проверка столкновений
    if (gameState.birdY < 0 || gameState.birdY > 560 || checkCollision()) {
        endGame();
        return;
    }

    // Обновление труб
    updatePipes();
}

function createPipe() {
    const gap = 150;
    const minHeight = 80;
    const maxHeight = 350;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    const topPipe = document.createElement('div');
    topPipe.className = 'pipe';
    topPipe.style.height = `${topHeight}px`;
    topPipe.style.top = '0';
    topPipe.style.left = '100%';

    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe';
    bottomPipe.style.height = `${600 - topHeight - gap}px`;
    bottomPipe.style.bottom = '0';
    bottomPipe.style.left = '100%';

    document.getElementById('game').appendChild(topPipe);
    document.getElementById('game').appendChild(bottomPipe);

    gameState.pipes.push({ element: topPipe, x: 400, height: topHeight, isTop: true });
    gameState.pipes.push({ element: bottomPipe, x: 400, height: 600 - topHeight - gap, isTop: false });
}

function updatePipes() {
    gameState.pipes.forEach(pipe => {
        pipe.x -= PIPE_SPEED;
        pipe.element.style.left = `${pipe.x}px`;

        // Удаление труб за пределами экрана
        if (pipe.x + 60 < 0) {
            pipe.element.remove();
            gameState.pipes = gameState.pipes.filter(p => p !== pipe);
        }

        // Обновление счета
        if (pipe.x + 60 === 50 && pipe.isTop) {
            gameState.score++;
            document.getElementById('score').textContent = gameState.score;
        }
    });
}

function checkCollision() {
    const birdRect = {
        x: 50,
        y: gameState.birdY,
        width: 40,
        height: 40
    };

    return gameState.pipes.some(pipe => {
        const pipeRect = {
            x: pipe.x,
            y: pipe.isTop ? 0 : 600 - pipe.height,
            width: 60,
            height: pipe.height
        };

        return !(
            birdRect.x + birdRect.width < pipeRect.x ||
            birdRect.x > pipeRect.x + pipeRect.width ||
            birdRect.y + birdRect.height < pipeRect.y ||
            birdRect.y > pipeRect.y + pipeRect.height
        );
    });
}

function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameLoopInterval);
    clearInterval(gameState.pipeInterval);

    // Очистка труб
    gameState.pipes.forEach(pipe => pipe.element.remove());
    gameState.pipes = [];

    alert(`Game Over! Your score: ${gameState.score}`);
    showGameMenu();
}

function showGameMenu() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('game-menu').style.display = 'block';
}

function handleFlap(e) {
    if (e.type === 'touchstart') e.preventDefault();
    if (gameState.isPlaying) {
        gameState.velocity = FLAP_FORCE;
    }
}