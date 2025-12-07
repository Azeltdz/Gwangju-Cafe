document.addEventListener("DOMContentLoaded", initSales);

function initSales() {
    const container = document.getElementById("sales_table");

    if (!container) {
        console.error("ERROR: #sales_table NOT FOUND");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || {};
    let sales = [];

    Object.keys(users).forEach(username => {
        const user = users[username];
        if (!user || !user.orders) return;

        user.orders.forEach((order, orderIndex) => {
            if (order.status === "Completed" || order.status === "Received") {
                order.items.forEach(item => {

                    sales.push({
                        orderId: `ORD-${username}-${orderIndex}`,
                        date: order.date,
                        name: item.name,
                        size: item.size || "",
                        price: item.price,
                        qty: item.quantity,
                        subtotal: item.price * item.quantity
                    });

                });
            }
        });
    });

    renderSalesTable(sales);
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