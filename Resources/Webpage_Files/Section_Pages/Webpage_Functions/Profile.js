// Profile.js - Firebase Authentication & Firestore
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Check authentication state and load profile
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in, load their profile
            await loadUserProfile(user.uid);
        } else {
            // No user is signed in, redirect to login
            console.error("No user logged in.");
            window.location.href = "../../../../index.html";
        }
    });
});

// Load user profile from Firestore
async function loadUserProfile(userId) {
    const container = document.getElementById("profile_container");

    if (!container) {
        console.error("Profile container missing.");
        return;
    }
    try {
        // Get user document from Firestore
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists()) {
            console.error("User profile not found in Firestore.");
            container.innerHTML = `
                <div class="profile_box">
                    <p>Error: Profile not found.</p>
                </div>
            `;
            return;
        }
        const userData = userDoc.data();
        renderProfile(userData);
    } catch (error) {
        console.error("Error loading profile:", error);
        container.innerHTML = `
            <div class="profile_box">
                <p>Error loading profile: ${error.message}</p>
            </div>
        `;
    }
}
// Render profile information
function renderProfile(user) {
    const container = document.getElementById("profile_container");

    if (!container) {
        console.error("Profile container missing.");
        return;
    }
    // Get address data
    const a = user.address || {};
    const fullName = [
        a.firstName,
        a.lastName
    ].filter(Boolean).join(" ");

    const fullAddress = [
        a.houseNumber,
        a.street,
        "Brgy. " + a.barangay,
        "San Luis, Batangas, Philippines"
    ].filter(Boolean).join(", ");

    // Password is securely stored in Firebase Auth, we don't show it
    const passwordDisplay = "••••••••";

    container.innerHTML = `
        <div class="profile_box">
            <h2>Profile Information</h2>
            <hr>

            <h4 class="profile_section_title">Full Name: ${fullName || "No name saved."}</h4>
            <p><strong>Username:</strong> ${user.username || "Not set"}</p>
            <p><strong>Email:</strong> ${user.email || "Not set"}</p>
            <p><strong>Password:</strong> ${passwordDisplay}</p>
            <h4 class="profile_section_title">Address: ${fullAddress || "No address saved."}</h4>
        </div>
    `;
}

// Logout function (called from HTML button)
window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = "../../../../index.html";
        console.log("Click");
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Error logging out: " + error.message);
    }
};

// Navigation logout function (if needed)
window.nav_logout = async function() {
    try {
        await signOut(auth);
        window.location.href = "../../../../index.html";
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Error logging out: " + error.message);
    }
};