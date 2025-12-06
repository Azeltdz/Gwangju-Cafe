function initHistory() {
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

    container.innerHTML = `<div id="orders_list"></div>`;
    displayOrders(currentUser);
}

function displayOrders(username) {
    const users = JSON.parse(localStorage.getItem("users")) || {};
    const user = users[username];

    const orders = user.orders ? [...user.orders].reverse() : [];
    const ordersList = document.getElementById("orders_list");

    if (orders.length === 0) {
        ordersList.innerHTML = "<p>No previous orders.</p>";
        return;
    }

    ordersList.innerHTML = "";

    orders.forEach((order, index) => {
        const realIndex = user.orders.length - 1 - index;

        const itemsHtml = order.items.map(i =>
            `${i.name} x ${i.quantity} — ₱${(i.price * i.quantity).toFixed(2)}`
        ).join("<br>");

        const card = document.createElement("div");
        card.className = "order_card";

        card.innerHTML = `
            <p><strong>Order Date:</strong> ${order.date}</p>

            <div>${itemsHtml}</div>

            <p><strong>Items Total:</strong> ₱${order.total}</p>
            <p><strong>Shipping Fee:</strong> ₱${order.shippingFee}</p>
            <p><strong>Final Total:</strong> ₱${order.finalTotal}</p>

            <div class="order_status">
                <strong>Status: 
                    <span id="status_${realIndex}">${order.status}</span>
                </strong>
                <br><br>

                <div id="rating_container_${realIndex}">
                    ${renderCustomerAction(order, realIndex)}
                </div>
            </div>
        `;

        ordersList.appendChild(card);
    });
}

function renderCustomerAction(order, index) {
    if (order.status !== "Completed" && order.status !== "Received") {
        return `<span style="color:gray;">Waiting for completion...</span>`;
    }

    if (order.status === "Received") {
        return renderStarsInteractive(index, order.rating || 0);
    }

    return `<button class="received_button" onclick="markReceived(${index})">Order Received</button>`;
}

function markReceived(index) {
    const username = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[username].orders[index].status !== "Completed") {
        alert("Admin has not marked this order as completed yet.");
        return;
    }

    users[username].orders[index].status = "Received";
    users[username].orders[index].rating = users[username].orders[index].rating || 0;

    localStorage.setItem("users", JSON.stringify(users));
    initHistory();
}

function renderStarsInteractive(index, rating) {
    let stars = "<strong>Rating:</strong> ";

    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star" onclick="setRating(${index}, ${i})">
            ${i <= rating ? "★" : "☆"}
        </span>`;
    }

    return stars;
}

function setRating(index, stars) {
    const username = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || {};

    users[username].orders[index].rating = stars;
    localStorage.setItem("users", JSON.stringify(users));

    initHistory();
}