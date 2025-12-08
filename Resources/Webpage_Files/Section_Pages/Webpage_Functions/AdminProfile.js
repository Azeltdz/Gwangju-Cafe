// AdminProfile.js - Firebase Authentication & Firestore
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Initialize admin profile on page load
document.addEventListener("DOMContentLoaded", () => {
    initAdminProfile();
});

async function initAdminProfile() {
    console.log("initAdminProfile called");

    const container = document.getElementById("admin_profile_container");
    if (!container) {
        console.error("Admin profile container not found (id='admin_profile_container').");
        return;
    }
    container.innerHTML = "<p>Loading admin profile...</p>";
    // Check authentication state
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Not logged in, redirect to login
            console.error("No user logged in.");
            window.location.href = "../../../../../index.html";
            return;
        }
        try {
            // Get user document from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (!userDoc.exists()) {
                container.innerHTML = "<p>Error: User profile not found.</p>";
                return;
            }
            const userData = userDoc.data();
            // Check if user has admin role
            if (userData.role !== "admin") {
                container.innerHTML = "<p>Access Denied: Admin privileges required.</p>";
                setTimeout(() => {
                    window.location.href = "../Home.html";
                }, 2000);
                return;
            }
            // Display admin profile
            renderAdminProfile(userData);
        } catch (error) {
            console.error("Error loading admin profile:", error);
            container.innerHTML = `<p>Error loading admin data: ${escapeHtml(error.message)}</p>`;
        }
    });
}

function renderAdminProfile(adminUser) {
    const container = document.getElementById("admin_profile_container");
    
    if (!container) {
        console.error("Admin profile container not found.");
        return;
    }
    const maskedPassword = "••••••••"; // Don't show actual password length for security
    container.innerHTML = `
        <div class="profile_box">    
            <h2>Admin Profile Information</h2>
            <hr>
            <p><strong>Username:</strong> ${escapeHtml(adminUser.username || "Not set")}</p>
            <p><strong>Email:</strong> ${escapeHtml(adminUser.email || "Not set")}</p>
            <p><strong>Password:</strong> ${maskedPassword}</p>
            <p><strong>Role:</strong> ${escapeHtml(adminUser.role || "user")}</p>
            <p><strong>Account Created:</strong> ${formatDate(adminUser.createdAt)}</p>
        </div>   
    `;
}
// Admin logout function
window.admin_logout = async function() {
    try {
        await signOut(auth);
        window.location.href = "../../../../../index.html";
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Error logging out: " + error.message);
    }
};
// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
// Format date for display
function formatDate(dateString) {
    if (!dateString) return "N/A";
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (e) {
        return "Invalid date";
    }
}