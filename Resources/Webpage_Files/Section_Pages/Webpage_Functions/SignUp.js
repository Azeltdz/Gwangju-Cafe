// SignUp.js - Complete Single-Step Firestore Authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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
// Toggle Password Visibility for both password fields
const setupPasswordToggle = (toggleId, password) => {
    const togglePassword = document.getElementById(toggleId);
    const passwordInput = document.getElementById(password);

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
};
// Setup toggles for password and confirm password
setupPasswordToggle("togglePassword", "password");
setupPasswordToggle("toggleConfirmPassword", "confirmPassword");
// Complete Sign Up Form Handler
document.getElementById("signUpForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    // Disable submit button to prevent double submission
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing up...";
    // Helper function to reset button
    const resetButton = () => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign Up";
    };
    // Get Account Information
    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    // Get Address Information
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const houseNumber = document.getElementById("houseNumber").value.trim();
    const street = document.getElementById("street").value.trim();
    const barangay = document.getElementById("barangay").value;
    // Validation - Account Information
    if (password !== confirmPassword) {
        showError("Passwords do not match!");
        resetButton();
        return;
    }
    if (username.length < 3) {
        showError("Username must be at least 3 characters!");
        resetButton();
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError("Invalid email format!");
        resetButton();
        return;
    }
    if (password.length < 6) {
        showError("Password must be at least 6 characters!");
        resetButton();
        return;
    }
    try {
        // Check if username already exists in Firestore
        const usernamesRef = collection(db, "usernames");
        const q = query(usernamesRef, where("username", "==", username));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            showError("Username already taken!");
            resetButton();
            return;
        }
        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Update profile with username
        await updateProfile(user, {
            displayName: username
        });
        // Store complete user data in Firestore (with address)
        await setDoc(doc(db, "users", user.uid), {
            email: email,
            username: username,
            role: "user",
            address: {
                firstName: firstName,
                lastName: lastName,
                houseNumber: houseNumber,
                street: street,
                barangay: barangay
            },
            orders: [],
            createdAt: new Date().toISOString()
        });
        // Store username in separate collection for uniqueness check
        await setDoc(doc(db, "usernames", username), {
            username: username,
            uid: user.uid
        });
        // Success - navigate to home page
        window.location.href = 'Home.html';
    } catch (error) {
        console.error("Error during signup:", error);
        // Reset button on error
        resetButton();
        // Handle specific Firebase errors
        switch (error.code) {
            case 'auth/email-already-in-use':
                showError("Email already in use!");
                break;
            case 'auth/invalid-email':
                showError("Invalid email address!");
                break;
            case 'auth/weak-password':
                showError("Password is too weak!");
                break;
            case 'auth/network-request-failed':
                showError("Network error. Please check your connection.");
                break;
            default:
                showError("Signup failed: " + error.message);
        }
    }
});

function showError(message) {
    const errorMessage = document.getElementById("errorMessage");
    if (errorMessage) {
        errorMessage.textContent = message;
    } else {
        alert(message);
    }
}