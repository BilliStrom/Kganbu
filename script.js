import { auth, db, signInWithEmailAndPassword, signOut, collection, addDoc, getDocs } from './firebase.js';

// Загрузка товаров
const loadItems = async () => {
    const itemsGrid = document.querySelector('.items-grid');
    const querySnapshot = await getDocs(collection(db, 'items'));
    itemsGrid.innerHTML = ''; // Очищаем контейнер перед загрузкой
    querySnapshot.forEach(doc => {
        const item = doc.data();
        itemsGrid.innerHTML += `
            <article class="item-card">
                <img src="${item.image}" alt="${item.title}" class="item-image">
                <div class="item-info">
                    <h3>${item.title}</h3>
                    <p class="price">${item.price} руб/день</p>
                    <p>${item.description}</p>
                    <button class="btn btn-primary" onclick="rentItem('${doc.id}')">Арендовать</button>
                </div>
            </article>
        `;
    });
};

// Функция аренды товара
window.rentItem = async (itemId) => {
    if (!auth.currentUser) {
        alert('Пожалуйста, войдите в систему, чтобы арендовать товар.');
        window.location.href = 'login.html';
        return;
    }
    try {
        await addDoc(collection(db, 'bookings'), {
            userId: auth.currentUser.uid,
            itemId: itemId,
            date: new Date().toISOString(),
        });
        alert('Товар успешно арендован!');
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
};

// Загрузка товаров при загрузке страницы
document.addEventListener('DOMContentLoaded', loadItems);