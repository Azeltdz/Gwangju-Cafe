localStorage.removeItem("lastFlavorPage");

document.addEventListener("DOMContentLoaded", function () {
    const shipping_fee = 50;

    const orderItemsEl = document.getElementById("orderItems");
    const itemsTotalEl = document.getElementById("itemsTotal");
    const shippingEl   = document.getElementById("shippingFee");
    const finalTotalEl = document.getElementById("finalTotal");

    if (!orderItemsEl || !itemsTotalEl || !shippingEl || !finalTotalEl) {
        console.error("Checkout: Missing required elements (orderItems, itemsTotal, shippingFee, finalTotal).");
        return;
    }

    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) {
        alert("Please log in first.");
        window.location.href = "LogIn.html";
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || {};
    const user  = users[currentUser];

    if (!user) {
        alert("User data not found. Please log in again.");
        window.location.href = "LogIn.html";
        return;
    }

    let originalCart = JSON.parse(localStorage.getItem("cart")) || [];

    originalCart = originalCart.filter(item =>
        item.id !== "free_matcha_checkout" &&
        item.id !== "free_matcha" &&
        item.name !== "Free Matcha Latte ∙ Tall"
    );

    localStorage.setItem("cart", JSON.stringify(originalCart));

    if (originalCart.length === 0) {
        orderItemsEl.innerHTML = "<p>Your cart is empty.</p>";
    }

    const totalItems = originalCart.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 1);
    }, 0);

    const displayCart = [...originalCart];

    if (totalItems >= 10) {
        displayCart.push({
            id: "free_matcha_checkout",
            name: "Free Matcha Latte ∙ Tall",
            price: 0,
            quantity: 1
        });
    }

    let itemsTotal = 0; 

    orderItemsEl.innerHTML = "";

    displayCart.forEach(item => {
        const qty      = Number(item.quantity || 1);
        const price    = Number(item.price || 0);
        const subtotal = qty * price;

        if (item.id !== "free_matcha_checkout") {
            itemsTotal += subtotal;
        }

        const row = document.createElement("div");
        row.className = "order_item";
        row.innerHTML = `
            <span>${item.name} x ${qty}</span>
            <span>P ${subtotal.toFixed(2)}</span>
        `;
        orderItemsEl.appendChild(row);
    });

    itemsTotalEl.textContent = `${itemsTotal.toFixed(2)}`;
    shippingEl.textContent   = `${shipping_fee.toFixed(2)}`;
    finalTotalEl.textContent = `${(itemsTotal + shipping_fee).toFixed(2)}`;

    let checkoutForm = document.getElementById("checkoutForm");
    if (!checkoutForm) {
        checkoutForm = document.querySelector("form");
    }
    if (!checkoutForm) {
        console.error("Checkout: No form found.");
        return;
    }

    checkoutForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (originalCart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const order = {
            orderId: Date.now(),     
            address: user.address || null,
            items: displayCart,
            date: formatOrderDate(new Date()),
            total: itemsTotal,
            shippingFee: shipping_fee,
            finalTotal: itemsTotal + shipping_fee,
            status: "Pending",
            rating: 0
        };

        if (!Array.isArray(user.orders)) {
            user.orders = [];
        }

        user.orders.push(order);
        users[currentUser] = user;
        localStorage.setItem("users", JSON.stringify(users));

        localStorage.removeItem("cart");
        showReceiptPopup(order);

    });
});

function formatOrderDate(date) {
    const d = new Date(date);

    let month = d.getMonth() + 1;
    let day   = d.getDate();
    let year  = d.getFullYear();

    let hours   = d.getHours();
    let minutes = d.getMinutes().toString().padStart(2, "0");
    let seconds = d.getSeconds().toString().padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${month}∙${day}∙${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
}

function showReceiptPopup(order) {
    const bg = document.createElement("div");
    bg.className = "receipt_popup_bg";

    const popup = document.createElement("div");
    popup.className = "receipt_popup";

    let itemsHTML = "";
    (order.items || []).forEach(item => {
        const qty   = Number(item.quantity || 1);
        const price = Number(item.price || 0);
        const subtotal = qty * price;

        itemsHTML += `
            <div class="receipt_row">
                <span>${item.name} x ${qty}</span>
                <span>P ${subtotal.toFixed(2)}</span>
            </div>
        `;
    });

    popup.innerHTML = `
        <h2>Order Receipt</h2>
        <div class="receipt_row">
            <span>Date:</span>
            <span>${order.date}</span>
        </div>
        <hr>

        ${itemsHTML}
        <hr>

        <div class="receipt_row">
            <span>Items Total:</span>
            <span>P ${order.total.toFixed(2)}</span>
        </div>

        <div class="receipt_row">
            <span>Shipping:</span>
            <span>P ${order.shippingFee.toFixed(2)}</span>
        </div>
        <hr>

        <div class="receipt_total">
            <span>Total:</span>
            <span>P ${order.finalTotal.toFixed(2)}</span>
        </div>

        <button id="closeReceipt">OK</button>
    `;

    bg.appendChild(popup);
    document.body.appendChild(bg);

    document.getElementById("closeReceipt").onclick = () => {
        bg.remove();
        window.location.href = "PendingOrders.html";
    };
}

document.addEventListener("DOMContentLoaded", () => {

    const backBtn = document.getElementById("checkoutBackBtn");
    if (!backBtn) return;

    backBtn.addEventListener("click", function (e) {
        e.preventDefault();

        let last = localStorage.getItem("lastFlavorPage");

        if (last && !last.includes("CheckOut") && !last.includes("Cart")) {
            window.location.href = last;
        } else {
            window.history.go(-2);
        }
    });
});