// Checkout Page Logic

// Wait for page to fully load before running code
document.addEventListener('DOMContentLoaded', function () {
    initializeCheckout();        // Setup the checkout page
    setupPaymentListeners();     // Setup payment method selection
    setupFormValidation();       // Setup form submission
    setupCardFormatting();       // Setup auto-formatting for card inputs
});


// Function sets up the entire page when it loads
function initializeCheckout() {

    // Get cart from localStorage
    const cart = getCart();

    // If cart is empty, redirect to cart page
    if (cart.length === 0) {
        alert('Your cart is empty. Please add products before checking out.');
        window.location.href = 'cart.html';
        return; // Stop function execution
    }

    // Display products in order summary
    displayOrderSummary(cart);

    // Calculate and show totals
    updateTotals(cart);
}


// Function to retrieves cart from localStorage
function getCart() {
    // Get cart string from localStorage
    const cartJSON = localStorage.getItem('cart');

    // If cart exists, convert from JSON string to JavaScript array
    // If not, return empty array []
    return cartJSON ? JSON.parse(cartJSON) : [];
}

// Function to display order summary
function displayOrderSummary(cart) {
    const summaryItemsContainer = document.getElementById('summaryItems');

    // Clear existing content
    summaryItemsContainer.innerHTML = '';

    // If cart is empty, show message
    if (cart.length === 0) {
        summaryItemsContainer.innerHTML = '<p style="text-align: center; color: var(--news);">No items in cart</p>';
        return;
    }

    // Loop through each product and create HTML
    cart.forEach(item => {
        const itemHTML = createSummaryItemHTML(item);
        summaryItemsContainer.innerHTML += itemHTML;
    });
}


//Function that creates HTML structure for ONE product
function createSummaryItemHTML(item) {
    // Calculate total price for this item
    const itemTotal = item.price * item.quantity;

    // Return HTML string with product information
    return `
        <div class="summary-item">
            <img src="${item.image}" alt="${item.name}" class="summary-item-image">
            <div class="summary-item-details">
                <div class="summary-item-name">${item.name}</div>
                <div class="summary-item-quantity">Quantity: ${item.quantity}</div>
            </div>
            <div class="summary-item-price">€${itemTotal.toFixed(2)}</div>
        </div>
    `;
}

// Function to calculate and update totals
function updateTotals(cart) {
    // Start with subtotal at 0
    let subtotal = 0;

    // Add each product's total to subtotal
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });

    // Calculate shipping
    // Free shipping if subtotal >= €50
    // Otherwise €5.00
    const shipping = subtotal >= 50 ? 0 : 5.00;

    // Calculate final total
    const total = subtotal + shipping;

    // Update DOM elements with calculated values
    document.getElementById('subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `€${total.toFixed(2)}`;
}

// Function set up for payment method
function setupPaymentListeners() {
    // Get all payment method radio buttons
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('cardDetails');

    // Add listener to each radio button
    paymentMethods.forEach(method => {
        // addEventListener listens for changes (when user selects option)
        method.addEventListener('change', function () {
            // Check which payment method is selected
            // this.value gets the value of the selected radio button
            const selectedMethod = this.value;

            // Show card details only for credit/debit card
            // Apple Pay doesn't need card details (handled by Apple)
            if (selectedMethod === 'creditCard' || selectedMethod === 'debitCard') {
                cardDetails.style.display = 'block';
                // Make card fields required
                makeCardFieldsRequired(true);
            } else {
                // For Apple Pay: hide card fields
                cardDetails.style.display = 'none';
                // Make card fields optional
                makeCardFieldsRequired(false);
            }
        });
    });
}

//Function to make card fields required or optional
function makeCardFieldsRequired(isRequired) {
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');

    if (isRequired) {
        // setAttribute adds an attribute to the element
        cardNumber.setAttribute('required', '');
        expiryDate.setAttribute('required', '');
        cvv.setAttribute('required', '');
    } else {
        // removeAttribute removes the attribute
        cardNumber.removeAttribute('required');
        expiryDate.removeAttribute('required');
        cvv.removeAttribute('required');
    }
}

