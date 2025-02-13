import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
            apiKey: "AIzaSyA7IL_lkuJ7klzKFJCwFjci7eOW-aLQrUw",
            authDomain: "knb-clicker-game.firebaseapp.com",
            projectId: "knb-clicker-game",
            storageBucket: "knb-clicker-game.firebasestorage.app",
            messagingSenderId: "810664187137",
            appId: "1:810664187137:web:b53c6e6ba9bfbadc6c7700"
        };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('game-menu').style.display = 'block';
    } else {
        currentUser = null;
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('game-menu').style.display = 'none';
    }
});

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
document.getElementById('leaderboard-button').addEventListener('click', showLeaderboard);
document.getElementById('close-leaderboard').addEventListener('click', hideLeaderboard);
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

    gameState.pipes.push({ element: topPipe, x: 400, height: topHeight, isTop: true, scored: false });
    gameState.pipes.push({ element: bottomPipe, x: 400, height: 600 - topHeight - gap, isTop: false, scored: false });
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

        // Обновление счета при пролете трубы
        if (pipe.x + 60 < 50 && pipe.isTop && !pipe.scored) {
            pipe.scored = true;
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

async function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameLoopInterval);
    clearInterval(gameState.pipeInterval);

    // Очистка труб
    gameState.pipes.forEach(pipe => pipe.element.remove());
    gameState.pipes = [];

    // Обновление рекорда в Firestore
    if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const currentHighScore = userDoc.data().highScore || 0;

        if (gameState.score > currentHighScore) {
            await updateDoc(userRef, {
                highScore: gameState.score
            });
        }
    }

    alert(`Game Over! Your score: ${gameState.score}`);
    showGameMenu();
}

function showGameMenu() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('game-menu').style.display = 'block';
}

async function showLeaderboard() {
    const q = query(collection(db, 'users'), orderBy('highScore', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);

    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = '';

    querySnapshot.forEach((doc, index) => {
        const user = doc.data();
        leaderboardList.innerHTML += `
            <li>${index + 1}. ${user.username} - ${user.highScore}</li>
        `;
    });

    document.getElementById('leaderboard').style.display = 'block';
}

function hideLeaderboard() {
    document.getElementById('leaderboard').style.display = 'none';
}

function handleFlap(e) {
    if (e.type === 'touchstart') e.preventDefault();
    if (gameState.isPlaying) {
        gameState.velocity = FLAP_FORCE;
    }
}