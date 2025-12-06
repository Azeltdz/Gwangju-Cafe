document.addEventListener("DOMContentLoaded", () => {
    const isProductPage = document.querySelector("#pageCategory");

    if (isProductPage) {
        localStorage.setItem("lastFlavorPage", window.location.href);
    }
});

function menuGetInventory() {
    return JSON.parse(localStorage.getItem("inventory")) || [];
}

function menuSaveInventory(inventory) {
    localStorage.setItem("inventory", JSON.stringify(inventory));
}

function menuFindInventoryItem(flavor, size) {
    const inventory = menuGetInventory();

    return inventory.find(i =>
        i.name.toLowerCase() === flavor.toLowerCase() &&
        i.size.toLowerCase() === size.toLowerCase()
    ) || null;
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const shipping_fee = 50;

document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.querySelector(".add_to_cart");
    if (!addBtn) return;

    addBtn.addEventListener("click", function () {

        const flavor = document.querySelector(".flavor")?.value || "";
        const sizeOption = document.querySelector(".size_select")?.selectedOptions[0];
        const size = sizeOption ? sizeOption.value : "";

        const qtyInput = document.querySelector(".quantity input") || document.querySelector(".quantity_input");
        const quantity = parseInt(qtyInput?.value || 1);

        const invItem = menuFindInventoryItem(flavor, size);

        if (!invItem) {
            alert(`Item not found in inventory: ${flavor} (${size})`);
            return;
        }

        if (invItem.stock < quantity) {
            alert(`${invItem.name} (${invItem.size}) has only ${invItem.stock} left.`);
            return;
        }

        const price = invItem.price;
        const productSubtotal = price * quantity;
        const subtotal = productSubtotal + shipping_fee;

        const item = {
            id: Date.now(),
            name: `${invItem.name} ∙ ${invItem.size}`,
            price,
            quantity,
            productSubtotal,
            shipping: shipping_fee,
            subtotal
        };

        cart.push(item);
        localStorage.setItem("cart", JSON.stringify(cart));

        invItem.stock -= quantity;

        let inventory = menuGetInventory();

        const index = inventory.findIndex(i =>
            i.name.toLowerCase() === invItem.name.toLowerCase() &&
            i.size.toLowerCase() === invItem.size.toLowerCase()
        );

        if (index !== -1) {
            inventory[index] = invItem;
            menuSaveInventory(inventory);
        }

        const stockDisplay = document.querySelector("#inv_stock_display");
        if (stockDisplay) stockDisplay.textContent = `Stock: ${invItem.stock}`;

        flyToCart(this);
    });

    function updateProductDisplay() {
        const flavor = document.querySelector(".flavor")?.value;
        const size = document.querySelector(".size_select")?.value;

        const invItem = menuFindInventoryItem(flavor, size);

        const stockEl = document.querySelector("#inv_stock_display");

        if (invItem) {
            if (stockEl) stockEl.textContent = `Stock: ${invItem.stock}`;
        } else {
            if (stockEl) stockEl.textContent = `Stock: --`;
        }
    }

    document.querySelector(".flavor")?.addEventListener("change", updateProductDisplay);
    document.querySelector(".size_select")?.addEventListener("change", updateProductDisplay);

    updateProductDisplay();
});

function flyToCart(button) {
    const cartRect = { top: 20, left: window.innerWidth / 2 - 40 };

    const btnRect = button.getBoundingClientRect();
    const startX = btnRect.left + btnRect.width / 2 - 40; 
    const startY = btnRect.top + btnRect.height / 2 - 40;

    const clone = document.createElement("div");
    clone.className = "fly";

    clone.style.left = startX + "px";
    clone.style.top = startY + "px";

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
        clone.style.transition = "transform 2s ease-in-out, opacity 2s ease-in-out";
        clone.style.transform = `translate(${cartRect.left - startX}px, ${cartRect.top - startY}px) scale(0.2)`; 
        clone.style.opacity = "0";
    });

    setTimeout(() => clone.remove(), 2000);
}