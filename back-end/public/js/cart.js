// Shopping cart page
document.addEventListener('DOMContentLoaded', function () {

    initializeCart(); // Function to initialize cart display
});

// Function to initialize cart display
function initializeCart() {
    const cart = getCart(); //Get products from localStorage

    updateCartCount(); // Update cart count in header

    // Decide what to show based on cart content
    if (cart.length === 0) {
        showEmptyCart(); //no products = empty cart message
    } else {
        showCartWithItems(cart); //products in cart = show products
    }

    setupCheckoutButton(); // Setup checkout button functionality
}

// Function to get cart from localStorage
function getCart() {
    try {
        const cartData = localStorage.getItem('cart'); // get the 'cart' item from localStorage
        if (cartData) { // if cart data exists...
            return JSON.parse(cartData); // parse and return the cart data
        }
        return []; //return empty array if cart is empty. 
    } catch (error) { //if any error happens, log it and return empty array
        console.error('Error loading cart:', error);
        return [];
    }
}

// Function to save cart to localStorage
function saveCart(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart)); // convert cart to string and save it
    } catch (error) {
        console.error('Error saving cart:', error); // log any errors
    }
}

// Function to show empty cart message
function showEmptyCart() {
    //get HTML elements by ID
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');

    //show empty message
    emptyCart.style.display = 'block';

    //hide products section
    cartContent.style.display = 'none';
}

// Function to show cart with items
function showCartWithItems(cart) {
    //get HTML elements by ID
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');
    const cartItemsList = document.getElementById('cartItemsList');

    //hide empty message
    emptyCart.style.display = 'none';

    //show products section
    cartContent.style.display = 'grid';

    // Clear existing items
    cartItemsList.innerHTML = '';

    // Add each product to the cart display
    cart.forEach((item, index) => {
        // Create HTML elements for each cart item
        const itemHTML = createCartItemHTML(item, index);

        //Add HTML to the list
        cartItemsList.innerHTML += itemHTML;
    });

    //after adding all products, set up buttom  functionality
    setupCartItemButtons();

    //calculate and display total price
    updateTotals(cart);
}

// Function to create HTML for a cart item
function createCartItemHTML(item, index) {
    //calculate total price for the item (price x quantity)
    const itemTotal = (item.price * item.quantity).toFixed(2);

    //return HTML string for the cart item
    return `
        <div class="cart-item" data-index="${index}">
            <!-- Product Image -->
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            
            <!-- Product Details -->
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-brand">Brand: ${item.brand}</p>
                <span class="cart-item-category">${item.category}</span>
                
                <!-- Quantity and Remove Controls -->
                <div class="cart-item-controls">
                    <!-- Quantity Control -->
                    <div class="quantity-control">
                        <!-- Decrease button -->
                        <button class="quantity-btn decrease-btn" data-index="${index}" aria-label="Decrease quantity">−</button>
                        
                        <!-- Current quantity -->
                        <span class="quantity-display">${item.quantity}</span>
                        
                        <!-- Increase button -->
                        <button class="quantity-btn increase-btn" data-index="${index}" aria-label="Increase quantity">+</button>
                    </div>
                    
                    <!-- Remove button -->
                    <button class="remove-btn" data-index="${index}">Remove</button>
                </div>
            </div>
            
            <!-- Price Information -->
            <div class="cart-item-price">
                <span class="item-unit-price">€${item.price.toFixed(2)} each</span>
                <span class="item-total-price">€${itemTotal}</span>
            </div>
        </div>
    `;
}

// Function to setup cart item buttons (increase, decrease, remove)
function setupCartItemButtons() {
    //decrease quantity buttons (-)
    const decreaseBtns = document.querySelectorAll('.decrease-btn'); //select all decrease buttons
    decreaseBtns.forEach(btn => {  //for each decrease button
        btn.addEventListener('click', function () { //add click event listener
            const index = parseInt(this.getAttribute('data-index'));  // Get which product this button controls
            decreaseQuantity(index); // Call decrease function
        });
    });

    //increase quantity buttons (+)
    const increaseBtns = document.querySelectorAll('.increase-btn'); //select all increase buttons
    increaseBtns.forEach(btn => { //for each increase button
        btn.addEventListener('click', function () { //add click event listener
            const index = parseInt(this.getAttribute('data-index')); // Get which product this button controls
            increaseQuantity(index); // Call increase function
        });
    });

    //remove item buttons
    const removeBtns = document.querySelectorAll('.remove-btn'); //select all remove buttons
    removeBtns.forEach(btn => { //for each remove button
        btn.addEventListener('click', function () {  //add click event listener
            const index = parseInt(this.getAttribute('data-index'));    // Get which product this button controls
            removeItem(index);  // Call remove function
        });
    });
}

// Function to decrease quantity of an item
function decreaseQuantity(index) {
    //get current cart
    const cart = getCart();

    //only decrease if quantity is more than 1
    if (cart[index].quantity > 1) {
        cart[index].quantity--; //decrease quantity by 1
        saveCart(cart); //save updated cart
        initializeCart(); //refresh cart display
    }
}

// Function to increase quantity of an item
function increaseQuantity(index) {
    //get current cart
    const cart = getCart();

    //increase quantity by 1
    cart[index].quantity++;
    saveCart(cart); //save updated cart
    initializeCart(); //refresh cart display
}

// Function to remove an item from the cart
function removeItem(index) {
    //get current cart
    const cart = getCart();

    //ask for confirmation before removing
    const confirmRemove = confirm('Are you sure you want to remove this item from the cart?');

    if (confirmRemove) {
        cart.splice(index, 1); //remove item from cart
        saveCart(cart); //save updated cart
        initializeCart(); //refresh cart display
    }
}

// Function to calculate and update total prices
function updateTotals(cart) {
    //calculate subtotal (sum of all products)
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity; // add each item's total to subtotal
    });

    //shipping logic (free shipping over €50, else €5)
    let shipping = 5.00; //default shipping cost

    //free shipping for orders over €50
    if (subtotal >= 50) {
        shipping = 0.00;
    }

    //calculate final total
    const total = subtotal + shipping;

    //update HTML elements with calculated totals
    document.getElementById('subtotal').textContent = `€${subtotal.toFixed(2)}`; //subtotal
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`; //shipping
    document.getElementById('total').textContent = `€${total.toFixed(2)}`; //final total
}

// Function to update cart counter
function updateCartCount() {
    const cart = getCart(); //get current cart

    //sum all quantities
    let totalItems = 0; //initialize total items in 0
    cart.forEach(item => { //for each item in cart..
        totalItems += item.quantity; //add each item's quantity to total
    });

    //Update cart count display in header
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        
        if (totalItems === 0) {
            cartCountElement.style.display = 'none';
        } else {
            cartCountElement.style.display = 'inline-block';
        }
    }
}

// Function to setup checkout button functionality
function setupCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn'); //get checkout button by ID

    if (checkoutBtn) { //if button exists
        checkoutBtn.addEventListener('click', function () { //add click event listener
            const cart = getCart(); //get current cart
            if (cart.length === 0) { //if cart is empty...
                alert('Your cart is empty. Please add items before proceeding to checkout.'); //alert user
                return; //stop further execution
            }

            //proceed to checkout page
            window.location.href = 'checkout.html';
        });
    }
}