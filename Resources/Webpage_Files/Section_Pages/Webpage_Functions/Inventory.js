document.addEventListener("DOMContentLoaded", initInventory);

function daysUntilExpired(dateStr) {
    if (!dateStr) return Infinity;
    const now = new Date();
    const exp = new Date(dateStr);
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

function initInventory() {
    const container = document.getElementById("inventory_table");
    if (!container) return console.error("ERROR: #inventory_table NOT FOUND");

    const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    renderInventoryTable(inventory);
}

function renderInventoryTable(inventory) {
    const container = document.getElementById("inventory_table");

    let html = `
        <table class="admin_inventory_table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Added</th>
                    <th>Expiration</th>
                    <th>Days Left</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (inventory.length === 0) {
        html += `
            <tr>
                <td colspan="10" style="text-align:center; padding:15px; color:gray;">
                    No items in inventory.
                </td>
            </tr>`;
    } else {
        inventory.forEach((item, index) => {
            const daysLeft = daysUntilExpired(item.expirationDate);

            let rowColor = "";
            if (daysLeft <= 0) rowColor = `style="background:#ffb3b3"`;  
            else if (daysLeft <= 7) rowColor = `style="background:#ffe5b3"`; 

            html += `
                <tr ${rowColor}>
                    <td>${item.id}</td>

                    <td><input type="text" value="${item.name}" data-field="name" class="inventory_input"></td>
                    <td><input type="text" value="${item.category}" data-field="category" class="inventory_input"></td>
                    <td><input type="text" value="${item.size}" data-field="size" class="inventory_input"></td>

                    <td><input type="number" value="${item.price}" data-field="price" class="inventory_input"></td>
                    <td><input type="number" value="${item.stock}" data-field="stock" class="inventory_input"></td>

                    <td><input type="date" value="${item.addedDate}" data-field="addedDate" class="inventory_input"></td>
                    <td><input type="date" value="${item.expirationDate}" data-field="expirationDate" class="inventory_input"></td>

                    <td>${daysLeft <= 0 ? "Expired" : daysLeft}</td>

                    <td>
                        <button class="update_button" onclick="updateItem(${index})">Update</button>
                        <button class="delete_button" onclick="deleteInventoryItem(${index})">Delete</button>
                    </td>
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

function updateItem(index) {
    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    if (!inventory[index]) return;

    const row = document.querySelectorAll("tbody tr")[index];
    const inputs = row.querySelectorAll(".inventory_input");

    inputs.forEach(input => {
        const field = input.dataset.field;
        let value = input.value.trim();

        if (field === "price" || field === "stock") value = Number(value);

        inventory[index][field] = value;
    });

    localStorage.setItem("inventory", JSON.stringify(inventory));
    renderInventoryTable(inventory);
    alert("Item updated successfully!");
}

function addInventoryItem() {
    const name = prompt("Item name:");
    if (!name) return;

    const category = prompt("Category:") || "Uncategorized";
    const size = prompt("Size:") || "Default";
    const price = Number(prompt("Price:") || 0);
    const stock = Number(prompt("Stock quantity:") || 0);

    const addedDate = new Date().toISOString().split("T")[0];
    let expirationDate = prompt("Expiration date (YYYY-MM-DD):") || addedDate;

    const inventory = JSON.parse(localStorage.getItem("inventory")) || [];

    inventory.push({
        id: Date.now(),
        name,
        category,
        size,
        price,
        stock,
        addedDate,
        expirationDate
    });

    localStorage.setItem("inventory", JSON.stringify(inventory));
    renderInventoryTable(inventory);
}

function deleteInventoryItem(index) {
    const inventory = JSON.parse(localStorage.getItem("inventory")) || [];
    if (!confirm("Remove this item from inventory?")) return;

    inventory.splice(index, 1);
    localStorage.setItem("inventory", JSON.stringify(inventory));
    renderInventoryTable(inventory);
}

function generateInventory() {
    let inventory = [];
    let id = 1;

    const randomStock = () => Math.floor(Math.random() * 61);
    const today = new Date().toISOString().split("T")[0];

    function assignExpiration(category) {
        let exp = new Date();
        if (category === "Coffee") exp.setDate(exp.getDate() + 30);
        else if (category === "Non-Coffee") exp.setDate(exp.getDate() + 20);
        else if (category === "Secret Menu") exp.setDate(exp.getDate() + 25);
        else if (category === "Pastries") exp.setDate(exp.getDate() + 5);
        else if (category === "Takoyaki") exp.setDate(exp.getDate() + 3);
        else if (category === "Ramen") exp.setDate(exp.getDate() + 2);
        else exp.setDate(exp.getDate() + 30);

        return exp.toISOString().split("T")[0];
    }

    const coffee = [
        "Iced Americano", "Iced Latte", "Iced Mochaccino", "Coffee Jelly",
        "Iced Salted Caramel", "Iced Matcha Espresso", "Iced Almond Macchiatto",
        "Iced Caramel Macchiatto", "Iced Hazelnut Macchiatto", "Iced Spanish Latte"
    ];

    const sizes3 = [
        { size: "Tall", price: 49 },
        { size: "Grande", price: 59 },
        { size: "Venti", price: 79 }
    ];

    coffee.forEach(name =>
        sizes3.forEach(s =>
            inventory.push({
                id: id++,
                name,
                category: "Coffee",
                size: s.size,
                price: s.price,
                stock: randomStock(),
                addedDate: today,
                expirationDate: assignExpiration("Coffee")
            })
        )
    );

    const espressoNonCoffee = [
        "Americano", "Mochaccino", "Salted Caramel",
        "Matcha Espresso", "Hazelnut Macchiatto", "Caramel Macchiatto"
    ];

    const sizes2 = [
        { size: "Tall", price: 49 },
        { size: "Grande", price: 59 }
    ];

    espressoNonCoffee.forEach(name =>
        sizes2.forEach(s =>
            inventory.push({
                id: id++,
                name,
                category: "Non-Coffee",
                size: s.size,
                price: s.price,
                stock: randomStock(),
                addedDate: today,
                expirationDate: assignExpiration("Non-Coffee")
            })
        )
    );

    const latteSeries = [
        "Blueberry Latte", "Strawberry Latte", "Matcha Latte",
        "Green Apple Latte", "Mango Latte", "Lychee Latte",
        "Choco Lava Latte", "Honey Peach Latte"
    ];

    latteSeries.forEach(name =>
        sizes3.forEach(s =>
            inventory.push({
                id: id++,
                name,
                category: "Non-Coffee",
                size: s.size,
                price: s.price,
                stock: randomStock(),
                addedDate: today,
                expirationDate: assignExpiration("Non-Coffee")
            })
        )
    );

    const fruitTea = [
        "Lychee Fruit Tea","Blueberry Fruit Tea","Strawberry Fruit Tea",
        "Honey Peach Fruit Tea","Mango Fruit Tea","Green Apple Fruit Tea"
    ];

    fruitTea.forEach(name =>
        sizes3.forEach(s =>
            inventory.push({
                id: id++,
                name,
                category: "Non-Coffee",
                size: s.size,
                price: s.price,
                stock: randomStock(),
                addedDate: today,
                expirationDate: assignExpiration("Non-Coffee")
            })
        )
    );

    const milkSoda = [
        "Strawberry Milk Soda","Blueberry Milk Soda","Green Apple Soda",
        "Strawberry Soda","Blueberry Soda","Honey Peach Soda"
    ];

    milkSoda.forEach(name =>
        sizes3.forEach(s =>
            inventory.push({
                id: id++,
                name,
                category: "Secret Menu",
                size: s.size,
                price: s.price,
                stock: randomStock(),
                addedDate: today,
                expirationDate: assignExpiration("Secret Menu")
            })
        )
    );

    const premiumLatte = [
        "Strawberry Oreo Latte","Oreo Latte","Berry Matcha",
        "Chocolate Strawberry","Strawberry Macchiato","Red Velvet Macchiato"
    ];

    premiumLatte.forEach(name =>
        sizes3.forEach(s =>
            inventory.push({
                id: id++,
                name,
                category: "Secret Menu",
                size: s.size,
                price: s.price,
                stock: randomStock(),
                addedDate: today,
                expirationDate: assignExpiration("Secret Menu")
            })
        )
    );

    const biscoffSeries = [
        "Biscoff Latte","Biscoff Matcha Latte","Biscoff Oreo Latte","Biscoff Iced Coffee"
    ];

    const grandeOnly = [{ size: "Grande", price: 59 }];

    biscoffSeries.forEach(name =>
        grandeOnly.forEach(s =>
            inventory.push({
                id: id++,
                name,
                category: "Secret Menu",
                size: s.size,
                price: s.price,
                stock: randomStock(),
                addedDate: today,
                expirationDate: assignExpiration("Secret Menu")
            })
        )
    );

    const pastries = [
        "Classic Cinnamon","Cream Cheese Glazed","Caramel Pecan",
        "Classic Chocolate Cake","Red Velvet Cake","Coffee Cake"
    ];

    const pastriesSize = [{ size: "Regular", price: 65 }];

    pastries.forEach(name =>
        pastriesSize.forEach(s =>
            inventory.push({
                id: id++,
                name,
                category: "Pastries",
                size: s.size,
                price: s.price,
                stock: randomStock(),
                addedDate: today,
                expirationDate: assignExpiration("Pastries")
            })
        )
    );

    const takoyaki = ["Classic Takoyaki","Shrimp Takoyaki","Bacon Takoyaki"];
    const takoyakiReg = [{ size: "Regular", price: 120 }];
    const takoyakiSpicy = [{ size: "Spicy", price: 130 }];

    takoyaki.forEach(name =>
        takoyakiReg.forEach(s =>
            inventory.push({
                id: id++,
                name,
                category: "Takoyaki",
                size: s.size,
                price: s.price,
                stock: randomStock(),
                addedDate: today,
                expirationDate: assignExpiration("Takoyaki")
            })
        )
    );

    takoyaki.forEach(name =>
        takoyakiSpicy.forEach(s =>
            inventory.push({
                id: id++,
                name,
                category: "Takoyaki",
                size: s.size,
                price: s.price,
                stock: randomStock(),
                addedDate: today,
                expirationDate: assignExpiration("Takoyaki")
            })
        )
    );

    const chickenRamen = [
        { size: "Original", price: 190 },
        { size: "Spicy", price: 200 }
    ];

    chickenRamen.forEach(s =>
        inventory.push({
            id: id++,
            name: "Chicken Ramen",
            category: "Ramen",
            size: s.size,
            price: s.price,
            stock: randomStock(),
            addedDate: today,
            expirationDate: assignExpiration("Ramen")
        })
    );

    const beefRamen = [
        { size: "Original", price: 220 },
        { size: "Spicy", price: 230 }
    ];

    beefRamen.forEach(s =>
        inventory.push({
            id: id++,
            name: "Beef Ramen",
            category: "Ramen",
            size: s.size,
            price: s.price,
            stock: randomStock(),
            addedDate: today,
            expirationDate: assignExpiration("Ramen")
        })
    );

    localStorage.setItem("inventory", JSON.stringify(inventory));
    alert("FULL INVENTORY GENERATED (WITH EXPIRATION DATES)!");
}

function admin_logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "../LogIn.html";
}
