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
    displayOrders(user);
}

function displayOrders(user) {
    const orders = user.orders ? [...user.orders].reverse() : [];
    const list = document.getElementById("orders_list");

    if (orders.length === 0) {
        list.innerHTML = "<p>No previous orders.</p>";
        return;
    }

    list.innerHTML = "";

    orders.forEach((order, index) => {
        const realIndex = user.orders.length - 1 - index;

        const itemsHtml = order.items.map(i =>
            `${i.name} x ${i.quantity} — P ${(i.price * i.quantity).toFixed(2)}`
        ).join("<br>");

        const card = document.createElement("div");
        card.className = "order_card";

        let actionHtml = "";

        if (order.status === "Pending" || order.status === "Preparing" || order.status === "Out for Delivery") {
            actionHtml = `<span style="color:gray;">Pending – cannot rate yet</span>`;
        }

        else if (order.status === "Completed") {
            actionHtml = `
                <button class="received_button" onclick="markReceived(${realIndex})">
                    Order Received
                </button>
            `;
        }

        else if (order.status === "Received") {
            actionHtml = renderStarsInteractive(realIndex, order.rating || 0);
        }

        card.innerHTML = `
            <p><strong>Order Date:</strong> ${order.date}</p>

            <div>${itemsHtml}</div>

            <p><strong>Items Total:</strong> P ${order.total}</p>
            <p><strong>Shipping Fee:</strong> P ${order.shippingFee}</p>
            <p><strong>Final Total:</strong> P ${order.finalTotal}</p>

            <p><strong>Status:</strong> ${order.status}</p>

            <div class="order_actions">
                ${actionHtml}
            </div>
        `;

        list.appendChild(card);
    });
}

function markReceived(index) {
    const username = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || {};
    const order = users[username].orders[index];

    if (order.status !== "Completed") {
        alert("This order has not been marked completed by admin yet.");
        return;
    }

    order.status = "Received";
    order.rating = order.rating || 0;

    localStorage.setItem("users", JSON.stringify(users));
    initHistory();
}

function renderStarsInteractive(index, rating) {
    let stars = "<strong>Rating:</strong> ";

    for (let i = 1; i <= 5; i++) {
        stars += `
            <span class="star" onclick="setRating(${index}, ${i})">
                ${i <= rating ? "★" : "☆"}
            </span>
        `;
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