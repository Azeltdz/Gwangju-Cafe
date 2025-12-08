import { db, auth } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const USERS_COLLECTION = 'users';

async function loadAllCustomerOrders() {
    const container = document.getElementById("customer_order_container");
    
    if (!container) {
        console.error("Container element not found");
        return;
    }
    container.innerHTML = "<p>Loading orders...</p>";
    
    try {
        // Fetch all users from Firestore
        const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
        let allOrders = [];
        // Loop through each user and collect non-completed orders
        usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            const username = userData.username || userData.email || userDoc.id;
            const userId = userDoc.id;

            if (userData.orders && Array.isArray(userData.orders)) {
                userData.orders.forEach((order, index) => {
                    if (order.status !== "Completed" && order.status !== "Received") {
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
        // Sort orders by date (most recent first)
        allOrders.sort((a, b) => {
            const dateA = new Date(a.timestamp || a.date);
            const dateB = new Date(b.timestamp || b.date);
            return dateB - dateA;
        });
        container.innerHTML = "";
        // Render each order
        allOrders.forEach((orderObj, displayIndex) => {
            const card = document.createElement("div");
            card.className = "order_card";

            let itemsHTML = "";
            if (orderObj.items && Array.isArray(orderObj.items)) {
                orderObj.items.forEach(item => {
                    const qty = Number(item.quantity || 1);
                    const price = Number(item.price || 0);
                    const subtotal = (price * qty).toFixed(2);
                    itemsHTML += `<li>${item.name} x ${qty} — P ${subtotal}</li>`;
                });
            }
            let customerAddress = 'No address provided';
            if (orderObj.addressDisplay) {
                customerAddress = orderObj.addressDisplay;
            } else if (orderObj.address && typeof orderObj.address === 'object') {
                const a = orderObj.address;
                customerAddress = [
                    a.houseNumber,
                    a.street,
                    a.barangay ? "Brgy. " + a.barangay : null,
                    "San Luis, Batangas, Philippines"
                ].filter(Boolean).join(", ");
            } else if (typeof orderObj.address === 'string') {
                customerAddress = orderObj.address;
            }
            card.innerHTML = `
                <div class="order_header">
                    <span><b>Order: ${orderObj.orderId || 'N/A'}</b></span><br>
                    <span><b>Customer:</b> ${orderObj.username}</span><br>
                </div>
                <p><b>Ordered:</b> ${orderObj.date || 'N/A'}</p>
                <p><b>Address:</b><br> ${customerAddress}</p>
                <p><b>Subtotal:</b> P ${(orderObj.total || 0).toFixed(2)}</p>
                <p><b>Shipping:</b> P ${(orderObj.shippingFee || 0).toFixed(2)}</p>
                <p><b>Total:</b> P ${(orderObj.finalTotal || 0).toFixed(2)}</p>
                <p><b>Items:</b></p>
                <ul class="order_items">${itemsHTML || '<li>No items</li>'}</ul>
                <div class="order_status">
                    <div>
                        <b>Status:</b>
                        <select id="status_display_${displayIndex}">
                            <option value="Pending" ${orderObj.status === "Pending" ? "selected" : ""}>Pending</option>
                            <option value="Preparing" ${orderObj.status === "Preparing" ? "selected" : ""}>Preparing</option>
                            <option value="Out For Delivery" ${orderObj.status === "Out For Delivery" ? "selected" : ""}>Out For Delivery</option>
                            <option value="Completed" ${orderObj.status === "Completed" ? "selected" : ""}>Completed</option>
                        </select>
                    </div>
                    <button class="update_status_btn"
                        onclick="updateOrderStatus('${orderObj.userId}', ${orderObj.orderIndex}, ${displayIndex})">
                        Update Status
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
        const statusDropdown = document.getElementById(`status_display_${displayIndex}`);
        
        if (!statusDropdown) {
            alert("Status dropdown not found.");
            return;
        }
        const newStatus = statusDropdown.value;
        // Get the user document reference
        const userDocRef = doc(db, USERS_COLLECTION, userId);
        // Fetch the current user data using getDoc (not getDocs)
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
            alert("User document not found.");
            return;
        }
        const userData = userDocSnap.data();
        // Validate that the order exists
        if (!userData.orders || !Array.isArray(userData.orders) || !userData.orders[orderIndex]) {
            alert("Order not found.");
            return;
        }
        // Create a copy of the orders array
        const updatedOrders = [...userData.orders];
        // Update the specific order's status
        updatedOrders[orderIndex] = {
            ...updatedOrders[orderIndex],
            status: newStatus,
            statusUpdatedAt: new Date().toISOString()
        };
        // Update Firestore with the modified orders array
        await updateDoc(userDocRef, {
            orders: updatedOrders
        });
        // Show appropriate message
        if (newStatus === "Completed") {
            alert("Order marked as Completed and removed from active orders.");
        } else {
            alert(`Order status updated to: ${newStatus}`);
        }
        // Reload orders to reflect changes
        await loadAllCustomerOrders();
    } catch (error) {
        console.error("Error updating order status:", error);
        alert("Failed to update order status. Please try again.");
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
// Load orders when page loads
document.addEventListener("DOMContentLoaded", loadAllCustomerOrders);
// Make functions globally accessible
window.loadAllCustomerOrders = loadAllCustomerOrders;
window.updateOrderStatus = updateOrderStatus;
window.admin_logout = admin_logout;