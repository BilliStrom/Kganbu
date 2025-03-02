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
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();