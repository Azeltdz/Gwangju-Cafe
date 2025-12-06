const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim(); 

        const db = JSON.parse(localStorage.getItem("users")) || {};

        let user;
        if (username === "admin_gwangju") {
            user = db["admin"];  
        } else {
            user = db[username];
        }

        console.log("Stored User Data: ", user); 

        if (!user) {
            alert("Username not found!");
            return;
        }

        if (user.password !== password) {
            alert("Incorrect password!");
            return;
        }

        localStorage.setItem("currentUser", username);

        if (user.role === "admin") {
            window.location.href = "Admin_Sections/AdminProfile.html"; 
        } else {
            window.location.href = "Home.html";
        }
    });
}