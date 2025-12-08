import { db, auth } from './firebase-config.js';
import { 
    collection, 
    getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const USERS_COLLECTION = 'users';

async function loadCompletedOrders() {
    const container = document.getElementById("completed_container");
    
    if (!container) {
        console.error("Completed container element not found");
        return;
    }
    container.innerHTML = "<p>Loading completed orders...</p>";
    
    try {
        // Fetch all users from Firestore
        const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
        let completed = [];
        // Loop through each user and their orders
        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            const username = userData.username || userData.email || doc.id;
            const userId = doc.id;
            
            if (userData.orders && Array.isArray(userData.orders)) {
                userData.orders.forEach((order, index) => {
                    // Include both "Completed" and "Received" orders
                    if (order.status === "Completed" || order.status === "Received") {
                        completed.push({ 
                            userId,
                            username,
                            orderIndex: index,
                            ...order 
                        });
                    }
                });
            }
        });
        // Check if there are no completed orders
        if (completed.length === 0) {
            container.innerHTML = "<p>No completed orders yet.</p>";
            return;
        }
        // Clear container
        container.innerHTML = "";
        // Sort by date (most recent first)
        completed.sort((a, b) => {
            const dateA = new Date(a.timestamp || a.date);
            const dateB = new Date(b.timestamp || b.date);
            return dateB - dateA;
        });
        // Render each completed order
        completed.forEach(order => {
            let itemsHTML = "";
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(i => {
                    const qty = Number(i.quantity || 1);
                    const price = Number(i.price || 0);
                    const subtotal = (price * qty).toFixed(2);
                    itemsHTML += `<li>${i.name} x ${qty} — P ${subtotal}</li>`;
                });
            }
            let fullAddress = 'No address provided';
            if (order.addressDisplay) {
                fullAddress = order.addressDisplay;
            } else if (order.address && typeof order.address === 'object') {
                const a = order.address;
                fullAddress = [
                    a.houseNumber,
                    a.street,
                    a.barangay ? "Brgy. " + a.barangay : null,
                    "San Luis, Batangas, Philippines"
                ].filter(Boolean).join(", ");
            } else if (typeof order.address === 'string') {
                fullAddress = order.address;
            }
            const card = document.createElement("div");
            card.className = "order_card";
            // Add status-specific styling
            const statusClass = order.status.toLowerCase();
            card.classList.add(`status_${statusClass}`);
            // Determine status badge color/style
            const statusBadge = order.status === "Received" 
                ? `<span class="status_badge received">✓ Received by Customer</span>`
                : `<span class="status_badge completed">Completed</span>`;
            card.innerHTML = `
                <div class="order_header">
                    <div>
                        <span><b>Order ${order.orderId || 'N/A'}</b></span>
                        ${statusBadge}
                    </div>
                    <span><b>Customer:</b> ${order.username}</span>
                </div>
                <p><b>Ordered:</b> ${order.date || 'N/A'}</p>
                ${order.receivedAt ? `<p><b>Received:</b> ${new Date(order.receivedAt).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '-')}</p>` : ''}
                <p><b>Address:</b> ${fullAddress || 'No address provided'}</p>
                <p><b>Subtotal:</b> P ${(order.total || 0).toFixed(2)}</p>
                <p><b>Shipping:</b> P ${(order.shippingFee || 0).toFixed(2)}</p>
                <p><b>Total:</b> P ${(order.finalTotal || 0).toFixed(2)}</p>
                ${order.rating > 0 ? `<p><b>Rating:</b> <span class="safe-font">${'⭐'.repeat(order.rating)} (${order.rating}/5)</span></p>` : ''}
                <p><b>Items:</b></p>
                <ul class="order_items">${itemsHTML || '<li>No items</li>'}</ul>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading completed orders:", error);
        container.innerHTML = "<p>Failed to load completed orders. Please refresh the page.</p>";
    }
}
async function admin_logout() {
    try {
        await signOut(auth);
        window.location.href = "../../../../../index.html";
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Logout failed. Redirecting anyway...");
        window.location.href = "../../../../../index.html";
    }
}
// Load completed orders when page loads
document.addEventListener("DOMContentLoaded", loadCompletedOrders);
// Make functions globally accessible
window.loadCompletedOrders = loadCompletedOrders;
window.admin_logout = admin_logout;