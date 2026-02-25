// Sample products data
let products = [
    {
        id: 1,
        name: "Chronograph Elite",
        category: "men",
        price: 2499,
        image: "https://private-us-east-1.manuscdn.com/sessionFile/5h8pRCZ4op5f5DyGbRSE9D/sandbox/oLx7qsYubbXDYplhCy1tea-img-1_1771911275000_na1fn_aGVyby13YXRjaC1tZW4tMQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80",
        description: "Premium men's chronograph with Swiss movement"
    },
    {
        id: 2,
        name: "Rose Gold Elegance",
        category: "women",
        price: 1899,
        image: "https://private-us-east-1.manuscdn.com/sessionFile/5h8pRCZ4op5f5DyGbRSE9D/sandbox/oLx7qsYubbXDYplhCy1tea-img-2_1771911278000_na1fn_aGVyby13YXRjaC13b21lbi0x.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80",
        description: "Elegant rose gold watch with mother-of-pearl dial"
    },
    {
        id: 3,
        name: "Premium Leather Strap",
        category: "accessories",
        price: 299,
        image: "https://private-us-east-1.manuscdn.com/sessionFile/5h8pRCZ4op5f5DyGbRSE9D/sandbox/oLx7qsYubbXDYplhCy1tea-img-3_1771911279000_na1fn_aGVyby1hY2Nlc3Nvcmllcy0x.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80",
        description: "Handcrafted Italian leather watch strap"
    }
];

let cart = [];
let currentCategory = "all";

// Load data from localStorage
function loadData() {
    const savedProducts = localStorage.getItem("wristVogueProducts");
    const savedCart = localStorage.getItem("wristVogueCart");
    
    if (savedProducts) {
        products = JSON.parse(savedProducts);
    }
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    
    updateCartCount();
    renderProducts();
    renderAdminTable();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem("wristVogueProducts", JSON.stringify(products));
    localStorage.setItem("wristVogueCart", JSON.stringify(cart));
}

// Render products
function renderProducts() {
    const grid = document.getElementById("productsGrid");
    grid.innerHTML = "";
    
    const filtered = products.filter(p => {
        const categoryMatch = currentCategory === "all" || p.category === currentCategory;
        const searchMatch = p.name.toLowerCase().includes(
            document.getElementById("searchInput").value.toLowerCase()
        );
        return categoryMatch && searchMatch;
    });
    
    filtered.forEach((product, index) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.style.animationDelay = `${index * 100}ms`;
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-footer">
                <span class="product-price">$${product.price}</span>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveData();
    updateCartCount();
    renderCart();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveData();
    updateCartCount();
    renderCart();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveData();
            renderCart();
        }
    }
}

// Render cart
function renderCart() {
    const cartItems = document.getElementById("cartItems");
    cartItems.innerHTML = "";
    
    if (cart.length === 0) {
        cartItems.innerHTML = "<p style='text-align: center; color: rgba(255,255,255,0.5);'>Your cart is empty</p>";
        return;
    }
    
    cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price}</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `;
        cartItems.appendChild(div);
    });
    
    updateCartTotal();
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById("totalPrice").textContent = `$${total.toFixed(2)}`;
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cartCount").textContent = count;
}

// Toggle cart
function toggleCart() {
    document.getElementById("cartSidebar").classList.toggle("active");
}

// Toggle admin
function toggleAdmin() {
    document.getElementById("adminPanel").classList.toggle("active");
    renderAdminTable();
}

// Toggle menu
function toggleMenu() {
    document.getElementById("mobileMenu").classList.toggle("active");
}

// Toggle add form
function toggleAddForm() {
    document.getElementById("addProductForm").style.display = 
        document.getElementById("addProductForm").style.display === "none" ? "block" : "none";
}

// Render admin table
function renderAdminTable() {
    const tbody = document.getElementById("productsTableBody");
    tbody.innerHTML = "";
    
    products.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover;">
                    <span>${product.name}</span>
                </div>
            </td>
            <td>${product.category}</td>
            <td>$${product.price}</td>
            <td>
                <button class="edit-btn" onclick="editProduct(${product.id})">Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add product
document.getElementById("addProductForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        name: document.getElementById("productName").value,
        category: document.getElementById("productCategory").value,
        price: parseFloat(document.getElementById("productPrice").value),
        image: document.getElementById("productImage").value,
        description: document.getElementById("productDescription").value
    };
    
    products.push(newProduct);
    saveData();
    renderProducts();
    renderAdminTable();
    
    this.reset();
    toggleAddForm();
});

// Delete product
function deleteProduct(id) {
    if (confirm("Are you sure?")) {
        products = products.filter(p => p.id !== id);
        saveData();
        renderProducts();
        renderAdminTable();
    }
}

// Edit product
function editProduct(id) {
    alert("Edit feature coming soon!");
}

// Category filter
document.querySelectorAll(".nav-btn, .mobile-nav-btn").forEach(btn => {
    btn.addEventListener("click", function() {
        currentCategory = this.dataset.category;
        document.querySelectorAll(".nav-btn, .mobile-nav-btn").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        renderProducts();
    });
});

// Search
document.getElementById("searchInput").addEventListener("input", renderProducts);

// Initialize
loadData();
document.querySelector(".nav-btn").classList.add("active");
      
