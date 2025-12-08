import { db, auth } from './firebase-config.js';
import { 
    doc,
    getDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const USERS_COLLECTION = 'users';

let currentUser = null;
let unsubscribeSnapshot = null;

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await initPending();
    } else {
        currentUser = null;
        displayLoginRequired();
    }
});

function displayLoginRequired() {
    const container = document.getElementById("order_container");
    if (!container) return;

    container.innerHTML = `
        <p>You are not logged in.
            <a href="../../../../index.html">Log in</a>
            to view your orders.
        </p>`;
}

async function initPending() {
    const container = document.getElementById("order_container");

    if (!container) {
        console.error("Order container element not found");
        return;
    }
    if (!currentUser) {
        displayLoginRequired();
        return;
    }
    container.innerHTML = `
        <div id="orders_list">
            <p>Loading orders...</p>
        </div>
    `;
    try {
        const userDocRef = doc(db, USERS_COLLECTION, currentUser.uid);
        // Set up real-time listener for order updates
        unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                const orders = userData.orders || [];
                
                // Filter for pending orders (not Completed or Received)
                const pendingOrders = orders.filter(o =>
                    o.status !== "Completed" && o.status !== "Received"
                ).reverse(); // Most recent first

                displayPending(pendingOrders);
            } else {
                container.innerHTML = `<p>User data not found.</p>`;
            }
        }, (error) => {
            console.error("Error listening to orders:", error);
            container.innerHTML = `
                <p>Failed to load orders. Please try again.</p>
                <button onclick="window.location.reload()">Refresh</button>
            `;
        });
    } catch (error) {
        console.error("Error initializing pending orders:", error);
        container.innerHTML = `
            <p>Failed to load orders. Please try again.</p>
            <button onclick="window.location.reload()">Refresh</button>
        `;
    }
}

function displayPending(orders) {
    const container = document.getElementById("order_container");
    
    if (!container) return;
    // Create or get the orders list element
    let list = document.getElementById("orders_list");
    if (!list) {
        container.innerHTML = `<div id="orders_list"></div>`;
        list = document.getElementById("orders_list");
    }
    if (orders.length === 0) {
        list.innerHTML = `
            <div class="no_orders">
                <p>No pending orders.</p>
                <a href="Home.html" class="browse_menu_btn">Browse Menu</a>
            </div>
        `;
        return;
    }
    list.innerHTML = "";

    orders.forEach(order => {
        const itemsHtml = order.items.map(i => {
            const qty = Number(i.quantity || 1);
            const price = Number(i.price || 0);
            const subtotal = (price * qty).toFixed(2);
            
            return `${i.name} x ${qty} — P ${subtotal}`;
        }).join("<br>");

        const card = document.createElement("div");
        card.className = "order_card";
        // Add status-specific styling
        const statusClass = order.status.toLowerCase().replace(/\s+/g, '_');
        card.classList.add(`status_${statusClass}`);

        card.innerHTML = `
            <div class="order_header">
                <p><strong>Order ID: ${order.orderId}</strong></p>
            </div>
            <p class="order_date"><strong>Date Ordered:</strong> ${order.date}</p>
            <div class="order_items">
                <strong>Items:</strong>
                <div class="items_list">${itemsHtml}</div>
            </div>
            <div class="order_footer">
                <div class="order_totals">
                    <p><strong>Subtotal:</strong> P ${order.total.toFixed(2)}</p>
                    <p><strong>Shipping:</strong> P ${order.shippingFee.toFixed(2)}</p>
                    <p class="order_final_total"><strong>Total:</strong> P ${order.finalTotal.toFixed(2)}</p>
                    <span class="status_badge ${statusClass}">Status: ${order.status}</span>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}
// Clean up listener when page is unloaded
window.addEventListener('beforeunload', () => {
    if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
    }
});
// Initialize on DOM load
document.addEventListener("DOMContentLoaded", () => {
    // If user is already authenticated, init will be called by onAuthStateChanged
    // Otherwise, wait for authentication
    if (!currentUser) {
        const container = document.getElementById("order_container");
        if (container) {
            container.innerHTML = `
                <div id="orders_list">
                    <p>Checking authentication...</p>
                </div>
            `;
        }
    }
});
// Export functions if needed
export { initPending, displayPending };