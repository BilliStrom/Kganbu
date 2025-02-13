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
let score = 0;
let highScore = 0;
let gameInterval;
let pipeInterval;
let birdPosition = 200;
let gravity = 2.5;
let isGameActive = false;
let isPaused = false;
let pipes = [];

const elements = {
    loginForm: document.getElementById('login-form'),
    gameContent: document.getElementById('game-content'),
    scoreDisplay: document.getElementById('score'),
    leaderboard: document.getElementById('leaderboard'),
    leaderboardList: document.getElementById('leaderboard-list'),
    bird: document.getElementById('bird'),
    pauseButton: document.getElementById('pause-button'),
    pauseMenu: document.getElementById('pause-menu')
};

// Привязка событий
document.getElementById('play-button').addEventListener('click', startGame);
document.getElementById('leaderboard-button').addEventListener('click', showLeaderboard);
document.getElementById('close-leaderboard').addEventListener('click', hideLeaderboard);
document.addEventListener('keydown', handleFlap);
document.addEventListener('touchstart', handleFlap);

// Инициализация обработчиков событий
elements.pauseButton.addEventListener('click', togglePause);
document.addEventListener('keydown', handleFlap);
document.addEventListener('touchstart', handleFlap, { passive: false });
document.getElementById('logout-button').addEventListener('click', handleLogout);

// Валидация имени пользователя
const validateUsername = (username) => /^[A-Za-z0-9]{3,15}$/.test(username);

// Формы авторизации
window.showRegisterForm = () => {
    elements.loginForm.innerHTML = `
        <div class="auth-box">
            <input type="text" id="register-username" placeholder="Username (3-15 chars)">
            <input type="password" id="register-password" placeholder="Password (6+ chars)">
            <button class="game-button" style="background: #3498db;" onclick="register()">Register</button>
            <button class="game-button" style="background: #95a5a6;" onclick="showLoginForm()">Back to Login</button>
        </div>
    `;
};

window.showLoginForm = () => {
    elements.loginForm.innerHTML = `
        <div class="auth-box">
            <input type="text" id="login-username" placeholder="Username">
            <input type="password" id="login-password" placeholder="Password">
            <button class="game-button" style="background: #3498db;" onclick="login()">Login</button>
            <button class="game-button" style="background: #95a5a6;" onclick="showRegisterForm()">Register</button>
        </div>
    `;
};

// Авторизация
window.login = async () => {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!validateUsername(username)) {
        alert('Invalid username! Use 3-15 alphanumeric characters.');
        return;
    }

    try {
        const email = `${username}@knbgame.com`;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        currentUser = userCredential.user;
        await loadUserData();
        elements.loginForm.style.display = 'none';
        elements.gameContent.style.display = 'block';
        startGame();
    } catch (error) {
        alert(error.message.replace('Firebase: ', ''));
    }
};

// Регистрация
window.register = async () => {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();

    if (!validateUsername(username)) {
        alert('Invalid username! Use 3-15 alphanumeric characters.');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    try {
        const email = `${username}@knbgame.com`;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            username: username.toLowerCase(),
            highScore: 0,
            created: new Date().toISOString()
        });

        alert('Registration successful! Please login.');
        showLoginForm();
    } catch (error) {
        alert(error.message.replace('Firebase: ', ''));
    }
};

// Загрузка данных пользователя
async function loadUserData() {
    try {
        const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (docSnap.exists()) {
            highScore = docSnap.data().highScore;
            elements.scoreDisplay.textContent = `High: ${highScore} | Current: ${score}`;
        }
        updateLeaderboard();
    } catch (error) {
        alert('Error loading user data: ' + error.message);
    }
}

// Игровая логика
function startGame() {
    if(isPaused) return;
    resetGame();
    isGameActive = true;
    animateBird();

    gameInterval = setInterval(gameLoop, 20);
    pipeInterval = setInterval(createPipe, 1500);
}

