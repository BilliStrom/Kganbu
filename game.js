class FlappyGame {
    constructor() {
        this.gameArea = document.getElementById('game-area');
        this.bird = document.getElementById('bird');
        this.scoreDisplay = document.getElementById('current-score');
        this.highscoreDisplay = document.getElementById('highscore');
        
        this.gravity = 20;
        this.jumpForce = -15;
        this.pipeSpeed = 1.5;
        this.score = 0;
        this.highscore = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.birdPosition = 200;
        this.pipes = [];
        
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => this.handleInput(e));
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput(e);
        });
    }

    handleInput(e) {
        if((e.key === ' ' || e.type === 'touchstart') && this.isPlaying) {
            this.birdPosition += this.jumpForce;
            this.updateBirdPosition();
        }
    }

    startGame() {
        this.resetGame();
        this.isPlaying = true;
        this.gameLoop();
        this.pipeGenerator = setInterval(() => this.createPipe(), 1500);
    }

    gameLoop() {
        if(!this.isPlaying || this.isPaused) return;

        this.birdPosition += this.gravity;
        this.updateBirdPosition();
        
        this.updatePipes();
        this.checkCollisions();
        
        requestAnimationFrame(() => this.gameLoop());
    }

    createPipe() {
        const gap = 150;
        const minHeight = 80;
        const maxHeight = 350;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

        const topPipe = this.createPipeElement(topHeight, 'top');
        const bottomPipe = this.createPipeElement(
            this.gameArea.offsetHeight - topHeight - gap, 
            'bottom'
        );

        this.pipes.push({ top: topPipe, bottom: bottomPipe, scored: false });
    }

    createPipeElement(height, position) {
        const pipe = document.createElement('div');
        pipe.className = `pipe pipe-${position}`;
        pipe.style.height = `${height}px`;
        pipe.style.left = '100%';
        position === 'top' 
            ? pipe.style.top = '0' 
            : pipe.style.bottom = '0';
        
        this.gameArea.appendChild(pipe);
        return pipe;
    }

    updatePipes() {
        this.pipes.forEach((pipe, index) => {
            const currentLeft = parseInt(pipe.top.style.left) || 100;
            const newLeft = currentLeft - this.pipeSpeed;
            
            pipe.top.style.left = `${newLeft}%`;
            pipe.bottom.style.left = `${newLeft}%`;

            // Score update
            if(newLeft < 40 && !pipe.scored) {
                this.score++;
                this.scoreDisplay.textContent = this.score;
                pipe.scored = true;
            }

            // Remove off-screen pipes
            if(newLeft < -20) {
                pipe.top.remove();
                pipe.bottom.remove();
                this.pipes.splice(index, 1);
            }
        });
    }

    checkCollisions() {
        const birdRect = this.bird.getBoundingClientRect();
        
        for(const pipe of this.pipes) {
            const topPipeRect = pipe.top.getBoundingClientRect();
            const bottomPipeRect = pipe.bottom.getBoundingClientRect();

            if(this.isColliding(birdRect, topPipeRect) || 
               this.isColliding(birdRect, bottomPipeRect) ||
               birdRect.top < 0 || 
               birdRect.bottom > this.gameArea.offsetHeight) {
                this.gameOver();
                return;
            }
        }
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    gameOver() {
        this.isPlaying = false;
        clearInterval(this.pipeGenerator);
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('end-screen').classList.remove('hidden');
        
        if(this.score > this.highscore) {
            this.highscore = this.score;
            this.highscoreDisplay.textContent = this.highscore;
            if(window.updateHighscore) {
                window.updateHighscore(this.highscore);
            }
        }
    }

    resetGame() {
        this.score = 0;
        this.scoreDisplay.textContent = '0';
        this.birdPosition = 200;
        this.updateBirdPosition();
        this.pipes.forEach(pipe => {
            pipe.top.remove();
            pipe.bottom.remove();
        });
        this.pipes = [];
        document.getElementById('end-screen').classList.add('hidden');
    }

    updateBirdPosition() {
        this.bird.style.top = `${this.birdPosition}px`;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if(!this.isPaused) this.gameLoop();
    }
}

// Initialize game
const game = new FlappyGame();

// UI Controls
window.togglePause = () => game.togglePause();
window.restartGame = () => game.startGame();
window.showMenu = () => {
    document.getElementById('game-section').style.display = 'none';
    document.getElementById('auth-box').style.display = 'block';
};