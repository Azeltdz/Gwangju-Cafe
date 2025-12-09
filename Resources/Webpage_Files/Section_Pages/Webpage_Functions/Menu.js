import { db, auth } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    doc,
    getDoc,
    updateDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const INVENTORY_COLLECTION = 'inventory';
const USERS_COLLECTION = 'users';
const shipping_fee = 50;

let currentUser = null;
let cart = [];
let isInitialized = false;

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadUserCart();
        
        // Update stock display after user is authenticated
        if (!isInitialized) {
            isInitialized = true;
            await updateProductDisplay();
        }
    } else {
        currentUser = null;
        cart = [];
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
        }
    } catch (error) {
        console.error("Error loading user cart:", error);
    }
}

async function saveUserCart() {
    if (!currentUser) {
        alert("Please log in to add items to cart.");
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

async function menuGetInventory() {
    try {
        const inventorySnapshot = await getDocs(collection(db, INVENTORY_COLLECTION));
        const inventory = [];
        
        inventorySnapshot.forEach((doc) => {
            inventory.push({
                docId: doc.id,
                ...doc.data()
            });
        });
        return inventory;
    } catch (error) {
        console.error("Error loading inventory:", error);
        return [];
    }
}

async function menuFindInventoryItem(flavor, size) {
    try {
        // Query Firestore directly for the specific item
        const inventoryRef = collection(db, INVENTORY_COLLECTION);
        const inventorySnapshot = await getDocs(inventoryRef);
        
        let foundItem = null;
        
        inventorySnapshot.forEach((doc) => {
            const item = doc.data();
            if (item.name.toLowerCase() === flavor.toLowerCase() &&
                item.size.toLowerCase() === size.toLowerCase()) {
                foundItem = {
                    docId: doc.id,
                    ...item
                };
            }
        });
        return foundItem;
    } catch (error) {
        console.error("Error finding inventory item:", error);
        return null;
    }
}

async function updateInventoryStock(invItem, quantityToReduce) {
    try {
        const docRef = doc(db, INVENTORY_COLLECTION, invItem.docId);
        const newStock = invItem.stock - quantityToReduce;
        await updateDoc(docRef, {
            stock: newStock
        });
        return true;
    } catch (error) {
        console.error("Error updating inventory stock:", error);
        return false;
    }
}

async function updateProductDisplay() {
    const flavorSelect = document.querySelector(".flavor");
    const sizeSelect = document.querySelector(".size_select");
    const stockEl = document.querySelector("#inv_stock_display");
    // Check if we're on a product page
    if (!flavorSelect || !sizeSelect || !stockEl) {
        return;
    }
    const flavor = flavorSelect.value;
    const size = sizeSelect.value;

    if (!flavor || !size) {
        stockEl.textContent = `Stock: --`;
        return;
    }
    // Show loading state
    stockEl.textContent = `Stock: Loading...`;
    try {
        const invItem = await menuFindInventoryItem(flavor, size);

        if (invItem && invItem.stock !== undefined) {
            stockEl.textContent = `Stock: ${invItem.stock}`;
            stockEl.style.color = invItem.stock > 0 ? '#333' : '#d32f2f';
        } else {
            stockEl.textContent = `Stock: Not Available`;
            console.warn(`Inventory item not found: ${flavor} (${size})`);
        }
    } catch (error) {
        console.error("Error updating product display:", error);
        stockEl.textContent = `Stock: Error`;
    }
}

// Setup quantity input validation (call this once on page load)
function setupQuantityInput() {
    const qtyInput = document.querySelector(".quantity input") || document.querySelector(".quantity_input");
    
    if (qtyInput && !qtyInput.dataset.listenerAdded) {
        qtyInput.dataset.listenerAdded = "true";
        // Prevent invalid input in real-time
        qtyInput.addEventListener("input", (e) => {
            let value = parseInt(e.target.value);
            // If completely empty or 0, allow it temporarily
            if (e.target.value === "" || value === 0) {
                return;
            }
            // If invalid or negative, set to 1
            if (isNaN(value) || value < 0) {
                e.target.value = 1;
            }
            // If greater than 15, cap it at 15
            else if (value > 15) {
                e.target.value = 15;
            }
        });
        // Allow all keyboard navigation
        qtyInput.addEventListener("keydown", (e) => {
            // Allow navigation keys, backspace, delete
            if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
            }
        });
        // Ensure value is valid on blur (when user clicks away)
        qtyInput.addEventListener("blur", (e) => {
            let value = parseInt(e.target.value);
            
            // Fix invalid values when user clicks away
            if (e.target.value === "" || isNaN(value) || value < 1) {
                e.target.value = 1;
            } else if (value > 15) {
                e.target.value = 15;
            }
        });
        // Set initial value to 1 if empty
        if (!qtyInput.value) {
            qtyInput.value = 1;
        }
    }
}

async function handleAddToCart() {
    // Check if user is logged in
    if (!currentUser) {
        alert("Please log in to add items to cart.");
        return;
    }
    const flavor = document.querySelector(".flavor")?.value || "";
    const sizeOption = document.querySelector(".size_select")?.selectedOptions[0];
    const size = sizeOption ? sizeOption.value : "";
    const qtyInput = document.querySelector(".quantity input") || document.querySelector(".quantity_input");
    let quantity = parseInt(qtyInput?.value || 1);
    // Validate and constrain quantity
    if (isNaN(quantity) || quantity < 1) {
        quantity = 1;
        qtyInput.value = 1;
        alert("Quantity must be between 1-15.");
    } else if (quantity > 15) {
        quantity = 15;
        qtyInput.value = 15;
        alert("Maximum quantity is 15.");
    }
    if (!flavor || !size) {
        alert("Please select a flavor and size.");
        return;
    }
    const invItem = await menuFindInventoryItem(flavor, size);
    if (!invItem) {
        alert(`Item not found in inventory: ${flavor} (${size})`);
        return;
    }
    if (invItem.stock < quantity) {
        alert(`${invItem.name} (${invItem.size}) has ${invItem.stock} stock left.`);
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
        subtotal,
        addedBy: currentUser.uid,
        addedByEmail: currentUser.email,
        addedAt: new Date().toISOString()
    };
    
    cart.push(item);
    // Save cart to Firestore
    const saved = await saveUserCart();
    if (!saved) return;
    // Update inventory stock
    const updated = await updateInventoryStock(invItem, quantity);
    if (!updated) {
        alert("Failed to update inventory. Please try again.");
        return;
    }
    // Update stock display immediately
    await updateProductDisplay();

    flyToCart(document.querySelector(".add_to_cart"));
}
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

document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.querySelector(".add_to_cart");
    if (addBtn) {
        addBtn.addEventListener("click", handleAddToCart);
    }
    const flavorSelect = document.querySelector(".flavor");
    if (flavorSelect) {
        flavorSelect.addEventListener("change", updateProductDisplay);
    }
    const sizeSelect = document.querySelector(".size_select");
    if (sizeSelect) {
        sizeSelect.addEventListener("change", updateProductDisplay);
    }
    // Setup quantity input validation
    setupQuantityInput();
    // Initial stock display will be triggered by onAuthStateChanged
    // Or immediately if user is already loaded
    if (currentUser) {
        updateProductDisplay();
    }
});

// Export functions if needed
window.menuGetInventory = menuGetInventory;
window.menuFindInventoryItem = menuFindInventoryItem;