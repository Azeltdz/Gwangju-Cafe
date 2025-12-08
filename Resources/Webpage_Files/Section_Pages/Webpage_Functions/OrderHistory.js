import { db, auth } from './firebase-config.js';
import { 
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const USERS_COLLECTION = 'users';

let currentUser = null;

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        initHistory();
    } else {
        currentUser = null;
        showLoginMessage();
    }
});

function showLoginMessage() {
    const container = document.getElementById("order_container");
    container.innerHTML = `
        <p>You are not logged in.
            <a href="../../../../index.html">Log in</a>
            to view your orders.
        </p>`;
}

async function initHistory() {
    const container = document.getElementById("order_container");

    if (!currentUser) {
        showLoginMessage();
        return;
    }
    try {
        const userDocRef = doc(db, USERS_COLLECTION, currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            container.innerHTML = `<p>User data not found.</p>`;
            return;
        }
        const userData = userDoc.data();
        container.innerHTML = `<div id="orders_list"></div>`;
        displayOrders(userData);
    } catch (error) {
        console.error("Error loading order history:", error);
        container.innerHTML = `<p>Failed to load orders. Please refresh the page.</p>`;
    }
}

function displayOrders(userData) {
    const orders = userData.orders ? [...userData.orders].reverse() : [];
    const list = document.getElementById("orders_list");

    if (orders.length === 0) {
        list.innerHTML = "<p>No previous orders.</p>";
        return;
    }
    list.innerHTML = "";
    orders.forEach((order, index) => {
        const realIndex = userData.orders.length - 1 - index;
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

async function markReceived(index) {
    if (!currentUser) {
        alert("Please log in.");
        return;
    }
    try {
        const userDocRef = doc(db, USERS_COLLECTION, currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            alert("User data not found.");
            return;
        }
        const userData = userDoc.data();
        const orders = userData.orders || [];
        // Validate index
        if (index < 0 || index >= orders.length) {
            alert("Invalid order.");
            return;
        }
        const order = orders[index];
        if (order.status !== "Completed") {
            alert("Order must be completed before marking as received.");
            return;
        }
        // Only update if order is completed
        order.status = "Received";
        order.rating = order.rating || 0;
        order.receivedAt = new Date().toISOString();
        // Update Firestore
        await updateDoc(userDocRef, {
            orders: orders
        });
        await initHistory();
        alert("Order marked as received!");

    } catch (error) {
        console.error("Error marking order as received:", error);
        alert("Failed to update order. Please try again.");
    }
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

async function setRating(index, stars) {
    if (!currentUser) {
        alert("Please log in.");
        return;
    }
    try {
        const userDocRef = doc(db, USERS_COLLECTION, currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            alert("User data not found.");
            return;
        }
        const userData = userDoc.data();
        userData.orders[index].rating = stars;

        await updateDoc(userDocRef, {
            orders: userData.orders
        });
        await initHistory();

    } catch (error) {
        console.error("Error setting rating:", error);
        alert("Failed to save rating. Please try again.");
    }
}
// Make functions globally accessible
window.markReceived = markReceived;
window.setRating = setRating;