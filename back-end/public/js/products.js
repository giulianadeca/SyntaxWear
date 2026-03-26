// Handles the product filtering products by category and adding products to cart

//We wait for the DOM(the HTML structure of the page) to load before running the script
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromAPI();
});

const API_BASE_URL = 'http://localhost:3001';

// Map numeric category_id from database to the slugs/labels used in the UI
const CATEGORY_MAP = {
    1: { slug: 'casual',      label: 'Casual' },
    2: { slug: 'sport',       label: 'Sport' },
    3: { slug: 'modern',      label: 'Modern' },
    4: { slug: 'futuristic',  label: 'Futuristic' }
};

// Load products from backend and render them
async function loadProductsFromAPI() {
    const grid = document.querySelector('.products-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (!grid) {
        console.error('Products grid element not found.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) {
            throw new Error(`Failed to load products. Status: ${response.status}`);
        }

        const products = await response.json();

        // Clear any static content
        grid.innerHTML = '';

        // Create a card for each product
        products.forEach(product => {
            const card = createProductCard(product);
            grid.appendChild(card);
        });

        // After products are rendered, setup filters and cart buttons
        setupFiltering(filterButtons);
        setupAddToCartButtons();

    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = `
            <p style="text-align:center; color: var(--news);">
                Sorry, we could not load the products. Please try again later.
            </p>
        `;
    }
}

// Create one product card element from a database product
function createProductCard(product) {
    const categoryInfo = CATEGORY_MAP[product.category_id] || { slug: 'other', label: 'Other' };

    const isNew = product.is_new === 1 || product.is_new === true;
    const isOnSale = product.is_on_sale === 1 || product.is_on_sale === true;

    const basePrice = Number(product.base_price);
    const currentPrice = Number(product.current_price);

    const article = document.createElement('article');
    article.className = 'product-card';
    article.setAttribute('data-category', categoryInfo.slug);

    let badgesHtml = '';
    if (isNew) {
        badgesHtml += '<span class="product-badge">New</span>';
    }
    if (isOnSale) {
        badgesHtml += '<span class="product-badge sale">Sale</span>';
    }

    const priceHtml =
        isOnSale && !Number.isNaN(basePrice)
            ? `
        <p class="product-price">
            <span class="price-old">€${basePrice.toFixed(2)}</span>
            <span class="price-current">€${currentPrice.toFixed(2)}</span>
        </p>
    `
            : `
        <p class="product-price">
            €${currentPrice.toFixed(2)}
        </p>
    `;

    const imageUrl = product.image_url || './images/products/product-placeholder.png';

    article.innerHTML = `
        <div class="product-image">
            <img src="${imageUrl}" alt="${product.name}">
            ${badgesHtml}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-category">${categoryInfo.label}</p>
            ${priceHtml}
            <button
                class="btn btn-filled add-to-cart"
                data-id="${product.product_id}"
                data-name="${product.name}"
                data-price="${currentPrice}"
                data-brand="SyntaxWear"
                data-category="${categoryInfo.label}"
                data-image="${imageUrl}"
            >
                Add to Cart
            </button>
        </div>
    `;

    return article;
}

// Setup category filter buttons
function setupFiltering(filterButtons) {
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const category = this.getAttribute('data-category');

            // Toggle active class on buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Show/hide cards by category
            productCards.forEach(card => {
                const productCategory = card.getAttribute('data-category');
                if (category === 'all' || productCategory === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Setup "Add to Cart" buttons for all rendered products
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price'));
            const productBrand = this.getAttribute('data-brand') || 'Generic';
            const productCategory = this.getAttribute('data-category') || 'Sneakers';
            const productImage = this.getAttribute('data-image') || 'https://via.placeholder.com/300';

            const product = {
                id: productId,
                name: productName,
                brand: productBrand,
                category: productCategory,
                price: productPrice,
                quantity: 1,
                image: productImage
            };

            // Get existing cart or empty array
            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            const existingProductIndex = cart.findIndex(item => item.id === productId);

            if (existingProductIndex > -1) {
                cart[existingProductIndex].quantity += 1;
            } else {
                cart.push(product);
            }

            localStorage.setItem('cart', JSON.stringify(cart));

            // Visual feedback
            this.textContent = 'Added!';
            this.style.backgroundColor = 'var(--hoover)';
            setTimeout(() => {
                this.textContent = 'Add to Cart';
                this.style.backgroundColor = 'var(--feedback)';
            }, 2000);

            // Update cart counter in header if that function exists
            if (typeof updateCartCount === 'function') {
                updateCartCount(getCartItemCount());
            }

            console.log('Product added to cart: ', product);
            console.log('Current cart: ', cart);
        });
    });
}

// Helper: get total quantity of items in cart
function getCartItemCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((total, item) => total + item.quantity, 0);
}

