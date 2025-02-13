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