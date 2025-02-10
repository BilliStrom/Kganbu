import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
// Конфигурация Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7IL_lkuJ7klzKFJCwFjci7eOW-aLQrUw",
  authDomain: "knb-clicker-game.firebaseapp.com",
  projectId: "knb-clicker-game",
  storageBucket: "knb-clicker-game.firebasestorage.app",
  messagingSenderId: "810664187137",
  appId: "1:810664187137:web:b53c6e6ba9bfbadc6c7700"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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
window.showRegisterForm = function() {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
};

// Показать форму логина
window.showLoginForm = function() {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
};

// Регистрация нового пользователя
window.register = function() {
    const email = document.getElementById('register-username').value + "@knbgame.com";
    const password = document.getElementById('register-password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            setDoc(doc(db, 'users', user.uid), {
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
};

// Логин
window.login = function() {
    const email = document.getElementById('login-username').value + "@knbgame.com";
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            loadUserData();
            loginForm.style.display = 'none';
            gameContent.style.display = 'block';
        })
        .catch((error) => {
            alert(error.message);
        });
};

// Загрузка данных пользователя
function loadUserData() {
    getDoc(doc(db, 'users', currentUser.uid))
        .then((doc) => {
            if (doc.exists()) {
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
    const q = query(collection(db, 'users'), orderBy('highScore', 'desc'), limit(10));
    getDocs(q)
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
        updateDoc(doc(db, 'users', currentUser.uid), {
            highScore: highScore
        }).then(() => {
            updateLeaderboard();
        });
    }
    updateScoreDisplay();
});

// Проверка авторизации при загрузке страницы
onAuthStateChanged(auth, (user) => {
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
