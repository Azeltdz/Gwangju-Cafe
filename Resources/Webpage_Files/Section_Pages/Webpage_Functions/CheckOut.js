import { db, auth } from './firebase-config.js';
import { 
    collection, 
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const USERS_COLLECTION = 'users';
const shipping_fee = 50;

let currentUser = null;
let userCart = [];

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadCheckoutData();
    } else {
        alert("Please log in first.");
        window.location.href = "../../../../index.html";
    }
});

async function loadCheckoutData() {
    if (!currentUser) return;

    try {
        const userDocRef = doc(db, USERS_COLLECTION, currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            alert("User data not found. Please log in again.");
            window.location.href = "../../../../index.html";
            return;
        }
        const userData = userDoc.data();
        userCart = userData.cart || [];
        // Filter out any free items that shouldn't be in the original cart
        userCart = userCart.filter(item =>
            item.id !== "free_matcha_checkout" &&
            item.id !== "free_matcha" &&
            item.name !== "Free Matcha Latte ∙ Tall"
        );
        displayCheckout();
    } catch (error) {
        console.error("Error loading checkout data:", error);
        alert("Failed to load checkout data. Please try again.");
    }
}

function displayCheckout() {
    const orderItemsEl = document.getElementById("orderItems");
    const itemsTotalEl = document.getElementById("itemsTotal");
    const shippingEl = document.getElementById("shippingFee");
    const finalTotalEl = document.getElementById("finalTotal");

    if (!orderItemsEl || !itemsTotalEl || !shippingEl || !finalTotalEl) {
        console.error("Checkout: Missing required elements.");
        return;
    }
    if (userCart.length === 0) {
        orderItemsEl.innerHTML = "<p>Your cart is empty.</p>";
        itemsTotalEl.textContent = "0.00";
        shippingEl.textContent = "0.00";
        finalTotalEl.textContent = "0.00";
        return;
    }

    // Calculate total items
    const totalItems = userCart.reduce((sum, item) => {
        return sum + (Number(item.quantity) || 1);
    }, 0);
    // Create display cart with free item if eligible
    const displayCart = [...userCart];

    if (totalItems >= 10) {
        displayCart.push({
            id: "free_matcha_checkout",
            name: "Free Matcha Latte ∙ Tall",
            price: 0,
            quantity: 1
        });
    }
    let itemsTotal = 0;
    orderItemsEl.innerHTML = "";

    displayCart.forEach(item => {
        const qty = Number(item.quantity || 1);
        const price = Number(item.price || 0);
        const subtotal = qty * price;
        // Only add to total if not a free item
        if (item.id !== "free_matcha_checkout") {
            itemsTotal += subtotal;
        }
        const row = document.createElement("div");
        row.className = "order_item";
        row.innerHTML = `
            <span>${item.name} x ${qty}</span>
            <span>P ${subtotal.toFixed(2)}</span>
        `;
        orderItemsEl.appendChild(row);
    });
    itemsTotalEl.textContent = `${itemsTotal.toFixed(2)}`;
    shippingEl.textContent = `${shipping_fee.toFixed(2)}`;
    finalTotalEl.textContent = `${(itemsTotal + shipping_fee).toFixed(2)}`;
    // Store display cart for order submission
    window.displayCart = displayCart;
    window.itemsTotal = itemsTotal;
}

async function handlePlaceOrder(e) {
    e.preventDefault();

    if (!currentUser) {
        alert("Please log in first.");
        return;
    }
    if (userCart.length === 0) {
        alert("Your cart is empty.");
        return;
    }
    try {
        const userDocRef = doc(db, USERS_COLLECTION, currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            alert("User data not found.");
            return;
        }
        const userData = userDoc.data();
        const displayCart = window.displayCart || userCart;
        const itemsTotal = window.itemsTotal || 0;
        const order = {
            orderId: Date.now().toString(),
            address: userData.address || "No address provided",
            items: displayCart,
            date: formatOrderDate(new Date()),
            timestamp: new Date().toISOString(),
            total: itemsTotal,
            shippingFee: shipping_fee,
            finalTotal: itemsTotal + shipping_fee,
            status: "Pending",
            rating: 0,
            userId: currentUser.uid,
            userEmail: currentUser.email
        };
        // Update user document with new order and empty cart
        await updateDoc(userDocRef, {
            orders: arrayUnion(order),
            cart: [],
            lastOrderDate: serverTimestamp()
        });
        showReceiptPopup(order);
    } catch (error) {
        console.error("Error placing order:", error);
        alert("Failed to place order. Please try again.");
    }
}

function formatOrderDate(date) {
    const d = new Date(date);

    let month = d.getMonth() + 1;
    let day = d.getDate();
    let year = d.getFullYear();
    let hours = d.getHours();
    let minutes = d.getMinutes().toString().padStart(2, "0");
    let seconds = d.getSeconds().toString().padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${month}∙${day}∙${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
}

function showReceiptPopup(order) {
    const bg = document.createElement("div");
    bg.className = "receipt_popup_bg";

    const popup = document.createElement("div");
    popup.className = "receipt_popup";

    let itemsHTML = "";
    (order.items || []).forEach(item => {
        const qty = Number(item.quantity || 1);
        const price = Number(item.price || 0);
        const subtotal = qty * price;

        itemsHTML += `
            <div class="receipt_row">
                <span>${item.name} x ${qty}</span>
                <span>P ${subtotal.toFixed(2)}</span>
            </div>
        `;
    });
    popup.innerHTML = `
        <h2>Order Receipt</h2>
        <div class="receipt_row">
            <span>Order ID:</span>
            <span>#${order.orderId}</span>
        </div>
        <div class="receipt_row">
            <span>Date:</span>
            <span>${order.date}</span>
        </div>
        <div class="receipt_row">
            <span>Address:</span>
            <span>${order.address}</span>
        </div>
        <hr>
        ${itemsHTML}
        <hr>
        <div class="receipt_row">
            <span>Items Total:</span>
            <span>P ${order.total.toFixed(2)}</span>
        </div>
        <div class="receipt_row">
            <span>Shipping:</span>
            <span>P ${order.shippingFee.toFixed(2)}</span>
        </div>
        <hr>
        <div class="receipt_total">
            <span>Total:</span>
            <span>P ${order.finalTotal.toFixed(2)}</span>
        </div>
        <button id="closeReceipt">OK</button>
    `;

    bg.appendChild(popup);
    document.body.appendChild(bg);
    document.getElementById("closeReceipt").onclick = () => {
        bg.remove();
        window.location.href = "PendingOrders.html";
    };
}
// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    // Set up form submission
    const checkoutForm = document.getElementById("checkoutForm");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", handlePlaceOrder);
    }
    // Set up back button
    const backBtn = document.getElementById("checkoutBackBtn");
    if (backBtn) {
        backBtn.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "Cart.html";
        });
    }
});
// Export for use in other files if needed
export { loadCheckoutData, handlePlaceOrder };