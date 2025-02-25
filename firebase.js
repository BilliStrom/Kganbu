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

// Auth Functions
window.login = async () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth, 
            `${username}@knbgame.com`, 
            password
        );
        handleAuthSuccess(userCredential.user);
    } catch (error) {
        alert(error.message.replace('Firebase: ', ''));
    }
};

window.register = async () => {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            `${username}@knbgame.com`, 
            password
        );
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            username,
            highscore: 0,
            created: new Date().toISOString()
        });
        
        handleAuthSuccess(userCredential.user);
    } catch (error) {
        alert(error.message.replace('Firebase: ', ''));
    }
};

function handleAuthSuccess(user) {
    currentUser = user;
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('game-section').style.display = 'block';
    loadUserData();
}

// Database Functions
async function loadUserData() {
    const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
    if(docSnap.exists()) {
        document.getElementById('highscore').textContent = docSnap.data().highscore;
    }
}

window.updateHighscore = async (newScore) => {
    await updateDoc(doc(db, 'users', currentUser.uid), {
        highscore: newScore
    });
    updateLeaderboard();
};

async function updateLeaderboard() {
    const q = query(collection(db, 'users'), orderBy('highscore', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    
    const leaderboardList = document.getElementById('leaderboard-list');
    leaderboardList.innerHTML = querySnapshot.docs
        .map((doc, index) => `
            <li>${index + 1}. ${doc.data().username} - ${doc.data().highscore}</li>
        `).join('');
}

// UI Controls
window.showRegister = () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
};

window.showLogin = () => {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
};

window.logout = async () => {
    await signOut(auth);
    location.reload();
};

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    if(!user) {
        document.getElementById('game-section').style.display = 'none';
        document.getElementById('auth-box').style.display = 'block';
    }
});