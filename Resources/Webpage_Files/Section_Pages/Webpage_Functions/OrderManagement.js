import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const USERS_COLLECTION = 'users';

async function loadAllCustomerOrders() {
    const container = document.getElementById("customer_order_container");
    container.innerHTML = "<p>Loading orders...</p>";
    try {
        // Fetch all users from Firestore
        const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
        let allOrders = [];
        // Loop through each user and collect non-completed orders
        usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            const username = userData.username || userDoc.id;
            const userId = userDoc.id;

            if (userData.orders && Array.isArray(userData.orders)) {
                userData.orders.forEach((order, index) => {
                    if (order.status !== "Completed") {
                        allOrders.push({
                            userId,
                            username,
                            orderIndex: index,
                            ...order
                        });
                    }
                });
            }
        });
        // Check if there are no active orders
        if (allOrders.length === 0) {
            container.innerHTML = "<p>No active orders.</p>";
            return;
        }
        container.innerHTML = "";
        // Render each order
        allOrders.forEach((orderObj, displayIndex) => {
            const card = document.createElement("div");
            card.className = "order_card";

            let itemsHTML = "";
            if (orderObj.items && Array.isArray(orderObj.items)) {
                orderObj.items.forEach(item => {
                    itemsHTML += `<li>${item.name} x ${item.quantity} — P ${item.price}</li>`;
                });
            }
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
                    <span>${orderObj.date || 'N/A'}</span>
                </div>
                <p><b>Address:</b> ${customerAddress}</p>
                <p><b>Total:</b> P ${orderObj.finalTotal || 0}</p>
                <p><b>Items:</b></p>
                <ul class="order_items">${itemsHTML || '<li>No items</li>'}</ul>
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
                        onclick="updateOrderStatus('${orderObj.userId}', ${orderObj.orderIndex}, ${displayIndex})">
                        Update
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading customer orders:", error);
        container.innerHTML = "<p>Failed to load orders. Please refresh the page.</p>";
    }
}

async function updateOrderStatus(userId, orderIndex, displayIndex) {
    try {
        // Get the new status from the dropdown
        const newStatus = document.getElementById(`status_display_${displayIndex}`).value;
        // Get the user document
        const userDocRef = doc(db, USERS_COLLECTION, userId);
        const userSnapshot = await getDocs(collection(db, USERS_COLLECTION));
        
        let userData = null;
        userSnapshot.forEach((doc) => {
            if (doc.id === userId) {
                userData = doc.data();
            }
        });
        if (!userData || !userData.orders || !userData.orders[orderIndex]) {
            alert("Order not found.");
            return;
        }
        // Update the order status
        userData.orders[orderIndex].status = newStatus;
        // Update Firestore
        await updateDoc(userDocRef, {
            orders: userData.orders
        });
        // Show appropriate message
        if (newStatus === "Completed") {
            alert("Order marked Completed and moved out of queue.");
        } else {
            alert("Order status updated.");
        }
        // Reload orders
        await loadAllCustomerOrders();
    } catch (error) {
        console.error("Error updating order status:", error);
        alert("Failed to update order status. Please try again.");
    }
}

function admin_logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../LogIn.html";
}
// Load orders when page loads
document.addEventListener("DOMContentLoaded", loadAllCustomerOrders);
// Make functions globally accessible
window.loadAllCustomerOrders = loadAllCustomerOrders;
window.updateOrderStatus = updateOrderStatus;
window.admin_logout = admin_logout;