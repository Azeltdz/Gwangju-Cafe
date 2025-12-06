let cart = JSON.parse(localStorage.getItem("cart")) || [];

const shipping_fee = 50;

function displayCart() {
    const cartItems = document.getElementById("cart_items");
    const totalBox = document.querySelector(".cart_total");
    const buttonsBox = document.querySelector(".cart_buttons");
    const totalEl = document.getElementById("total");
    const shippingEl = document.getElementById("shipping_fee");
    const finalTotalEl = document.getElementById("final_total");

    if (!cartItems || !totalBox || !buttonsBox || !totalEl || !shippingEl || !finalTotalEl) {
        console.error("Cart: Missing DOM elements.");
        return;
    }

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p style='text-align:center;'>Your cart is empty.</p>";
        totalBox.style.display = "none";
        buttonsBox.style.display = "none";
        return;
    }

    totalBox.style.display = "block";
    buttonsBox.style.display = "flex";

    let total = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        cartItems.innerHTML += `
            <div class="cart_item">
                <div class="cart_item_details">
                    <p>
                        ${item.name} <br><br>
                        Price: P ${item.price} <br>
                        Quantity: ${item.quantity} <br>
                        Subtotal: P ${subtotal.toFixed(2)}
                    </p>
                </div>

                <button class="remove_button" onclick="removeItem(${item.id})">X</button>
            </div>
            <hr>
        `;
    });

    totalEl.textContent = total.toFixed(2);
    shippingEl.textContent = shipping_fee.toFixed(2);
    finalTotalEl.textContent = (total + shipping_fee).toFixed(2);
}

function removeItem(id) {
    const removedItem = cart.find(item => item.id === id);
    if (!removedItem) return;

    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

    const [invName, invSize] = removedItem.name.split(" ∙ ");

    const invIndex = inventory.findIndex(i =>
        i.name === invName.trim() &&
        i.size === invSize.trim()
    );

    if (invIndex !== -1) {
        inventory[invIndex].stock += removedItem.quantity;
        localStorage.setItem("inventory", JSON.stringify(inventory));
    }

    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}

function clearCart() {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    let inventory = JSON.parse(localStorage.getItem("inventory")) || [];

    cart.forEach(item => {
        const [invName, invSize] = item.name.split(" ∙ ");

        const invIndex = inventory.findIndex(i =>
            i.name === invName.trim() &&
            i.size === invSize.trim()
        );

        if (invIndex !== -1) {
            inventory[invIndex].stock += item.quantity;
        }
    });

    localStorage.setItem("inventory", JSON.stringify(inventory));

    cart = [];
    localStorage.removeItem("cart");

    displayCart();
}

function checkout() {
    if (cart.length === 0) return;
    window.location.href = "CheckOut.html";
}

const backBtn = document.querySelector(".back_link");

if (backBtn) {
    backBtn.addEventListener("click", function(e) {
        e.preventDefault();

        const last = localStorage.getItem("lastFlavorPage");

        if (last && !last.includes("CheckOut") && !last.includes("Cart")) {
            window.location.href = last;
        } 
        else {
            window.history.go(-2);
        }
    });
}

displayCart();