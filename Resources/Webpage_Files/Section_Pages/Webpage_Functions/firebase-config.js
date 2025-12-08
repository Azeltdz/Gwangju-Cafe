// firebase-config.js - Centralized Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAQxQi9bSrUvs29kZC6IkwbQlpAQeLP-Sc",
    authDomain: "gwangju-cafe.firebaseapp.com",
    projectId: "gwangju-cafe",
    storageBucket: "gwangju-cafe.firebasestorage.app",
    messagingSenderId: "190764000358",
    appId: "1:190764000358:web:13d4871165b3f2a6e439a7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in other files
export { app, auth, db };