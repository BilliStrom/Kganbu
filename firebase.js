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
    updateDoc, 
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs 
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isLoginMode = true;

document.getElementById('auth-button').addEventListener('click', handleAuth);
document.getElementById('switch-mode').addEventListener('click', toggleAuthMode);

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-button').textContent = isLoginMode ? 'Login' : 'Register';
    document.getElementById('switch-mode').textContent = isLoginMode ? 'Switch to Register' : 'Switch to Login';
}

async function handleAuth() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert('Please fill all fields');
        return;
    }

    const email = `${username}@knbgame.com`;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
            alert('Login successful!');
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                username,
                highScore: 0,
                created: new Date().toISOString()
            });
            alert('Registration successful! Please login.');
            toggleAuthMode();
        }
    } catch (error) {
        alert(error.message.replace('Firebase: ', ''));
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('game-menu').style.display = 'block';
    } else {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('game-menu').style.display = 'none';
    }
});