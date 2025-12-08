import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    query,
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const INVENTORY_COLLECTION = 'inventory';

// Store chart instances to destroy them before recreating
let chartInstances = {
    categoryChart: null,
    topStockChart: null,
    lowStockChart: null,
    valueChart: null
};

function daysUntilExpired(dateStr) {
    const now = new Date();
    const exp = new Date(dateStr);
    const diff = exp - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

async function loadDashboard() {
    try {
        // Fetch inventory from Firestore
        const inventorySnapshot = await getDocs(
            query(collection(db, INVENTORY_COLLECTION), orderBy('id'))
        );
        
        const inventory = [];
        inventorySnapshot.forEach((doc) => {
            inventory.push({
                docId: doc.id,
                ...doc.data()
            });
        });
        // Calculate dashboard metrics
        const totalItems = inventory.length;
        const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
        const lowStock = inventory.filter(item => item.stock <= 10);
        const totalValue = inventory.reduce((sum, item) => sum + (item.stock * item.price), 0);
        const expired = inventory.filter(item =>
            item.expirationDate && daysUntilExpired(item.expirationDate) <= 0
        );
        const expiringSoon = inventory.filter(item => {
            if (!item.expirationDate) return false;
            const days = daysUntilExpired(item.expirationDate);
            return days > 0 && days <= 7;
        });
        // Update dashboard cards
        document.querySelector("#totalItemsCard p").textContent = totalItems;
        document.querySelector("#totalStockCard p").textContent = totalStock;
        document.querySelector("#lowStockCard p").textContent = lowStock.length;
        document.querySelector("#totalValueCard p").textContent = "P " + totalValue;
        document.querySelector("#expirationCard p").textContent =
            `Expired: ${expired.length} ∙ Soon: ${expiringSoon.length}`;
        // Draw charts
        drawCategoryChart(inventory);
        drawTopStockChart(inventory);
        drawLowStockChart(inventory);
        drawValueChart(inventory);
    } catch (error) {
        console.error("Error loading dashboard:", error);
        
        // Only show alert if it's not a Chart.js reuse error
        if (!error.message.includes('Canvas is already in use')) {
            alert("Failed to load dashboard data. Please refresh the page.");
        }
    }
}
function drawLowStockChart(inventory) {
    // Destroy existing chart if it exists
    if (chartInstances.lowStockChart) {
        chartInstances.lowStockChart.destroy();
    }
    const lowest15 = [...inventory].sort((a, b) => a.stock - b.stock).slice(0, 15);

    chartInstances.lowStockChart = new Chart(document.getElementById("lowStockChart"), {
        type: "bar",
        data: {
            labels: lowest15.map(i => `${i.name} (${i.size})`),
            datasets: [{
                label: "Stock",
                data: lowest15.map(i => i.stock),
                backgroundColor: "#382719ff"
            }]
        },
        options: { indexAxis: "y" }
    });
}

function drawCategoryChart(inventory) {
    // Destroy existing chart if it exists
    if (chartInstances.categoryChart) {
        chartInstances.categoryChart.destroy();
    }
    const categories = {};
    inventory.forEach(item => {
        if (!categories[item.category]) categories[item.category] = 0;
        categories[item.category]++;
    });
    chartInstances.categoryChart = new Chart(document.getElementById("categoryChart"), {
        type: "doughnut",
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ["#382719ff", "#c0af82ff", "#8b330fff", "#fdbe5eff", "#b6b3adff", "#ffe922ff"]
            }]
        }
    });
}
function drawTopStockChart(inventory) {
    // Destroy existing chart if it exists
    if (chartInstances.topStockChart) {
        chartInstances.topStockChart.destroy();
    }
    const top15 = [...inventory].sort((a, b) => b.stock - a.stock).slice(0, 15);

    chartInstances.topStockChart = new Chart(document.getElementById("topStockChart"), {
        type: "bar",
        data: {
            labels: top15.map(i => `${i.name} (${i.size})`),
            datasets: [{
                label: "Stock",
                data: top15.map(i => i.stock),
                backgroundColor: "#382719ff"
            }]
        },
        options: { indexAxis: "y" }
    });
}
function drawValueChart(inventory) {
    // Destroy existing chart if it exists
    if (chartInstances.valueChart) {
        chartInstances.valueChart.destroy();
    }
    const valueMap = {};
    inventory.forEach(item => {
        if (!valueMap[item.category]) valueMap[item.category] = 0;
        valueMap[item.category] += item.stock * item.price;
    });
    chartInstances.valueChart = new Chart(document.getElementById("valueChart"), {
        type: "bar",
        data: {
            labels: Object.keys(valueMap),
            datasets: [{
                label: "₱ Value",
                data: Object.values(valueMap),
                backgroundColor: ["#382719ff", "#c0af82ff", "#8b330fff", "#fdbe5eff", "#b6b3adff", "#ffe922ff"]
            }]
        },
        options: {
            scales: { y: { beginAtZero: true } }
        }
    });
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
// Load dashboard when page loads
document.addEventListener("DOMContentLoaded", loadDashboard);
// Make loadDashboard globally accessible if needed
window.loadDashboard = loadDashboard;
window.admin_logout = admin_logout;