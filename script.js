import { auth, db, signInWithEmailAndPassword, signOut, collection, addDoc, getDocs } from './firebase.js';

// Авторизация
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
});

// Выход
document.getElementById('logout')?.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
});

// Загрузка товаров
const loadItems = async () => {
    const itemsGrid = document.querySelector('.items-grid');
    const querySnapshot = await getDocs(collection(db, 'items'));
    querySnapshot.forEach(doc => {
        const item = doc.data();
        itemsGrid.innerHTML += `
            <article class="item-card">
                <img src="${item.image}" alt="${item.title}" class="item-image">
                <div class="item-info">
                    <h3>${item.title}</h3>
                    <p class="price">${item.price} руб/день</p>
                    <p>${item.description}</p>
                    <button class="btn btn-primary">Арендовать</button>
                </div>
            </article>
        `;
    });
};

loadItems();