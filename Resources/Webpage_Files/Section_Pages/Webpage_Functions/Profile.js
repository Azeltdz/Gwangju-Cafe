// Profile.js - Firebase Authentication & Firestore
import { db, auth } from './firebase-config.js';
import { onAuthStateChanged, signOut, updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

let currentUserData = null;
let currentUserId = null;

// Barangay options
const barangayOptions = [
    "Abiacao", "Bagong Tubig", "Balagtasin", "Balite", "Banoyo", "Boboy", "Bonliw",
    "Calumpang West", "Calumpang East", "Dulangan", "Durungao", "Locloc", "Luya",
    "Mahabang Parang", "Manggahan", "Muzon", "San Antonio", "San Isidro", "San Jose",
    "San Martin", "Santa Monica", "Taliba", "Talon", "Tejero", "Tungal", "Poblacion"
];

// Check authentication state and load profile
document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            await loadUserProfile(user.uid);
        } else {
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
        currentUserData = userDoc.data();
        renderProfile(currentUserData);
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
    
    const a = user.address || {};
    const fullName = [a.firstName, a.lastName].filter(Boolean).join(" ");
    const fullAddress = [
        a.houseNumber,
        a.street,
        "Brgy. " + a.barangay,
        "San Luis, Batangas, Philippines"
    ].filter(Boolean).join(", ");
    
    const passwordDisplay = "••••••••";
    
    // Format creation date
    let createdDate = "Not available";
    if (user.createdAt) {
        const date = new Date(user.createdAt);
        createdDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    container.innerHTML = `
        <div class="profile_box">
            <div class="profile_header">
                <h2>Profile Information</h2>
                <button class="edit_profile_btn" onclick="showPasswordVerification()">Edit Profile</button>
            </div>
            <hr>
            <div class="profile_info">
                <p><strong>Account Created:</strong> ${createdDate}</p>
                <h4 class="profile_section_title">Full Name: ${fullName || "No name saved."}</h4>
                <p><strong>Username:</strong> ${user.username || "Not set"}</p>
                <p><strong>Email:</strong> ${user.email || "Not set"}</p>
                <p><strong>Password:</strong> ${passwordDisplay}</p>
                <h4 class="profile_section_title">Address: ${fullAddress || "No address saved."}</h4>
            </div>
        </div>
    `;
}

// Show password verification popup before edit
window.showPasswordVerification = function() {
    const popup = document.createElement('div');
    popup.className = 'profile_popup_overlay';
    popup.id = 'password_verify_popup';
    popup.innerHTML = `
        <div class="profile_popup password_verify_popup">
            <h2>Verify Your Identity</h2>
            <p style="text-align: center; color: #8b6f47; margin-bottom: 20px;">
                Please enter your current password to continue
            </p>
            <div class="popup_form">
                <label>Current Password:</label>
                <input type="password" id="verify_password" class="styled_input" placeholder="Enter your password">
                <p id="verify_error" style="color: #d32f2f; font-size: 14px; margin: 10px 0; display: none;"></p>
                <div class="popup_buttons">
                    <button class="btn_confirm" onclick="verifyPassword()">Verify</button>
                    <button class="btn_cancel" onclick="closePasswordVerification()">Cancel</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Close popup when clicking outside
    document.getElementById('password_verify_popup').addEventListener('click', function(e) {
        if (e.target === this) {
            closePasswordVerification();
        }
    });

    // Focus on password input
    document.getElementById('verify_password').focus();

    // Allow Enter key to submit
    document.getElementById('verify_password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyPassword();
        }
    });
};

// Verify password
window.verifyPassword = async function() {
    const passwordInput = document.getElementById('verify_password');
    const password = passwordInput.value.trim();
    const errorElement = document.getElementById('verify_error');

    if (!password) {
        errorElement.textContent = "Please enter your password";
        errorElement.style.display = "block";
        return;
    }

    try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, password);
        
        // Try to reauthenticate
        await reauthenticateWithCredential(user, credential);
        
        // Password is correct, close verification and show edit popup
        closePasswordVerification();
        showEditProfilePopup();
    } catch (error) {
        console.error("Password verification failed:", error);
        
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorElement.textContent = "Incorrect password. Please try again.";
        } else if (error.code === 'auth/too-many-requests') {
            errorElement.textContent = "Too many failed attempts. Please try again later.";
        } else {
            errorElement.textContent = "Verification failed. Please try again.";
        }
        errorElement.style.display = "block";
        passwordInput.value = "";
        passwordInput.focus();
    }
};

// Close password verification popup
window.closePasswordVerification = function() {
    const popup = document.querySelector('#password_verify_popup');
    if (popup) popup.remove();
};

// Show edit profile popup
function showEditProfilePopup() {
    if (!currentUserData) {
        alert("Profile data not loaded yet.");
        return;
    }

    const a = currentUserData.address || {};
    
    const popup = document.createElement('div');
    popup.className = 'profile_popup_overlay';
    popup.id = 'edit_profile_popup';
    popup.innerHTML = `
        <div class="profile_popup">
            <h2>Edit Profile</h2>
            <div class="popup_form">
                <div class="form_section">
                    <h3>Personal Information</h3>
                    
                    <label>First Name: <span style="color: red;">*</span></label>
                    <input type="text" id="edit_firstName" class="styled_input" value="${a.firstName || ''}" placeholder="Enter first name" minlength="2" maxlength="50" required>
                    
                    <label>Last Name: <span style="color: red;">*</span></label>
                    <input type="text" id="edit_lastName" class="styled_input" value="${a.lastName || ''}" placeholder="Enter last name" minlength="2" maxlength="50" required>
                    
                    <label>Username: <span style="color: red;">*</span></label>
                    <input type="text" id="edit_username" class="styled_input" value="${currentUserData.username || ''}" placeholder="Enter username" minlength="3" maxlength="20" required>
                </div>

                <div class="form_section">
                    <h3>Address Information</h3>
                    
                    <label>House Number: <span style="color: red;">*</span></label>
                    <input type="text" id="edit_houseNumber" class="styled_input" value="${a.houseNumber || ''}" placeholder="Enter house number" maxlength="20" required>
                    
                    <label>Street: <span style="color: red;">*</span></label>
                    <input type="text" id="edit_street" class="styled_input" value="${a.street || ''}" placeholder="Enter street" maxlength="100" required>
                    
                    <label>Barangay: <span style="color: red;">*</span></label>
                    <select id="edit_barangay" class="styled_input" required>
                        <option value="">-- Select Barangay --</option>
                        ${barangayOptions.map(brgy => 
                            `<option value="${brgy}" ${a.barangay === brgy ? 'selected' : ''}>${brgy}</option>`
                        ).join('')}
                    </select>
                </div>

                <div class="form_section">
                    <h3>Account Security</h3>
                    
                    <label>Email: <span style="color: red;">*</span></label>
                    <input type="email" id="edit_email" class="styled_input" value="${currentUserData.email || ''}" placeholder="Enter email" required>
                    
                    <label>New Password (leave blank to keep current):</label>
                    <input type="password" id="edit_password" class="styled_input" placeholder="Enter new password (min. 6 characters)" minlength="6">
                    
                    <label>Current Password: <span style="color: red;">*</span></label>
                    <input type="password" id="edit_currentPassword" class="styled_input" placeholder="Enter current password for security" required>
                    
                    <p style="font-size: 12px; color: #8b6f47; margin-top: 10px;">
                        <strong>Note:</strong> Current password is required for all changes.
                    </p>
                </div>

                <p id="update_error" style="color: #d32f2f; font-size: 14px; margin: 15px 0; padding: 12px; background: rgba(211, 47, 47, 0.1); border-radius: 8px; display: none; text-align: center;"></p>

                <div class="popup_buttons">
                    <button class="btn_confirm" onclick="confirmUpdateProfile()">Save Changes</button>
                    <button class="btn_cancel" onclick="closeEditProfilePopup()">Cancel</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Close popup when clicking outside
    document.getElementById('edit_profile_popup').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditProfilePopup();
        }
    });
}

