(function AdminSignup() {
    const db = JSON.parse(localStorage.getItem("users")) || {};

    if (!db["admin"]) {
        db["admin"] = {
            email: "admingwangju@gmail.com",
            username: "admin_at_gwangju",
            password: "admin123",
            role: "admin",
            orders: []
        };

        localStorage.setItem("users", JSON.stringify(db));
    }
})();