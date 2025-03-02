import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

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

export { auth, db, signInWithEmailAndPassword, signOut, collection, addDoc, getDocs };