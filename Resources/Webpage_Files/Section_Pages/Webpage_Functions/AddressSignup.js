document.getElementById("addressForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || {};
    const user = users[currentUser];

    if (!user) {
        alert("Error: User not found.");
        return;
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

    window.location.href = "Home.html";
});