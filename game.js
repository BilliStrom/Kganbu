// Данные пользователей и рекордов
let users = JSON.parse(localStorage.getItem('users')) || {};
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
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    if (users[username]) {
        alert('Username already exists!');
        return;
    }

    users[username] = { password, highScore: 0 };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful! Please login.');
    showLoginForm();
}

// Логин
function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!users[username] || users[username].password !== password) {
        alert('Invalid username or password!');
        return;
    }

    currentUser = username;
    highScore = users[username].highScore;
    loginForm.style.display = 'none';
    gameContent.style.display = 'block';
    updateScoreDisplay();
    updateLeaderboard();
}

// Обновление счета
function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
    highScoreDisplay.textContent = `High Score: ${highScore}`;
}

// Обновление таблицы лидеров
function updateLeaderboard() {
    const sortedUsers = Object.keys(users).sort((a, b) => users[b].highScore - users[a].highScore);
    leaderboardList.innerHTML = sortedUsers.map(user => `
        <li>${user}: ${users[user].highScore}</li>
    `).join('');
}

// Обработка кликов
clickButton.addEventListener('click', () => {
    score += 1;
    if (score > highScore) {
        highScore = score;
        users[currentUser].highScore = highScore;
        localStorage.setItem('users', JSON.stringify(users));
        updateLeaderboard();
    }
    updateScoreDisplay();
});