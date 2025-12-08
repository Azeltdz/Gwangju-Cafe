import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const USERS_COLLECTION = 'users';

async function initSales() {
    const container = document.getElementById("sales_table");
    if (!container) {
        console.error("ERROR: #sales_table NOT FOUND");
        return;
    }
    try {
        // Fetch all users from Firestore
        const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
        let sales = [];
        // Loop through users and collect completed/received orders
        usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            const username = userData.username || userDoc.id;

            if (!userData || !userData.orders || !Array.isArray(userData.orders)) return;

            userData.orders.forEach((order, orderIndex) => {
                if (order.status === "Completed" || order.status === "Received") {
                    
                    if (order.items && Array.isArray(order.items)) {
                        order.items.forEach(item => {
                            sales.push({
                                orderId: `ORD-${username}-${orderIndex}`,
                                date: order.date || 'N/A',
                                name: item.name || 'Unknown',
                                size: item.size || "",
                                price: item.price || 0,
                                qty: item.quantity || 0,
                                subtotal: (item.price || 0) * (item.quantity || 0)
                            });
                        });
                    }
                }
            });
        });
        renderSalesTable(sales);
    } catch (error) {
        console.error("Error loading sales:", error);
        container.innerHTML = "<p>Failed to load sales data. Please refresh the page.</p>";
    }
}
function renderSalesTable(sales) {
    const container = document.getElementById("sales_table");

    let html = `
        <table class="admin_inventory_table">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Product Name</th>
                    <th>Size</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
    `;
    if (sales.length === 0) {
        html += `
            <tr>
                <td colspan="7" style="text-align:center; padding:15px; color:gray;">
                    No sales found.
                </td>
            </tr>
        `;
    } else {
        sales.forEach(item => {
            let productName = (item.name || "")
                .replace("∙", "")
                .replace("•", "")
                .trim();
            let size = item.size || "";

            const sizePatterns = [
                "Tall", "Grande", "Venti",
                "Regular", "Spicy", "Original",
                "Medium", "Large", "XL"
            ];
            sizePatterns.forEach(s => {
                if (productName.toLowerCase().includes(s.toLowerCase())) {
                    size = s;
                    productName = productName
                        .replace(`(${s})`, "")
                        .replace(`-${s}`, "")
                        .replace(`|${s}`, "")
                        .replace(` ${s}`, "")
                        .replace(s, "")
                        .replace("∙", "")
                        .replace("•", "")
                        .trim();
                }
            });
            html += `
                <tr>
                    <td>${item.orderId}</td>
                    <td>${item.date}</td>
                    <td>${productName}</td>
                    <td>${size}</td>
                    <td>${item.qty}</td>
                    <td>P ${item.price.toFixed(2)}</td>
                    <td>P ${item.subtotal.toFixed(2)}</td>
                </tr>
            `;
        });
    }
    html += `
            </tbody>
        </table>
    `;
    container.innerHTML = html;
}
async function admin_logout() {
    try {
        await signOut(auth);
        localStorage.removeItem("currentUser");
        window.location.href = "../../../../../index.html";
    } catch (error) {
        console.error("Error signing out:", error);
        localStorage.removeItem("currentUser");
        window.location.href = "../../../../../index.html";
    }
}
// Load sales when page loads
document.addEventListener("DOMContentLoaded", initSales);
// Make functions globally accessible
window.initSales = initSales;
window.admin_logout = admin_logout;