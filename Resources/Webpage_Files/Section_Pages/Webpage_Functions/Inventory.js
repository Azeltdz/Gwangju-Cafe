import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc,
    query,
    orderBy,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const INVENTORY_COLLECTION = 'inventory';

// Menu data structure
const menuData = {
    Coffee: {
        subcategories: {
            "Ice Coffee": {
                items: [
                    "Iced Americano", "Iced Latte", "Iced Mochaccino", "Coffee Jelly",
                    "Iced Salted Caramel", "Iced Matcha Espresso", "Iced Almond Macchiatto",
                    "Iced Caramel Macchiatto", "Iced Hazelnut Macchiatto", "Iced Spanish Latte"
                ],
                sizes: [
                    { size: "Tall", price: 49 },
                    { size: "Grande", price: 59 },
                    { size: "Venti", price: 79 }
                ]
            },
            "Hot Coffee": {
                items: [
                    "Americano", "Mochaccino", "Salted Caramel",
                    "Matcha Espresso", "Hazelnut Macchiatto", "Caramel Macchiatto"
                ],
                sizes: [
                    { size: "Tall", price: 49 },
                    { size: "Grande", price: 59 }
                ]
            }
        }
    },
    "Non-Coffee": {
        subcategories: {
            "Latte": {
                items: [
                    "Blueberry Latte", "Strawberry Latte", "Matcha Latte",
                    "Green Apple Latte", "Mango Latte", "Lychee Latte",
                    "Choco Lava Latte", "Honey Peach Latte"
                ],
                sizes: [
                    { size: "Tall", price: 49 },
                    { size: "Grande", price: 59 },
                    { size: "Venti", price: 79 }
                ]
            },
            "Fruit Tea": {
                items: [
                    "Lychee Fruit Tea", "Blueberry Fruit Tea", "Strawberry Fruit Tea",
                    "Honey Peach Fruit Tea", "Mango Fruit Tea", "Green Apple Fruit Tea"
                ],
                sizes: [
                    { size: "Tall", price: 49 },
                    { size: "Grande", price: 59 },
                    { size: "Venti", price: 79 }
                ]
            }
        }
    },
    "Secret Menu": {
        subcategories: {
            "Soda Series": {
                items: [
                    "Strawberry Milk Soda", "Blueberry Milk Soda", "Green Apple Soda",
                    "Strawberry Soda", "Blueberry Soda", "Honey Peach Soda"
                ],
                sizes: [
                    { size: "Tall", price: 49 },
                    { size: "Grande", price: 59 },
                    { size: "Venti", price: 79 }
                ]
            },
            "Fusion Series": {
                items: [
                    "Strawberry Oreo Latte", "Oreo Latte", "Berry Matcha",
                    "Chocolate Strawberry", "Strawberry Macchiato", "Red Velvet Macchiato"
                ],
                sizes: [
                    { size: "Tall", price: 49 },
                    { size: "Grande", price: 59 },
                    { size: "Venti", price: 79 }
                ]
            },
            "Biscoff Series": {
                items: [
                    "Biscoff Latte", "Biscoff Matcha Latte", "Biscoff Oreo Latte", "Biscoff Iced Coffee"
                ],
                sizes: [
                    { size: "Grande", price: 59 }
                ]
            }
        }
    },
    Pastries: {
        subcategories: {
            "Cinnamon Rolls": {
                items: [
                    "Classic Cinnamon", "Cream Cheese Glazed", "Caramel Pecan",
                ],
                sizes: [
                    { size: "Regular", price: 65 }
                ]
            },
            "Cakes": {
                items: [
                    "Classic Chocolate Cake", "Red Velvet Cake", "Coffee Cake"
                ],
                sizes: [
                    { size: "Regular", price: 65 }
                ]
            }
        }
    },
    Takoyaki: {
        items: ["Classic Takoyaki", "Shrimp Takoyaki", "Bacon Takoyaki"],
        sizes: [
            { size: "Regular", price: 120 },
            { size: "Spicy", price: 130 }
        ]
    },
    Ramen: {
        items: [
            { name: "Chicken Ramen", sizes: [{ size: "Original", price: 190 }, { size: "Spicy", price: 200 }] },
            { name: "Beef Ramen", sizes: [{ size: "Original", price: 220 }, { size: "Spicy", price: 230 }] }
        ]
    }
};

