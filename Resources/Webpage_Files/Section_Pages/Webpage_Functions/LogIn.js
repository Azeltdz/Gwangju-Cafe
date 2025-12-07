// LogIn.js - Complete Firebase Authentication with Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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

// Toggle Password Visibility with SVG
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {
    const eyeOpen = togglePassword.querySelector(".eye-open");
    const eyeClosed = togglePassword.querySelector(".eye-closed");
    
    togglePassword.addEventListener("click", function() {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        
        // Toggle SVG visibility
        if (type === "password") {
            eyeOpen.style.display = "block";
            eyeClosed.style.display = "none";
        } else {
            eyeOpen.style.display = "none";
            eyeClosed.style.display = "block";
        }
    });
}

// Log In Form Handler
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const usernameOrEmail = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();
        const errorMessage = document.getElementById("errorMessage");

        // Clear previous error
        if (errorMessage) {
            errorMessage.textContent = "";
        }

        try {
            let email = usernameOrEmail;
            
            // Check if input is a username (not an email)
            if (!usernameOrEmail.includes("@")) {
                // Look up email by username in Firestore
                const usernamesRef = collection(db, "usernames");
                const q = query(usernamesRef, where("username", "==", usernameOrEmail));
                const querySnapshot = await getDocs(q);
                
                if (querySnapshot.empty) {
                    showError("Username not found!");
                    return;
                }
                
                // Get the user ID from username
                const usernameDoc = querySnapshot.docs[0].data();
                const userId = usernameDoc.uid;
                
                // Get user data to retrieve email
                const userDoc = await getDoc(doc(db, "users", userId));
                if (!userDoc.exists()) {
                    showError("User data not found!");
                    return;
                }
                
                email = userDoc.data().email;
            }

            // Sign in with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (!userDoc.exists()) {
                showError("User data not found!");
                return;
            }

            const userData = userDoc.data();
            console.log("Logged in user data:", userData);

            // Redirect based on user role
            if (userData.role === "admin") {
                window.location.href = "Resources/Webpage_Files/Section_Pages/Webpage_Sections/Admin_Sections/AdminProfile.html";
            } else {
                window.location.href = "Resources/Webpage_Files/Section_Pages/Webpage_Sections/Home.html";
            }

        } catch (error) {
            console.error("Error during login:", error);
            
            // Handle specific Firebase errors
            switch (error.code) {
                case 'auth/user-not-found':
                    showError("User not found!");
                    break;
                case 'auth/wrong-password':
                    showError("Incorrect password!");
                    break;
                case 'auth/invalid-email':
                    showError("Invalid email format!");
                    break;
                case 'auth/user-disabled':
                    showError("This account has been disabled!");
                    break;
                case 'auth/too-many-requests':
                    showError("Too many failed attempts. Please try again later.");
                    break;
                case 'auth/network-request-failed':
                    showError("Network error. Please check your connection.");
                    break;
                case 'auth/invalid-credential':
                    showError("Invalid username or password!");
                    break;
                default:
                    showError("Login failed: " + error.message);
            }
        }
    });
}

function showError(message) {
    const errorMessage = document.getElementById("errorMessage");
    if (errorMessage) {
        errorMessage.textContent = message;
    } else {
        alert(message);
    }
}