// Function for card number formatting
function setupCardFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');

    // CARD NUMBER FORMATTING
    cardNumber.addEventListener('input', function (e) {
        // Remove all non-digits using regex
        // \D means "not a digit"
        // g means "global" (replace all occurrences)
        let value = e.target.value.replace(/\D/g, '');

        // Add space every 4 digits
        // match(/.{1,4}/g) splits into groups of 4
        // join(' ') joins with spaces
        let formatted = value.match(/.{1,4}/g)?.join(' ') || value;

        // Update input value
        e.target.value = formatted;
    });

    // EXPIRY DATE FORMATTING
    // Format as MM/YY: 1225 → 12/25
    expiryDate.addEventListener('input', function (e) {
        // Remove all non-digits
        let value = e.target.value.replace(/\D/g, '');

        // Add slash after 2 digits
        if (value.length >= 2) {
            // slice(0, 2) gets first 2 characters
            // slice(2, 4) gets next 2 characters
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }

        e.target.value = value;
    });

    // CVV FORMATTING
    // Only numbers, max 4 digits
    cvv.addEventListener('input', function (e) {
        // Remove all non-digits
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

// Function to validate form when user clicks "Confirm Order"
function setupFormValidation() {
    const form = document.getElementById('checkoutForm');

    // Listen for form submission
    form.addEventListener('submit', function (e) {
        // Prevent default form submission (page refresh)
        e.preventDefault();

        // Get form data
        const formData = getFormData();

        // Validate form
        if (!validateForm(formData)) {
            return; // Stop if validation fails
        }

        // Process order
        processOrder(formData);
    });
}

// Function to collect all form data into an object
function getFormData() {
    return {
        // Personal Information
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,

        // Delivery Address
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        postalCode: document.getElementById('postalCode').value,
        country: document.getElementById('country').value,

        // Payment Method
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        cardNumber: document.getElementById('cardNumber').value,
        expiryDate: document.getElementById('expiryDate').value,
        cvv: document.getElementById('cvv').value,

        // Additional
        notes: document.getElementById('notes').value,
        terms: document.getElementById('terms').checked
    };
}

//Function to validate all form data
function validateForm(data) {
    // Check if terms are accepted
    if (!data.terms) {
        alert('Please accept the Terms and Conditions to continue.');
        return false;
    }

    /* Validate email format
    REGEX breakdown: ^[^\s@]+@[^\s@]+\.[^\s@]+$
    ^ = start of string
    [^\s@]+ = one or more characters that are not space or @
    @ = the @ symbol
    [^\s@]+ = one or more characters that are not space or @
    \. = a dot (.)
    [^\s@]+ = one or more characters that are not space or @
    $ = end of string
    Example: john@example.com ✓, john.example.com ✗ */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    // Validate card details ONLY if card payment selected
    // Apple Pay doesn't need card validation (handled by Apple)
    if (data.paymentMethod === 'creditCard' || data.paymentMethod === 'debitCard') {
        // Check card number (16 digits)
        // Remove spaces first: "1234 5678" → "12345678"
        const cardDigits = data.cardNumber.replace(/\s/g, '');
        if (cardDigits.length !== 16) {
            alert('Please enter a valid 16-digit card number.');
            return false;
        }

        /* Check expiry date format (MM/YY)
        REGEX: ^(0[1-9]|1[0-2])\/\d{2}$
        (0[1-9]|1[0-2]) = month 01-12
        \/ = slash /
        \d{2} = exactly 2 digits for year */
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryRegex.test(data.expiryDate)) {
            alert('Please enter expiry date in MM/YY format.');
            return false;
        }

        // Check CVV (3 or 4 digits)
        if (data.cvv.length < 3 || data.cvv.length > 4) {
            alert('Please enter a valid CVV (3 or 4 digits).');
            return false;
        }
    }

    // All validations passed
    return true;
}

// Helper function to generate a unique order number
function generateOrderNumber() {
    const now = new Date();

    // Create date part: YYYYMMDD
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');

    // Create a random 4-digit number between 1000 and 9999
    const randomPart = Math.floor(Math.random() * 9000) + 1000;

    // Final format example: ORD-20251207-1234
    return `ORD-${datePart}-${randomPart}`;
}


// Function to process the order after validation
async function processOrder(data) {
    // Get cart
    const cart = getCart();

    // Calculate totals
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    const shipping = subtotal >= 50 ? 0 : 5.00;
    const total = subtotal + shipping;

    // Create order object
    // This object contains all order information
    const order = {
        orderNumber: generateOrderNumber(),
        date: new Date().toISOString(),  // Current date and time
        customer: {
            name: data.fullName,
            email: data.email,
            phone: data.phone
        },
        delivery: {
            address: data.address,
            city: data.city,
            postalCode: data.postalCode,
            country: data.country
        },
        payment: {
            method: data.paymentMethod
        },
        items: cart,
        totals: {
            subtotal: subtotal,
            shipping: shipping,
            total: total
        },
        notes: data.notes
    };

    try {
        // Send order to backend API
        const response = await fetch('http://localhost:3001/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        if (!response.ok) {
            let errorMessage = 'There was a problem saving your order. Please try again.';
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.error) {
                    errorMessage = `There was a problem saving your order: ${errorBody.error}`;
                    if (errorBody.details) {
                        console.error('Server error details:', errorBody.details);
                    }
                }
            } catch (e) {
                console.error('Failed to parse error response from server:', e);
            }

            console.error('Failed to save order. Status:', response.status);
            alert(errorMessage);
            return;
        }

        const result = await response.json();
        console.log('Order saved on server:', result);


        // Save order to localStorage (so confirmation page can display it)
        localStorage.setItem('lastOrder', JSON.stringify(order));

        // Clear cart
        localStorage.removeItem('cart');

        // Show success message
        alert(`Order confirmed!\n\nOrder Number: ${order.orderNumber}\n\nThank you for your purchase!`);

        // Redirect to confirmation page
        window.location.href = 'confirmation.html';
    } catch (error) {
        console.error('Error sending order to server:', error);
        alert('There was an error communicating with the server. Please check your connection and try again.');
    }
}