function daysUntilExpired(dateStr) {
    if (!dateStr) return Infinity;
    const now = new Date();
    const exp = new Date(dateStr);
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

// Load inventory on page load
document.addEventListener("DOMContentLoaded", initInventory);

async function initInventory() {
    const container = document.getElementById("inventory_table");
    if (!container) return console.error("ERROR: #inventory_table NOT FOUND");

    await loadAndRenderInventory();
    updateGenerateButton();
}

async function loadAndRenderInventory() {
    try {
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
        
        renderInventoryTable(inventory);
        return inventory.length;
    } catch (error) {
        console.error("Error loading inventory:", error);
        alert("Failed to load inventory. Please try again.");
        return 0;
    }
}

let allInventory = [];
let displayedCount = 0;
const ITEMS_PER_LOAD = 10;
const ITEMS_AFTER_FIRST = 20;

function renderInventoryTable(inventory) {
    allInventory = inventory;
    displayedCount = 0;
    
    const container = document.getElementById("inventory_table");
    
    // Create initial table structure
    container.innerHTML = `
        <table class="admin_inventory_table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Category</th>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Days Left</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="inventory_tbody">
            </tbody>
        </table>
        <div id="load_more_container" style="text-align: center; margin-top: 20px;"></div>
    `;
    
    if (inventory.length === 0) {
        document.getElementById("inventory_tbody").innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:15px; color:gray;">
                    No items in inventory.
                </td>
            </tr>
        `;
        return;
    }
    
    // Load first batch
    loadMoreItems();
}

function loadMoreItems() {
    const tbody = document.getElementById("inventory_tbody");
    const loadMoreContainer = document.getElementById("load_more_container");
    
    // Determine how many items to load
    const itemsToLoad = displayedCount === 0 ? ITEMS_PER_LOAD : ITEMS_AFTER_FIRST;
    const startIndex = displayedCount;
    const endIndex = Math.min(startIndex + itemsToLoad, allInventory.length);
    
    // Add new rows
    for (let i = startIndex; i < endIndex; i++) {
        const item = allInventory[i];
        const daysLeft = daysUntilExpired(item.expirationDate);
        let rowColor = "";
        if (daysLeft <= 0) rowColor = `style="background:#ffb3b3"`;  
        else if (daysLeft <= 7) rowColor = `style="background:#ffe5b3"`; 

        const row = document.createElement('tr');
        row.setAttribute('data-doc-id', item.docId);
        if (rowColor) row.setAttribute('style', rowColor.replace('style="', '').replace('"', ''));
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.category}</td>
            <td>${item.name}</td>
            <td>${item.size}</td>
            <td>${daysLeft <= 0 ? "Expired" : daysLeft}</td>
            <td>
                <button class="update_button" data-doc-id="${item.docId}">Update</button>
            </td>
        `;
        
        tbody.appendChild(row);
    }
    
    displayedCount = endIndex;
    
    // Update or remove "Load More" button
    if (displayedCount < allInventory.length) {
        const remaining = allInventory.length - displayedCount;
        const nextLoad = Math.min(ITEMS_AFTER_FIRST, remaining);
        
        loadMoreContainer.innerHTML = `
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                <button class="load_more_button" onclick="loadMoreItems()">
                    Load More (${nextLoad} of ${remaining} remaining)
                </button>
                <button class="load_all_button" onclick="loadAllItems()">
                    Load All (${remaining} remaining)
                </button>
            </div>
        `;
    } else {
        loadMoreContainer.innerHTML = `
            <p style="color: #666; font-style: italic;">All ${allInventory.length} items loaded</p>
        `;
    }
    
    // Add event listeners to newly added update buttons
    const newButtons = tbody.querySelectorAll('.update_button:not([data-listener])');
    newButtons.forEach(button => {
        button.setAttribute('data-listener', 'true');
        button.addEventListener('click', function() {
            const docId = this.getAttribute('data-doc-id');
            updateItem(docId);
        });
    });
}

function loadAllItems() {
    const tbody = document.getElementById("inventory_tbody");
    const loadMoreContainer = document.getElementById("load_more_container");
    
    const startIndex = displayedCount;
    const endIndex = allInventory.length;
    
    // Add all remaining rows
    for (let i = startIndex; i < endIndex; i++) {
        const item = allInventory[i];
        const daysLeft = daysUntilExpired(item.expirationDate);
        let rowColor = "";
        if (daysLeft <= 0) rowColor = `style="background:#ffb3b3"`;  
        else if (daysLeft <= 7) rowColor = `style="background:#ffe5b3"`; 

        const row = document.createElement('tr');
        row.setAttribute('data-doc-id', item.docId);
        if (rowColor) row.setAttribute('style', rowColor.replace('style="', '').replace('"', ''));
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.category}</td>
            <td>${item.name}</td>
            <td>${item.size}</td>
            <td>${daysLeft <= 0 ? "Expired" : daysLeft}</td>
            <td>
                <button class="update_button" data-doc-id="${item.docId}">Update</button>
            </td>
        `;
        
        tbody.appendChild(row);
    }
    
    displayedCount = endIndex;
    
    // Show completion message
    loadMoreContainer.innerHTML = `
        <p style="color: #666; font-style: italic;">All ${allInventory.length} items loaded</p>
    `;
    
    // Add event listeners to newly added update buttons
    const newButtons = tbody.querySelectorAll('.update_button:not([data-listener])');
    newButtons.forEach(button => {
        button.setAttribute('data-listener', 'true');
        button.addEventListener('click', function() {
            const docId = this.getAttribute('data-doc-id');
            updateItem(docId);
        });
    });
}

async function updateItem(docId) {
    // Fetch the full item data from Firestore
    try {
        const docRef = doc(db, INVENTORY_COLLECTION, docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const fullData = {
                docId: docId,
                ...docSnap.data()
            };
            showUpdateItemPopup(fullData);
        } else {
            alert('Item not found');
        }
    } catch (error) {
        console.error('Error fetching item:', error);
        alert('Failed to load item data');
    }
}

function showUpdateItemPopup(currentData) {
    const addedDate = new Date(currentData.addedDate);
    const minDate = new Date(addedDate);
    minDate.setDate(addedDate.getDate() + 1);
    const minDateString = minDate.toISOString().split('T')[0];

    const popup = document.createElement('div');
    popup.className = 'inventory_popup_overlay';
    popup.innerHTML = `
        <div class="inventory_popup">
            <h2>Update Inventory Item</h2>
            <div class="popup_form">
                <label>Category:</label>
                <select id="update_category" class="styled_select">
                    <option value="">Select Category</option>
                    <option value="Coffee" ${currentData.category === 'Coffee' ? 'selected' : ''}>Coffee</option>
                    <option value="Non-Coffee" ${currentData.category === 'Non-Coffee' ? 'selected' : ''}>Non-Coffee</option>
                    <option value="Secret Menu" ${currentData.category === 'Secret Menu' ? 'selected' : ''}>Secret Menu</option>
                    <option value="Pastries" ${currentData.category === 'Pastries' ? 'selected' : ''}>Pastries</option>
                    <option value="Takoyaki" ${currentData.category === 'Takoyaki' ? 'selected' : ''}>Takoyaki</option>
                    <option value="Ramen" ${currentData.category === 'Ramen' ? 'selected' : ''}>Ramen</option>
                </select>

                <div id="update_subcategory_container" style="display:none;">
                    <select id="update_subcategory" class="styled_select">
                        <option value="">Select Subcategory</option>
                    </select>
                </div>

                <label>Item Name:</label>
                <select id="update_name" class="styled_select">
                    <option value="">Select Item</option>
                </select>

                <label>Size:</label>
                <select id="update_size" class="styled_select">
                    <option value="">Select Size</option>
                </select>

                <label>Price:</label>
                <input type="number" id="update_price" class="styled_input" readonly>

                <label>Stock Quantity:</label>
                <input type="number" id="update_stock" class="styled_input quantity_input" min="1" max="15" value="${currentData.stock}">

                <label>Added Date:</label>
                <input type="date" id="update_addedDate" class="styled_input" value="${currentData.addedDate}" readonly>

                <label>Expiration Date:</label>
                <input type="date" id="update_expiration" class="styled_input" value="${currentData.expirationDate}">

                <div class="popup_buttons">
                    <button class="btn_confirm" id="btn_save_changes">Save Changes</button>
                    <button class="btn_delete" id="btn_delete_item">Delete Item</button>
                    <button class="btn_cancel" id="btn_cancel_update">Cancel</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    // Close popup when clicking outside
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closeUpdateItemPopup();
        }
    });
    // Add button event listeners with proper closure
    document.getElementById('btn_save_changes').addEventListener('click', () => {
        confirmUpdateItem(currentData.docId);
    });
    document.getElementById('btn_delete_item').addEventListener('click', () => {
        confirmDeleteFromPopup(currentData.docId);
    });
    
    document.getElementById('btn_cancel_update').addEventListener('click', closeUpdateItemPopup);
    // Add dropdown event listeners
    document.getElementById('update_category').addEventListener('change', handleUpdateCategoryChange);
    document.getElementById('update_subcategory').addEventListener('change', handleUpdateSubcategoryChange);
    document.getElementById('update_name').addEventListener('change', handleUpdateNameChange);
    document.getElementById('update_size').addEventListener('change', handleUpdateSizeChange);
