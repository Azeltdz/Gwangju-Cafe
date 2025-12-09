import { db, auth } from './firebase-config.js';
import { 
    collection, 
    getDocs,
    doc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const USERS_COLLECTION = 'users';
const INVENTORY_COLLECTION = 'inventory';
const shipping_fee = 50;

let cart = [];
let currentUser = null;

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadUserCart();
    } else {
        currentUser = null;
        cart = [];
        displayCart();
    }
});
async function loadUserCart() {
    if (!currentUser) return;

    try {
        const userDocRef = doc(db, USERS_COLLECTION, currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            cart = userData.cart || [];
            displayCart();
        }
    } catch (error) {
        console.error("Error loading user cart:", error);
    }
}
async function saveUserCart() {
    if (!currentUser) {
        alert("Please log in to manage cart.");
        return false;
    }

    try {
        const userDocRef = doc(db, USERS_COLLECTION, currentUser.uid);
        await updateDoc(userDocRef, {
            cart: cart
        });
        return true;
    } catch (error) {
        console.error("Error saving cart:", error);
        alert("Failed to save cart. Please try again.");
        return false;
    }
}
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

async function removeItem(id) {
    const removedItem = cart.find(item => item.id === id);
    if (!removedItem) return;

    try {
        // Restore stock to inventory
        const [invName, invSize] = removedItem.name.split(" ∙ ");
        const inventorySnapshot = await getDocs(collection(db, INVENTORY_COLLECTION));
        
        let invDocId = null;
        let currentStock = 0;
        
        inventorySnapshot.forEach((doc) => {
            const item = doc.data();
            if (item.name === invName.trim() && item.size === invSize.trim()) {
                invDocId = doc.id;
                currentStock = item.stock;
            }
        });
        if (invDocId) {
            const invDocRef = doc(db, INVENTORY_COLLECTION, invDocId);
            await updateDoc(invDocRef, {
                stock: currentStock + removedItem.quantity
            });
        }
        // Remove from cart
        cart = cart.filter(item => item.id !== id);
        await saveUserCart();
        displayCart();
    } catch (error) {
        console.error("Error removing item:", error);
        alert("Failed to remove item. Please try again.");
    }
}

async function clearCart() {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    try {
        // Restore all stock to inventory
        const inventorySnapshot = await getDocs(collection(db, INVENTORY_COLLECTION));
        const inventory = {};
        
        inventorySnapshot.forEach((doc) => {
            const item = doc.data();
            inventory[`${item.name}|${item.size}`] = {
                docId: doc.id,
                stock: item.stock
            };
        });
        // Update stock for each cart item
        for (const item of cart) {
            const [invName, invSize] = item.name.split(" ∙ ");
            const key = `${invName.trim()}|${invSize.trim()}`;
            
            if (inventory[key]) {
                const invDocRef = doc(db, INVENTORY_COLLECTION, inventory[key].docId);
                await updateDoc(invDocRef, {
                    stock: inventory[key].stock + item.quantity
                });
            }
        }
        // Clear cart
        cart = [];
        await saveUserCart();
        displayCart();
    } catch (error) {
        console.error("Error clearing cart:", error);
        alert("Failed to clear cart. Please try again.");
    }
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

window.logout = async function() {
    try {
        await signOut(auth);
        window.location.href = "../../../../index.html";
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Error logging out: " + error.message);
    }
};

// Make functions globally accessible
window.removeItem = removeItem;
window.clearCart = clearCart;
window.checkout = checkout;