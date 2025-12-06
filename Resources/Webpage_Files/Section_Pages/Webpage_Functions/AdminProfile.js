function initAdminProfile() {
    console.log("initAdminProfile called");

    const container = document.getElementById("admin_profile_container");
    if (!container) {
        console.error("Admin profile container not found (id='admin_profile_container').");
        return;
    }

    const usersRaw = localStorage.getItem("users");
    if (!usersRaw) {
        container.innerHTML = "<p>No users found in localStorage.</p>";
        return;
    }

    let users;
    try {
        users = JSON.parse(usersRaw);
    } catch (e) {
        console.error("Error parsing users from localStorage:", e);
        container.innerHTML = "<p>Error loading admin data.</p>";
        return;
    }

    let adminUser = null;
    let adminKey = null;

    for (const [key, value] of Object.entries(users)) {
        if (value && value.role === "admin") {
            adminUser = value;
            adminKey = key;
            break;
        }
    }

    if (!adminUser) {
        container.innerHTML = "<p>No admin account found.</p>";
        return;
    }

    console.log("Found admin key:", adminKey, "data:", adminUser);

    const maskedPassword = "∙".repeat((adminUser.password || "").length);

    container.innerHTML = `
        <div class="profile_box">    
            <h3>Admin Profile Information</h3>
            <hr>

            <p><strong>Username:</strong> ${escapeHtml(adminUser.username || adminKey)}</p>
            <p><strong>Email:</strong> ${escapeHtml(adminUser.email || "")}</p>
            <p><strong>Password:</strong> ${maskedPassword}</p>
        </div>   
    `;
}

function admin_logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../LogIn.html";
}

function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}