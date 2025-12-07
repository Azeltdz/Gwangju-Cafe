document.addEventListener("DOMContentLoaded", () => {

    let currentUser = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users")) || {};
    
    if (!currentUser || !(currentUser in users)) {
        const keys = Object.keys(users);
        if (keys.length > 0) {
            currentUser = keys[keys.length - 1];
            localStorage.setItem("currentUser", currentUser);
        } else {
            console.error("No users found in system.");
            return;
        }
    }

    const user = users[currentUser];

    if (!user) {
        console.error("Profile error: user missing.");
        return;
    }

    renderProfile(user, currentUser);
});


function renderProfile(user, username) {
    const container = document.getElementById("profile_container");

    if (!container) {
        console.error("Profile container missing.");
        return;
    }

    const passwordMasked = user.password
        ? "•".repeat(String(user.password).length)
        : "";

const a = user.address || {};

const fullName = [
    a.firstName,
    a.lastName
].filter(Boolean).join(" ");

const fullAddress = [
    a.houseNumber,
    a.street,
    a.barangay,
    "San Luis, Batangas, Philippines"
].filter(Boolean).join(", ");

container.innerHTML = `
    <div class="profile_box">
        <h2>Profile Information</h2>
        <hr>

        <h4 class="profile_section_title">Name: ${fullName || "No name saved."}</h4>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Email:</strong> ${user.email || "Not set"}</p>
        <p><strong>Password:</strong> ${passwordMasked}</p>
        <h4 class="profile_section_title">Address: ${fullAddress || "No address saved."}</h4>
    </div>
`;

}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "LogIn.html";
}

function nav_logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../../Section_Pages/Webpage_Sections/LogIn.html";
}