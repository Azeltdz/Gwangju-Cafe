document.getElementById("addressForm").addEventListener("submit", function (e) {
    e.preventDefault();

    let currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || {};

    if (!currentUser || currentUser === "undefined" || !(currentUser in users)) {
        console.warn("Current user missing. Attempting recovery…");

        const userKeys = Object.keys(users);

        if (userKeys.length > 0) {
            currentUser = userKeys[userKeys.length - 1];
            localStorage.setItem("currentUser", currentUser);
            console.log("Recovered currentUser:", currentUser);
        } else {
            alert("Fatal error: No user account exists in the system.");
            return;
        }
    }

    let user = users[currentUser];
    if (!user) {
        console.warn("User object missing — rebuilding placeholder.");
        user = {
            username: currentUser,
            email: "",
            password: "",
            role: "user",
            address: {},
            orders: []
        };
        users[currentUser] = user;
    }

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const houseNumber = document.getElementById("houseNumber").value.trim();
    const street = document.getElementById("street").value.trim();
    const barangay = document.getElementById("barangay").value.trim();

    user.address = {
        firstName,
        lastName,
        houseNumber,
        street,
        barangay
    };

    users[currentUser] = user;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", currentUser); 
    window.location.href = "Home.html";
});