// Update expiration min date when added date changes
    const addedDateInput = document.getElementById('update_addedDate');
    const expirationInput = document.getElementById('update_expiration');
    
    addedDateInput.addEventListener('change', function(e) {
        const addedDate = new Date(e.target.value);
        const minDate = new Date(addedDate);
        minDate.setDate(addedDate.getDate() + 1);
        const minDateString = minDate.toISOString().split('T')[0];
        expirationInput.setAttribute('min', minDateString);
        
        // If current expiration is before the new minimum, reset it
        if (expirationInput.value && expirationInput.value <= e.target.value) {
            expirationInput.value = minDateString;
        }
    });
    
    // Validate expiration date on change and on input
    expirationInput.addEventListener('change', validateExpirationDate);
    expirationInput.addEventListener('input', validateExpirationDate);
    
    function validateExpirationDate(e) {
        const addedDate = document.getElementById('update_addedDate').value;
        if (addedDate && e.target.value && e.target.value <= addedDate) {
            alert('Expiration date must be at least 1 day after the added date!');
            const minDate = new Date(addedDate);
            minDate.setDate(minDate.getDate() + 1);
            e.target.value = minDate.toISOString().split('T')[0];
        }
    }
    // Initialize dropdowns with current data
    initializeUpdatePopup(currentData);
}

