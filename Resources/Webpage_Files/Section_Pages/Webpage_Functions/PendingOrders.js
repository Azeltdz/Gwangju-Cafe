function initPending() {
    const container = document.getElementById("order_container");
    const currentUser = localStorage.getItem("currentUser");

    if (!currentUser) {
        container.innerHTML = `
            <p>You are not logged in.
                <a href="../Webpage_Sections/LogIn.html">Log in</a>
                to view your orders.
            </p>`;
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || {};
    const user = users[currentUser];

    if (!user) {
        container.innerHTML = `<p>User data not found.</p>`;
        return;
    }

    const orders = user.orders || [];
    const pendingOrders = orders.filter(o =>
        o.status !== "Completed" && o.status !== "Received"
    ).reverse();

    container.innerHTML = `<div id="orders_list"></div>`;
    displayPending(pendingOrders);
}

function displayPending(orders) {
    const list = document.getElementById("orders_list");

    if (orders.length === 0) {
        list.innerHTML = "<p>No pending orders.</p>";
        return;
    }

    list.innerHTML = "";

    orders.forEach(order => {
        const itemsHtml = order.items.map(i =>
            `${i.name} x ${i.quantity} — P ${(i.price * i.quantity).toFixed(2)}`
        ).join("<br>");

        const card = document.createElement("div");
        card.className = "order_card";

        card.innerHTML = `
            <p><strong>Order Date:</strong> ${order.date}</p>
            <div>${itemsHtml}</div>
            <p><strong>Total:</strong> P ${order.finalTotal}</p>
            <p><strong>Status:</strong> ${order.status}</p>
        `;

        list.appendChild(card);
    });
}