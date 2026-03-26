// Confirmation page logic

//Waiting for the page to load
document.addEventListener('DOMContentLoaded', function() {
    loadOrderDetails();
});

// Function that gets the last order from localStorage and displays it
function loadOrderDetails() {
    // Get the last order from localStorage
    const orderJSON = localStorage.getItem('lastOrder');
    
    // If no order exists, redirect to home
    if (!orderJSON) {
        alert('No order found. Redirecting to home page.');
        window.location.href = 'index.html';
        return;
    }
    
    // Convert JSON string to JavaScript object
    const order = JSON.parse(orderJSON);
    
    // Update the page with order data
    updateOrderNumber(order.orderNumber);
    updateOrderDate(order.date);
    updateTotalAmount(order.totals.total);
    updatePaymentMethod(order.payment.method);
    updateDeliveryAddress(order.delivery);
}

//Function to update the order number on page
function updateOrderNumber(orderNumber) {
    const element = document.querySelector('.order-number');
    if (element) {
        element.textContent = orderNumber;
    }
}

//Function to format and display the order date
function updateOrderDate(dateString) {
    // Find the element that shows "Order Date"
    const rows = document.querySelectorAll('.detail-row');
    
    // Loop through rows to find the one with "Order Date:"
    rows.forEach(row => {
        const label = row.querySelector('.detail-label');
        if (label && label.textContent.includes('Order Date')) {
            const valueElement = row.querySelector('.detail-value');
            if (valueElement) {
                // Convert ISO date to readable format
                const date = new Date(dateString);
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                valueElement.textContent = date.toLocaleDateString('en-US', options);
            }
        }
    });
}

//Function to update the total amount
function updateTotalAmount(total) {
    const element = document.querySelector('.total-amount');
    if (element) {
        element.textContent = `€${total.toFixed(2)}`;
    }
}

//Function that converts payment ethod code to readable text
function updatePaymentMethod(method) {
    // Find the element that shows "Payment Method"
    const rows = document.querySelectorAll('.detail-row');
    
    rows.forEach(row => {
        const label = row.querySelector('.detail-label');
        if (label && label.textContent.includes('Payment Method')) {
            const valueElement = row.querySelector('.detail-value');
            if (valueElement) {
                // Convert method code to readable name
                let paymentName = method;
                
                switch(method) {
                    case 'creditCard':
                        paymentName = 'Credit Card';
                        break;
                    case 'debitCard':
                        paymentName = 'Debit Card';
                        break;
                    case 'apple':
                        paymentName = 'Apple Pay';
                        break;
                    default:
                        paymentName = method;
                }
                
                valueElement.textContent = paymentName;
            }
        }
    });
}

// Function to format the delivery address
function updateDeliveryAddress(delivery) {
    // Find the element that shows "Delivery Address"
    const rows = document.querySelectorAll('.detail-row');
    
    rows.forEach(row => {
        const label = row.querySelector('.detail-label');
        if (label && label.textContent.includes('Delivery Address')) {
            const valueElement = row.querySelector('.detail-value');
            if (valueElement) {
                // Format the address nicely
                const fullAddress = `${delivery.address}, ${delivery.city} ${delivery.postalCode}, ${delivery.country}`;
                valueElement.textContent = fullAddress;
            }
        }
    });
}