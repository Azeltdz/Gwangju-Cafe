import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const USERS_COLLECTION = 'users';

let allSales = [];
let displayedCount = 0;
const ITEMS_PER_LOAD = 10;
const ITEMS_AFTER_FIRST = 20;

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
    allSales = sales;
    displayedCount = 0;
    
    const container = document.getElementById("sales_table");
    
    // Create initial table structure
    container.innerHTML = `
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
            <tbody id="sales_tbody">
            </tbody>
        </table>
        <div id="load_more_container" style="text-align: center; margin-top: 20px;"></div>
    `;
    
    if (sales.length === 0) {
        document.getElementById("sales_tbody").innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:15px; color:gray;">
                    No sales found.
                </td>
            </tr>
        `;
        return;
    }
    
    // Load first batch
    loadMoreSales();
}

function loadMoreSales() {
    const tbody = document.getElementById("sales_tbody");
    const loadMoreContainer = document.getElementById("load_more_container");
    
    // Determine how many items to load
    const itemsToLoad = displayedCount === 0 ? ITEMS_PER_LOAD : ITEMS_AFTER_FIRST;
    const startIndex = displayedCount;
    const endIndex = Math.min(startIndex + itemsToLoad, allSales.length);
    
    // Add new rows
    for (let i = startIndex; i < endIndex; i++) {
        const item = allSales[i];
        
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
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.orderId}</td>
            <td>${item.date}</td>
            <td>${productName}</td>
            <td>${size}</td>
            <td>${item.qty}</td>
            <td>P ${item.price.toFixed(2)}</td>
            <td>P ${item.subtotal.toFixed(2)}</td>
        `;
        
        tbody.appendChild(row);
    }
    
    displayedCount = endIndex;
    
    // Update or remove "Load More" button
    if (displayedCount < allSales.length) {
        const remaining = allSales.length - displayedCount;
        const nextLoad = Math.min(ITEMS_AFTER_FIRST, remaining);
        
        loadMoreContainer.innerHTML = `
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                <button class="load_more_button" onclick="loadMoreSales()">
                    Load More (${nextLoad} of ${remaining} remaining)
                </button>
                <button class="load_all_button" onclick="loadAllSales()">
                    Load All (${remaining} remaining)
                </button>
            </div>
        `;
    } else {
        loadMoreContainer.innerHTML = `
            <p style="color: #666; font-style: italic;">All ${allSales.length} sales loaded</p>
        `;
    }
}

function loadAllSales() {
    const tbody = document.getElementById("sales_tbody");
    const loadMoreContainer = document.getElementById("load_more_container");
    
    const startIndex = displayedCount;
    const endIndex = allSales.length;
    
    // Add all remaining rows
    for (let i = startIndex; i < endIndex; i++) {
        const item = allSales[i];
        
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
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.orderId}</td>
            <td>${item.date}</td>
            <td>${productName}</td>
            <td>${size}</td>
            <td>${item.qty}</td>
            <td>P ${item.price.toFixed(2)}</td>
            <td>P ${item.subtotal.toFixed(2)}</td>
        `;
        
        tbody.appendChild(row);
    }
    
    displayedCount = endIndex;
    
    // Show completion message
    loadMoreContainer.innerHTML = `
        <p style="color: #666; font-style: italic;">All ${allSales.length} sales loaded</p>
    `;
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
window.loadMoreSales = loadMoreSales;
window.loadAllSales = loadAllSales;
window.admin_logout = admin_logout;