function initializeUpdatePopup(currentData) {
    const category = currentData.category;
    
    if (!category) return;
    
    const categoryData = menuData[category];
    
    // Check if category has subcategories
    if (categoryData.subcategories) {
        const subcategoryContainer = document.getElementById('update_subcategory_container');
        const subcategorySelect = document.getElementById('update_subcategory');
        
        subcategoryContainer.style.display = 'block';
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        
        // Find which subcategory contains this item
        let foundSubcategory = null;
        for (const [subKey, subData] of Object.entries(categoryData.subcategories)) {
            if (subData.items.includes(currentData.name)) {
                foundSubcategory = subKey;
                break;
            }
        }
        
        Object.keys(categoryData.subcategories).forEach(sub => {
            const selected = sub === foundSubcategory ? 'selected' : '';
            subcategorySelect.innerHTML += `<option value="${sub}" ${selected}>${sub}</option>`;
        });
        
        if (foundSubcategory) {
            populateUpdateItems(category, foundSubcategory, currentData.name);
            populateUpdateSizes(category, foundSubcategory, currentData);
        }
    } else {
        populateUpdateItems(category, null, currentData.name);
        populateUpdateSizes(category, null, currentData);
    }
}

function handleUpdateCategoryChange(e) {
    const category = e.target.value;
    const subcategoryContainer = document.getElementById('update_subcategory_container');
    const subcategorySelect = document.getElementById('update_subcategory');
    const nameSelect = document.getElementById('update_name');
    const sizeSelect = document.getElementById('update_size');

    nameSelect.innerHTML = '<option value="">Select Item</option>';
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    document.getElementById('update_price').value = '';

    if (!category) {
        subcategoryContainer.style.display = 'none';
        return;
    }

    const categoryData = menuData[category];

    if (categoryData.subcategories) {
        subcategoryContainer.style.display = 'block';
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        Object.keys(categoryData.subcategories).forEach(sub => {
            subcategorySelect.innerHTML += `<option value="${sub}">${sub}</option>`;
        });
    } else {
        subcategoryContainer.style.display = 'none';
        populateUpdateItems(category);
    }
}

function handleUpdateSubcategoryChange(e) {
    const category = document.getElementById('update_category').value;
    const subcategory = e.target.value;

    if (!subcategory) return;

    populateUpdateItems(category, subcategory);
}

