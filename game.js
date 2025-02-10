// Инициализация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7IL_lkuJ7klzKFJCwFjci7eOW-aLQrUw",
    authDomain: "knb-clicker-game.firebaseapp.com",
    projectId: "KNB-Clicker-игра",
    storageBucket: "knb-clicker-game.firebasestorage.app",
    messagingSenderId: "810664187137",
    appId: "1:810664187137:web:b53c6e6ba9bfbadc6c7700"
};

// Инициализация Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Переменные игры
let currentUser = null;
let score = 0;
let highScore = 0;

// Элементы DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const gameContent = document.getElementById('game-content');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const leaderboardList = document.getElementById('leaderboard-list');
const clickButton = document.getElementById('click-button');

// Показать форму регистрации
function showRegisterForm() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
}

// Показать форму логина
function showLoginForm() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
}

// Регистрация нового пользователя
function register() {
    const email = document.getElementById('register-username').value + "@knbgame.com"; // Простое решение для email
    const password = document.getElementById('register-password').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).set({
                username: document.getElementById('register-username').value,
                highScore: 0
            }).then(() => {
                alert('Registration successful! Please login.');
                showLoginForm();
            });
        })
        .catch((error) => {
            alert(error.message);
        });
}

// Логин
function login() {
    const email = document.getElementById('login-username').value + "@knbgame.com";
    const password = document.getElementById('login-password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            loadUserData();
            loginForm.style.display = 'none';
            gameContent.style.display = 'block';
        })
        .catch((error) => {
            alert(error.message);
        });
}

// Загрузка данных пользователя
function loadUserData() {
    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                highScore = doc.data().highScore;
                updateScoreDisplay();
            }
        });
    updateLeaderboard();
}

// Обновление счета
function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
}

// Обновление таблицы лидеров
function updateLeaderboard() {
    db.collection('users').orderBy('highScore', 'desc').limit(10).get()
        .then((querySnapshot) => {
            leaderboardList.innerHTML = '';
            querySnapshot.forEach((doc) => {
                const user = doc.data();
                leaderboardList.innerHTML += `<li>${user.username}: ${user.highScore}</li>`;
            });
        });
}

// Обработка кликов
clickButton.addEventListener('click', () => {
    score += 1;
    if (score > highScore) {
        highScore = score;
        db.collection('users').doc(currentUser.uid).update({
            highScore: highScore
        }).then(() => {
            updateLeaderboard();
        });
    }
    updateScoreDisplay();
});

// Проверка авторизации при загрузке страницы
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        loadUserData();
        loginForm.style.display = 'none';
        gameContent.style.display = 'block';
    } else {
        loginForm.style.display = 'block';
        gameContent.style.display = 'none';
    }
});
