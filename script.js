import { db, collection, getDocs } from './firebase.js';

const loadItems = async () => {
    const itemsGrid = document.querySelector('.items-grid');
    const querySnapshot = await getDocs(collection(db, 'items'));
    console.log('Документы:', querySnapshot.docs); // Отладка
    itemsGrid.innerHTML = ''; // Очищаем контейнер перед загрузкой
    querySnapshot.forEach(doc => {
        const item = doc.data();
        console.log('Товар:', item); // Отладка
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('Страница загружена'); // Отладка
    loadItems();
});