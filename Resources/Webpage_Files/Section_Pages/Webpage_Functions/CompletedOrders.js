import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const USERS_COLLECTION = 'users';

async function loadCompletedOrders() {
    const container = document.getElementById("completed_container");
    try {
        // Fetch all users from Firestore
        const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
        let completed = [];
        // Loop through each user and their orders
        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            const username = userData.username || doc.id;
            
            if (userData.orders && Array.isArray(userData.orders)) {
                userData.orders.forEach(order => {
                    if (order.status === "Completed") {
                        completed.push({ 
                            username, 
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
        completed.sort((a, b) => new Date(b.date) - new Date(a.date));
        // Render each completed order
        completed.forEach(order => {
            let itemsHTML = "";
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(i => {
                    itemsHTML += `<li>${i.name} x ${i.quantity} — P ${i.price}</li>`;
                });
            }
            const card = document.createElement("div");
            card.className = "order_card";
            card.innerHTML = `
                <div class="order_header">
                    <span>User: ${order.username}</span>
                    <span>${order.date || 'N/A'}</span>
                </div>
                <p><b>Total:</b> P ${order.finalTotal || 0}</p>
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
function admin_logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../LogIn.html";
}
// Load completed orders when page loads
document.addEventListener("DOMContentLoaded", loadCompletedOrders);
// Make functions globally accessible
window.loadCompletedOrders = loadCompletedOrders;
window.admin_logout = admin_logout;