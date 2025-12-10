import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    query,
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const USERS_COLLECTION = 'users';
const INVENTORY_COLLECTION = 'inventory';
// Store chart instances to destroy them before recreating
let chartInstances = {
    salesCategoryChart: null,
    topSellingChart: null,
    lowestSellingChart: null,
    dailySalesChart: null
};
async function loadSalesDashboard() {
    try {
        // Fetch all users from Firestore
        const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
        let allOrders = [];
        // Collect all completed/received orders
        usersSnapshot.forEach((doc) => {
            const userData = doc.data();
            
            if (userData.orders && Array.isArray(userData.orders)) {
                userData.orders.forEach(order => {
                    if (order.status === "Completed" || order.status === "Received") {
                        allOrders.push(order);
                    }
                });
            }
        });
        // Fetch inventory for category mapping
        const inventorySnapshot = await getDocs(
            query(collection(db, INVENTORY_COLLECTION), orderBy('id'))
        );
        const inventory = [];
        inventorySnapshot.forEach((doc) => {
            inventory.push(doc.data());
        });
        // Calculate sales metrics
        const totalOrders = allOrders.length;
        let totalItemsSold = 0;
        let totalRevenue = 0;
        let productSales = {};
        let categoryRevenue = {};
        let dailySales = {};

        allOrders.forEach(order => {
            totalRevenue += order.finalTotal || 0;
            // Parse date for daily sales
            if (order.date) {
                let parts = order.date.split("∙");
                let dateKey = `${parts[0]}-${parts[1]}-${parts[2]}`;

                if (!dailySales[dateKey]) dailySales[dateKey] = 0;
                dailySales[dateKey] += order.finalTotal || 0;
            }
            // Process items
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    totalItemsSold += item.quantity || 0;

                    let cleanName = item.name.split("∙")[0].trim();
                    // Track product sales
                    if (!productSales[cleanName]) productSales[cleanName] = 0;
                    productSales[cleanName] += item.quantity || 0;
                    // Find category from inventory
                    const baseName = item.name.split("∙")[0].trim();
                    const found = inventory.find(prod => prod.name === baseName);
                    let category = found ? found.category : "Other";
                    // Track category revenue
                    if (!categoryRevenue[category]) categoryRevenue[category] = 0;
                    categoryRevenue[category] += item.productSubtotal || 0;
                });
            }
        });
        // Find top product
        let topProduct = Object.keys(productSales).sort((a, b) => 
            productSales[b] - productSales[a]
        )[0] || "None";
        // Update dashboard cards
        document.querySelector("#totalOrdersCard p").textContent = totalOrders;
        document.querySelector("#totalItemsSoldCard p").textContent = totalItemsSold;
        document.querySelector("#totalRevenueCard p").textContent = "P " + String(totalRevenue);
        document.querySelector("#avgOrderValueCard p").textContent = totalOrders 
            ? "P " + (totalRevenue / totalOrders).toFixed(2) 
            : "P 0";
        document.querySelector("#topProductCard p").textContent = topProduct;
        // Draw charts
        drawSalesCategoryChart(categoryRevenue);
        drawTopSellingChart(productSales);
        drawLowestSellingChart(productSales);
        drawDailySalesChart(dailySales);
    } catch (error) {
        console.error("Error loading sales dashboard:", error);
        alert("Failed to load sales dashboard. Please refresh the page.");
    }
}
function drawSalesCategoryChart(categoryRevenue) {
    // Destroy existing chart if it exists
    if (chartInstances.salesCategoryChart) {
        chartInstances.salesCategoryChart.destroy();
    }
    chartInstances.salesCategoryChart = new Chart(document.getElementById("salesCategoryChart"), {
        type: "doughnut",
        data: {
            labels: Object.keys(categoryRevenue),
            datasets: [{
                data: Object.values(categoryRevenue),
                backgroundColor: ["#382719ff", "#c0af82ff", "#8b330fff", "#fdbe5eff", "#b6b3adff", "#ffe922ff"]
            }]
        }
    });
}
function drawTopSellingChart(productSales) {
    // Destroy existing chart if it exists
    if (chartInstances.topSellingChart) {
        chartInstances.topSellingChart.destroy();
    }
    const sorted = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const responsiveFontSize = Math.max(8, Math.min(12, window.innerWidth * 0.01));

    chartInstances.topSellingChart = new Chart(document.getElementById("topSellingChart"), {
        type: "bar",
        data: {
            labels: sorted.map(i => i[0]),
            datasets: [{
                label: "Quantity Sold",
                data: sorted.map(i => i[1]),
                backgroundColor: "#382719ff"
            }]
        },
        options: { 
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {  
                legend: {
                    labels: {
                        font: {
                            size: responsiveFontSize
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: responsiveFontSize
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: responsiveFontSize
                        }
                    }
                }
            }
        }
    });
}

function drawLowestSellingChart(productSales) {
    // Destroy existing chart if it exists
    if (chartInstances.lowestSellingChart) {
        chartInstances.lowestSellingChart.destroy();
    }
    // Sort ascending (lowest first) and take bottom 10
    const sorted = Object.entries(productSales).sort((a, b) => a[1] - b[1]).slice(0, 10);

    const responsiveFontSize = Math.max(8, Math.min(12, window.innerWidth * 0.01));

    chartInstances.lowestSellingChart = new Chart(document.getElementById("lowestSellingChart"), {
        type: "bar",
        data: {
            labels: sorted.map(i => i[0]),
            datasets: [{
                label: "Quantity Sold",
                data: sorted.map(i => i[1]),
                backgroundColor: "#8b330fff"
            }]
        },
        options: { 
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {  
                legend: {
                    labels: {
                        font: {
                            size: responsiveFontSize
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: responsiveFontSize
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: responsiveFontSize
                        }
                    }
                }
            }
        }
    });
}
function drawDailySalesChart(dailySales) {
    // Destroy existing chart if it exists
    if (chartInstances.dailySalesChart) {
        chartInstances.dailySalesChart.destroy();
    }
    const labels = Object.keys(dailySales).sort();
    const values = labels.map(k => dailySales[k]);

    const responsiveFontSize = Math.max(8, Math.min(12, window.innerWidth * 0.01));

    chartInstances.dailySalesChart = new Chart(document.getElementById("dailySalesChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Daily Revenue",
                data: values,
                borderColor: "#8b330fff",
                backgroundColor: "#fdbe5e88",
                fill: true,
                tension: 0.2
            }]
        },
        options: { 
            indexAxis: "x",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {  
                legend: {
                    labels: {
                        font: {
                            size: responsiveFontSize
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: responsiveFontSize
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: responsiveFontSize
                        }
                    }
                }
            }
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
document.addEventListener("DOMContentLoaded", loadSalesDashboard);
// Make functions globally accessible
window.loadSalesDashboard = loadSalesDashboard;
window.admin_logout = admin_logout;