function populateUpdateItems(category, subcategory = null, selectedName = null) {
    const nameSelect = document.getElementById('update_name');
    const categoryData = menuData[category];
    
    nameSelect.innerHTML = '<option value="">Select Item</option>';

    let items;
    if (subcategory) {
        items = categoryData.subcategories[subcategory].items;
    } else if (category === 'Ramen') {
        items = categoryData.items.map(item => item.name);
    } else {
        items = categoryData.items;
    }

    items.forEach(item => {
        const selected = item === selectedName ? 'selected' : '';
        nameSelect.innerHTML += `<option value="${item}" ${selected}>${item}</option>`;
    });
}

function populateUpdateSizes(category, subcategory = null, currentData) {
    const categoryData = menuData[category];
    const sizeSelect = document.getElementById('update_size');
    
    let sizes;
    if (category === 'Ramen') {
        const ramenItem = categoryData.items.find(item => item.name === currentData.name);
        sizes = ramenItem?.sizes || [];
    } else if (subcategory) {
        sizes = categoryData.subcategories[subcategory].sizes;
    } else {
        sizes = categoryData.sizes;
    }

    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    sizes.forEach(sizeObj => {
        const selected = sizeObj.size === currentData.size ? 'selected' : '';
        sizeSelect.innerHTML += `<option value="${sizeObj.size}" data-price="${sizeObj.price}" ${selected}>${sizeObj.size} - ₱${sizeObj.price}</option>`;
    });
    
    // Set the price
    document.getElementById('update_price').value = currentData.price;
}

function handleUpdateNameChange(e) {
    const category = document.getElementById('update_category').value;
    const subcategory = document.getElementById('update_subcategory').value;
    const name = e.target.value;
    const sizeSelect = document.getElementById('update_size');

    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    document.getElementById('update_price').value = '';

    if (!name) return;

    const categoryData = menuData[category];
    let sizes;

    if (category === 'Ramen') {
        const ramenItem = categoryData.items.find(item => item.name === name);
        sizes = ramenItem.sizes;
    } else if (subcategory) {
        sizes = categoryData.subcategories[subcategory].sizes;
    } else {
        sizes = categoryData.sizes;
    }

    sizes.forEach(sizeObj => {
        sizeSelect.innerHTML += `<option value="${sizeObj.size}" data-price="${sizeObj.price}">${sizeObj.size} - ₱${sizeObj.price}</option>`;
    });
}

function handleUpdateSizeChange(e) {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    document.getElementById('update_price').value = price || '';
}

async function confirmUpdateItem(docId) {
    const category = document.getElementById('update_category').value;
    const name = document.getElementById('update_name').value;
    const size = document.getElementById('update_size').value;
    const price = Number(document.getElementById('update_price').value);
    const stock = Number(document.getElementById('update_stock').value);
    const addedDate = document.getElementById('update_addedDate').value;
    const expirationDate = document.getElementById('update_expiration').value;

    if (!category || !name || !size || !price || !stock || !expirationDate) {
        alert('Please fill in all fields!');
        return;
    }

    if (stock < 1 || stock > 15) {
        alert('Stock must be between 1 and 15!');
        return;
    }

    try {
        const docRef = doc(db, INVENTORY_COLLECTION, docId);
        await updateDoc(docRef, {
            name,
            category,
            size,
            price,
            stock,
            addedDate,
            expirationDate
        });
        
        closeUpdateItemPopup();
        await loadAndRenderInventory();
        alert('Item updated successfully!');
    } catch (error) {
        console.error('Error updating item:', error);
        alert('Failed to update item. Please try again.');
    }
}

async function confirmDeleteFromPopup(docId) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
        await deleteDoc(doc(db, INVENTORY_COLLECTION, docId));
        closeUpdateItemPopup();
        await loadAndRenderInventory();
        updateGenerateButton();
        alert("Item deleted successfully!");
    } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item. Please try again.");
    }
}

function closeUpdateItemPopup() {
    const popup = document.querySelector('.inventory_popup_overlay');
    if (popup) popup.remove();
}

async function addInventoryItem() {
    showAddItemPopup();
}

