document.addEventListener("DOMContentLoaded", loadSalesDashboard);

function loadSalesDashboard() {
    const users = JSON.parse(localStorage.getItem("users")) || {};
    let allOrders = [];

    Object.values(users).forEach(user => {
        if (!user.orders) return;
        user.orders.forEach(order => {
            if (order.status === "Completed" || order.status === "Received") {
                allOrders.push(order);
            }
        });
    });

    const totalOrders = allOrders.length;
    let totalItemsSold = 0;
    let totalRevenue = 0;

    let productSales = {};
    let categoryRevenue = {};
    let dailySales = {};

    allOrders.forEach(order => {
        totalRevenue += order.finalTotal;

        let parts = order.date.split("∙");
        let dateKey = `${parts[0]}-${parts[1]}-${parts[2]}`;

        if (!dailySales[dateKey]) dailySales[dateKey] = 0;
        dailySales[dateKey] += order.finalTotal;

        order.items.forEach(item => {
            totalItemsSold += item.quantity;

            let cleanName = item.name.split("∙")[0].trim();

            if (!productSales[cleanName]) productSales[cleanName] = 0;
            productSales[cleanName] += item.quantity;

            const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
            const baseName = item.name.split("∙")[0].trim();
            const found = inventory.find(prod => prod.name === baseName);
            let category = found ? found.category : "Other";

            if (!categoryRevenue[category]) categoryRevenue[category] = 0;
            categoryRevenue[category] += item.productSubtotal;
        });
    });

    let topProduct = Object.keys(productSales).sort((a,b) => productSales[b] - productSales[a])[0] || "None";

    document.querySelector("#totalOrdersCard p").textContent = totalOrders;
    document.querySelector("#totalItemsSoldCard p").textContent = totalItemsSold;
    document.querySelector("#totalRevenueCard p").textContent = "P " + String(totalRevenue);
    document.querySelector("#avgOrderValueCard p").textContent = totalOrders ? "P " + (totalRevenue / totalOrders).toFixed(2) : "P 0";
    document.querySelector("#topProductCard p").textContent = topProduct;

    drawSalesCategoryChart(categoryRevenue);
    drawTopSellingChart(productSales);
    drawDailySalesChart(dailySales);
}

function drawSalesCategoryChart(categoryRevenue) {
    new Chart(document.getElementById("salesCategoryChart"), {
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
    const sorted = Object.entries(productSales).sort((a,b) => b[1] - a[1]).slice(0, 10);

    new Chart(document.getElementById("topSellingChart"), {
        type: "bar",
        data: {
            labels: sorted.map(i => i[0]),
            datasets: [{
                label: "Quantity Sold",
                data: sorted.map(i => i[1]),
                backgroundColor: "#382719ff"
            }]
        },
        options: { indexAxis: "y" }
    });
}

function drawDailySalesChart(dailySales) {
    const labels = Object.keys(dailySales).sort();
    const values = labels.map(k => dailySales[k]);

    new Chart(document.getElementById("dailySalesChart"), {
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
        }
    });
}