// Confirm profile update
window.confirmUpdateProfile = async function() {
    const errorElement = document.getElementById('update_error');
    errorElement.style.display = 'none';
    errorElement.textContent = '';

    const firstName = document.getElementById('edit_firstName').value.trim();
    const lastName = document.getElementById('edit_lastName').value.trim();
    const username = document.getElementById('edit_username').value.trim();
    const houseNumber = document.getElementById('edit_houseNumber').value.trim();
    const street = document.getElementById('edit_street').value.trim();
    const barangay = document.getElementById('edit_barangay').value;
    const email = document.getElementById('edit_email').value.trim();
    const newPassword = document.getElementById('edit_password').value;
    const currentPassword = document.getElementById('edit_currentPassword').value;

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !houseNumber || !street || !barangay || !currentPassword) {
        showUpdateError("Please fill in all required fields marked with *");
        return;
    }

    // Validate lengths
    if (firstName.length < 2 || firstName.length > 50) {
        showUpdateError("First name must be between 2 and 50 characters.");
        return;
    }

    if (lastName.length < 2 || lastName.length > 50) {
        showUpdateError("Last name must be between 2 and 50 characters.");
        return;
    }

    if (username.length < 3 || username.length > 20) {
        showUpdateError("Username must be between 3 and 20 characters.");
        return;
    }

    if (houseNumber.length > 20) {
        showUpdateError("House number must be 20 characters or less.");
        return;
    }

    if (street.length > 100) {
        showUpdateError("Street must be 100 characters or less.");
        return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showUpdateError("Please enter a valid email address.");
        return;
    }

    // Validate new password if provided
    if (newPassword && newPassword.length < 6) {
        showUpdateError("New password must be at least 6 characters long.");
        return;
    }

    try {
        const user = auth.currentUser;
        
        // Check if username is being changed and if it's unique
        if (username !== currentUserData.username) {
            const usernamesRef = collection(db, "usernames");
            const q = query(usernamesRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                showUpdateError("Username is already taken. Please choose another one.");
                return;
            }
        }
        
        // Reauthenticate with current password
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update email if changed
        if (email !== currentUserData.email) {
            await updateEmail(user, email);
        }

        // Update password if provided
        if (newPassword) {
            await updatePassword(user, newPassword);
        }

        // Update username mapping if changed
        if (username !== currentUserData.username) {
            // Delete old username document
            await deleteDoc(doc(db, "usernames", currentUserData.username));
            // Create new username document
            await setDoc(doc(db, "usernames", username), {
                username: username,
                uid: currentUserId
            });
        }

        // Update Firestore document
        const userRef = doc(db, "users", currentUserId);
        await updateDoc(userRef, {
            username: username,
            email: email,
            address: {
                firstName: firstName,
                lastName: lastName,
                houseNumber: houseNumber,
                street: street,
                barangay: barangay
            }
        });

        closeEditProfilePopup();
        await loadUserProfile(currentUserId);
        alert("Profile updated successfully!");
    } catch (error) {
        console.error("Error updating profile:", error);
        
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            showUpdateError("Current password is incorrect. Please try again.");
        } else if (error.code === 'auth/email-already-in-use') {
            showUpdateError("This email is already in use by another account.");
        } else if (error.code === 'auth/requires-recent-login') {
            showUpdateError("For security reasons, please log out and log back in before changing email or password.");
        } else if (error.code === 'auth/too-many-requests') {
            showUpdateError("Too many requests. Please wait a moment and try again.");
        } else if (error.code === 'auth/network-request-failed') {
            showUpdateError("Network error. Please check your internet connection.");
        } else {
            showUpdateError("Failed to update profile: " + error.message);
        }
    }
};

// Show error message in the popup
function showUpdateError(message) {
    const errorElement = document.getElementById('update_error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Close edit profile popup
window.closeEditProfilePopup = function() {
    const popup = document.querySelector('#edit_profile_popup');
    if (popup) popup.remove();
};

// Logout function
window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = "../../../../index.html";
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Error logging out: " + error.message);
    }
};

// Navigation logout function
window.nav_logout = async function() {
    try {
        await signOut(auth);
        window.location.href = "../../../../index.html";
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Error logging out: " + error.message);
    }
};