function showAddItemPopup() {
    const popup = document.createElement('div');
    popup.className = 'inventory_popup_overlay';
    popup.innerHTML = `
        <div class="inventory_popup">
            <h2>Add Inventory Item</h2>
            <div class="popup_form">
                <label>Category:</label>
                <select id="popup_category" class="styled_select">
                    <option value="">Select Category</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Non-Coffee">Non-Coffee</option>
                    <option value="Secret Menu">Secret Menu</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Takoyaki">Takoyaki</option>
                    <option value="Ramen">Ramen</option>
                </select>

                <div id="subcategory_container" style="display:none;">
                    <select id="popup_subcategory" class="styled_select">
                        <option value="">Select Subcategory</option>
                    </select>
                </div>

                <label>Item Name:</label>
                <select id="popup_name" class="styled_select" disabled>
                    <option value="">Select Category First</option>
                </select>

                <label>Size:</label>
                <select id="popup_size" class="styled_select" disabled>
                    <option value="">Select Item First</option>
                </select>

                <label>Price:</label>
                <input type="number" id="popup_price" class="styled_input" readonly>

                <label>Stock Quantity:</label>
                <input type="number" id="popup_stock" class="styled_input quantity_input" min="1" max="15" value="1" readonly>

                <label>Expiration Date:</label>
                <input type="date" id="popup_expiration" class="styled_input">

                <div class="popup_buttons">
                    <button class="btn_confirm" onclick="confirmAddItem()">Add Item</button>
                    <button class="btn_cancel" onclick="closeAddItemPopup()">Cancel</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(popup);

    // Set default expiration date (30 days from now)
    const defaultExp = new Date();
    defaultExp.setDate(defaultExp.getDate() + 30);
    document.getElementById('popup_expiration').value = defaultExp.toISOString().split('T')[0];

    // Add event listeners
    document.getElementById('popup_category').addEventListener('change', handleCategoryChange);
    document.getElementById('popup_subcategory').addEventListener('change', handleSubcategoryChange);
    document.getElementById('popup_name').addEventListener('change', handleNameChange);
    document.getElementById('popup_size').addEventListener('change', handleSizeChange);
}

function handleCategoryChange(e) {
    const category = e.target.value;
    const subcategoryContainer = document.getElementById('subcategory_container');
    const subcategorySelect = document.getElementById('popup_subcategory');
    const nameSelect = document.getElementById('popup_name');
    const sizeSelect = document.getElementById('popup_size');

    // Reset downstream selects
    nameSelect.disabled = true;
    sizeSelect.disabled = true;
    nameSelect.innerHTML = '<option value="">Select Item</option>';
    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    document.getElementById('popup_price').value = '';

    if (!category) {
        subcategoryContainer.style.display = 'none';
        return;
    }

    const categoryData = menuData[category];

    // Check if category has subcategories
    if (categoryData.subcategories) {
        subcategoryContainer.style.display = 'block';
        subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
        Object.keys(categoryData.subcategories).forEach(sub => {
            subcategorySelect.innerHTML += `<option value="${sub}">${sub}</option>`;
        });
    } else {
        subcategoryContainer.style.display = 'none';
        populateItems(category);
    }
}

function handleSubcategoryChange(e) {
    const category = document.getElementById('popup_category').value;
    const subcategory = e.target.value;

    if (!subcategory) return;

    populateItems(category, subcategory);
}

function populateItems(category, subcategory = null) {
    const nameSelect = document.getElementById('popup_name');
    const categoryData = menuData[category];
    
    nameSelect.innerHTML = '<option value="">Select Item</option>';
    nameSelect.disabled = false;

    let items;
    if (subcategory) {
        items = categoryData.subcategories[subcategory].items;
    } else if (category === 'Ramen') {
        items = categoryData.items.map(item => item.name);
    } else {
        items = categoryData.items;
    }

    items.forEach(item => {
        nameSelect.innerHTML += `<option value="${item}">${item}</option>`;
    });
}

function handleNameChange(e) {
    const category = document.getElementById('popup_category').value;
    const subcategory = document.getElementById('popup_subcategory').value;
    const name = e.target.value;
    const sizeSelect = document.getElementById('popup_size');

    sizeSelect.innerHTML = '<option value="">Select Size</option>';
    sizeSelect.disabled = true;
    document.getElementById('popup_price').value = '';

    if (!name) return;

    const categoryData = menuData[category];
    let sizes;

    if (category === 'Ramen') {
        const ramenItem = categoryData.items.find(item => item.name === name);
        sizes = ramenItem.sizes;
    } else if (subcategory) {
        sizes = categoryData.subcategories[subcategory].sizes;
    } else {
        sizes = categoryData.sizes;
    }

    sizes.forEach(sizeObj => {
        sizeSelect.innerHTML += `<option value="${sizeObj.size}" data-price="${sizeObj.price}">${sizeObj.size} - ₱${sizeObj.price}</option>`;
    });

    sizeSelect.disabled = false;
}

function handleSizeChange(e) {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    document.getElementById('popup_price').value = price || '';
}

async function confirmAddItem() {
    const category = document.getElementById('popup_category').value;
    const name = document.getElementById('popup_name').value;
    const size = document.getElementById('popup_size').value;
    const price = Number(document.getElementById('popup_price').value);
    const stock = Number(document.getElementById('popup_stock').value);
    const expirationDate = document.getElementById('popup_expiration').value;

    if (!category || !name || !size || !price || !stock || !expirationDate) {
        alert('Please fill in all fields!');
        return;
    }

    if (stock < 1 || stock > 15) {
        alert('Stock must be between 1 and 15!');
        return;
    }

    const addedDate = new Date().toISOString().split('T')[0];

    try {
        await addDoc(collection(db, INVENTORY_COLLECTION), {
            id: Date.now(),
            name,
            category,
            size,
            price,
            stock,
            addedDate,
            expirationDate
        });
        
        closeAddItemPopup();
        await loadAndRenderInventory();
        updateGenerateButton();
        alert('Item added successfully!');
    } catch (error) {
        console.error('Error adding item:', error);
        alert('Failed to add item. Please try again.');
    }
}

function closeAddItemPopup() {
    const popup = document.querySelector('.inventory_popup_overlay');
    if (popup) popup.remove();
}

async function toggleGenerateButton() {
    const button = document.getElementById('generateBtn');
    if (!button) return;

    const currentText = button.textContent;

    if (currentText === 'Generate Inventory') {
        await generateInventory();
    } else {
        await clearAllInventory();
    }
}

async function updateGenerateButton() {
    const button = document.getElementById('generateBtn');
    if (!button) return;

    try {
        const inventorySnapshot = await getDocs(collection(db, INVENTORY_COLLECTION));
        const count = inventorySnapshot.size;

        if (count === 0) {
            button.textContent = 'Generate Inventory';
            button.style.background = '#4CAF50';
        } else {
            button.textContent = 'Clear All Inventory';
            button.style.background = '#f44336';
        }
    } catch (error) {
        console.error("Error checking inventory:", error);
    }
}

async function clearAllInventory() {
    const buttonElement = document.getElementById('generateBtn');
    if (!buttonElement) return;

    if (!confirm("This will delete ALL items from inventory. Are you sure?")) return;

    const originalText = buttonElement.textContent;
    buttonElement.disabled = true;
    buttonElement.textContent = "Deleting...";

    try {
        const inventorySnapshot = await getDocs(collection(db, INVENTORY_COLLECTION));
        const deletePromises = [];
        
        inventorySnapshot.forEach((document) => {
            deletePromises.push(deleteDoc(doc(db, INVENTORY_COLLECTION, document.id)));
        });

        await Promise.all(deletePromises);
        await loadAndRenderInventory();
        updateGenerateButton();
        alert("All inventory cleared!");
    } catch (error) {
        console.error("Error clearing inventory:", error);
        alert("Failed to clear inventory. Please try again.");
    } finally {
        buttonElement.disabled = false;
        buttonElement.textContent = originalText;
    }
}

async function generateInventory() {
    const buttonElement = document.getElementById('generateBtn');
    if (!confirm("This will generate random inventory data. Continue?")) return;

    buttonElement.disabled = true;
    buttonElement.textContent = "Generating...";

    let inventory = [];
    let id = 1;
    const randomStock = () => Math.floor(Math.random() * 15) + 1;
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

    try {
        const promises = inventory.map(item => 
            addDoc(collection(db, INVENTORY_COLLECTION), item)
        );
        await Promise.all(promises);

        await loadAndRenderInventory();
        updateGenerateButton();
        window.location.href = "inventory.html";
        alert("RANDOM INVENTORY GENERATED!");
    } catch (error) {
        console.error("Error generating inventory:", error);
        alert("Failed to generate inventory. Please try again.");
    }
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

// Make functions globally accessible
window.updateItem = updateItem;
window.addInventoryItem = addInventoryItem;
window.confirmAddItem = confirmAddItem;
window.closeAddItemPopup = closeAddItemPopup;
window.admin_logout = admin_logout;
window.toggleGenerateButton = toggleGenerateButton;
window.loadMoreItems = loadMoreItems;
window.loadAllItems = loadAllItems;