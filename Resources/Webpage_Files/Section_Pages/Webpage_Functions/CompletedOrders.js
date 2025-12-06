function loadCompletedOrders() {
    const container = document.getElementById("completed_container");
    const users = JSON.parse(localStorage.getItem("users")) || {};

    let completed = [];

    Object.keys(users).forEach(username => {
        const user = users[username];
        if (user.orders) {
            user.orders.forEach(order => {
                if (order.status === "Completed") {
                    completed.push({ username, ...order });
                }
            });
        }
    });

    if (completed.length === 0) {
        container.innerHTML = "<p>No completed orders yet.</p>";
        return;
    }

    container.innerHTML = "";

    completed.sort((a, b) => new Date(b.date) - new Date(a.date));

    completed.forEach(order => {
        let itemsHTML = "";
        order.items.forEach(i => {
            itemsHTML += `<li>${i.name} x ${i.quantity} — P ${i.price}</li>`;
        });

        const card = document.createElement("div");
        card.className = "order_card";
        card.innerHTML = `
            <div class="order_header">
                <span>User: ${order.username}</span>
                <span>${order.date}</span>
            </div>

            <p><b>Total:</b> P ${order.finalTotal}</p>

            <p><b>Items:</b></p>
            <ul class="order_items">${itemsHTML}</ul>
        `;
        container.appendChild(card);
    });
}