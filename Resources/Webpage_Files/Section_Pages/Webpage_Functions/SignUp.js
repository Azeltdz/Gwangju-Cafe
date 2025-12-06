document.getElementById("signupForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("signupUsername").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    const db = JSON.parse(localStorage.getItem("users")) || {};

    if (username.length < 3) {
        alert("Username must be at least 3 characters!");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Invalid email format!");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters!");
        return;
    }

    if (db[username]) {
        alert("Username already taken!");
        return;
    }

    db[username] = {
        email: email,
        username: username,
        password: password,
        role: "user",
        address: "",
        orders: []
    };

    localStorage.setItem("users", JSON.stringify(db));
    localStorage.setItem("currentUser", username);

    window.location.href = "Resources/Webpage_Files/Section_Pages/Webpage_Sections/AddressSignup.html";
});