function gameLoop() {
    if (!isGameActive || isPaused) return;
    
    birdPosition += gravity;
    elements.bird.style.top = `${birdPosition}px`;

    if (birdPosition <= 0 || birdPosition >= 560 || checkCollision()) {
        endGame();
    }

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

    elements.gameContent.append(topPipe, bottomPipe);
    pipes.push({ x: 400, element: topPipe, height: topHeight, isTop: true, scored: false }, 
               { x: 400, element: bottomPipe, height: 600 - topHeight - gap, isTop: false });
}

function updatePipes() {
    pipes.forEach(pipe => {
        pipe.x -= 3;
        pipe.element.style.left = `${pipe.x}px`;

        if (pipe.x + 60 === 50 && pipe.isTop && !pipe.scored) {
            pipe.scored = true;
            score++;
            elements.scoreDisplay.textContent = `High: ${highScore} | Current: ${score}`;
        }
    });
    pipes = pipes.filter(pipe => pipe.x > -60);
}

function checkCollision() {
    const birdRect = {
        x: 50,
        y: birdPosition,
        width: 40,
        height: 40
    };

    return pipes.some(pipe => {
        const pipeRect = {
            x: pipe.x,
            y: pipe.isTop ? 0 : 600 - pipe.height,
            width: 60,
            height: pipe.height
        };

        return !(birdRect.x + birdRect.width < pipeRect.x ||
                birdRect.x > pipeRect.x + pipeRect.width ||
                birdRect.y + birdRect.height < pipeRect.y ||
                birdRect.y > pipeRect.y + pipeRect.height);
    });
}

async function endGame() {
    isGameActive = false;
    clearInterval(gameInterval);
    clearInterval(pipeInterval);

    if (score > highScore) {
        try {
            highScore = score;
            await updateDoc(doc(db, 'users', currentUser.uid), { highScore });
            updateLeaderboard();
            alert(`New High Score: ${highScore}!`);
        } catch (error) {
            alert('Error saving high score: ' + error.message);
        }
    }

    if(confirm(`Game Over! Score: ${score}\nPlay again?`)) startGame();
}

function resetGame() {
    score = 0;
    birdPosition = 200;
    pipes = [];
    elements.bird.style.top = '200px';
    elements.scoreDisplay.textContent = `High: ${highScore} | Current: 0`;
    elements.gameContent.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
}

// Лидерборд
async function updateLeaderboard() {
    try {
        const q = query(collection(db, 'users'), orderBy('highScore', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        elements.leaderboardList.innerHTML = querySnapshot.docs
            .map((doc, index) => `
                <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                    ${index + 1}. ${doc.data().username} - ${doc.data().highScore}
                </li>
            `).join('');
    } catch (error) {
        alert('Error loading leaderboard: ' + error.message);
    }
}

window.showLeaderboard = () => {
    elements.leaderboard.style.display = 'block';
    elements.pauseMenu.style.display = 'none';
};

window.closeLeaderboard = () => {
    elements.leaderboard.style.display = 'none';
};

// Пауза
function togglePause() {
    isPaused = !isPaused;
    elements.pauseMenu.style.display = isPaused ? 'block' : 'none';
    if(isPaused) {
        clearInterval(gameInterval);
        clearInterval(pipeInterval);
    } else {
        startGame();
    }
}

// Управление птицей
function handleFlap(e) {
    if (e.type === 'touchstart') e.preventDefault();
    if (isGameActive) birdPosition -= 35;
}

function animateBird() {
    elements.bird.style.transform = `translateY(-50%) rotate(${Date.now() % 200 < 100 ? -20 : 10}deg)`;
    if(isGameActive) requestAnimationFrame(animateBird);
}

// Выход
async function handleLogout() {
    try {
        await signOut(auth);
        currentUser = null;
        elements.loginForm.style.display = 'block';
        elements.gameContent.style.display = 'none';
        location.reload();
    } catch (error) {
        alert('Logout error: ' + error.message);
    }
}

// Следим за статусом авторизации
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadUserData();
        elements.loginForm.style.display = 'none';
        elements.gameContent.style.display = 'block';
        startGame();
    } else {
        elements.loginForm.style.display = 'block';
        elements.gameContent.style.display = 'none';
    }
});