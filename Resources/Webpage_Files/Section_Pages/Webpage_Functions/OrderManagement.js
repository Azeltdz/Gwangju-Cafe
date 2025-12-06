function loadAllCustomerOrders() {
    const container = document.getElementById("customer_order_container");
    container.innerHTML = "<p>Loading orders...</p>";

    const users = JSON.parse(localStorage.getItem("users")) || {};
    let allOrders = [];

    Object.keys(users).forEach(username => {
        const user = users[username];

        if (user.orders) {
            user.orders.forEach((order, index) => {
                if (order.status !== "Completed") {
                    allOrders.push({
                        username,
                        orderIndex: index,
                        ...order
                    });
                }
            });
        }
    });

    if (allOrders.length === 0) {
        container.innerHTML = "<p>No active orders.</p>";
        return;
    }

    container.innerHTML = "";

    allOrders.forEach((orderObj, displayIndex) => {
        const card = document.createElement("div");
        card.className = "order_card";

        let itemsHTML = "";
        orderObj.items.forEach(item => {
            itemsHTML += `<li>${item.name} x ${item.quantity} — P ${item.price}</li>`;
        });

        const a = orderObj.address || {};
        const customerAddress = [
            a.houseNumber,
            a.street,
            a.barangay,
            "San Luis, Batangas, Philippines"
        ].filter(Boolean).join(", ") || "<i>No address provided</i>";

        card.innerHTML = `
            <div class="order_header">
                <span><b>User:</b> ${orderObj.username}</span>
                <span>${orderObj.date}</span>
            </div>

            <p><b>Address:</b> ${customerAddress}</p>

            <p><b>Total:</b> P ${orderObj.finalTotal}</p>

            <p><b>Items:</b></p>
            <ul class="order_items">${itemsHTML}</ul>

            <div class="order_status">
                <div>
                    <b>Status:</b>
                    <select id="status_display_${displayIndex}">
                        <option ${orderObj.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option ${orderObj.status === "Preparing" ? "selected" : ""}>Preparing</option>
                        <option ${orderObj.status === "Out For Delivery" ? "selected" : ""}>Out For Delivery</option>
                        <option ${orderObj.status === "Completed" ? "selected" : ""}>Completed</option>
                    </select>
                </div>

                <button class="update_status_btn"
                    onclick="updateOrderStatus('${orderObj.username}', ${orderObj.orderIndex}, ${displayIndex})">
                    Update
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

function updateOrderStatus(username, orderIndex, displayIndex) {
    const users = JSON.parse(localStorage.getItem("users")) || {};
    const user = users[username];

    if (!user || !user.orders[orderIndex]) return;

    const newStatus = document.getElementById(`status_display_${displayIndex}`).value;

    user.orders[orderIndex].status = newStatus;
    users[username] = user;
    localStorage.setItem("users", JSON.stringify(users));

    if (newStatus === "Completed") {
        alert("Order marked Completed and moved out of queue.");
    } else {
        alert("Order status updated.");
    }

    loadAllCustomerOrders();
}