// Basic Express server for SyntaxWear backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');

const app = express();

// Use PORT from .env or fallback to 3001
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: 'http://localhost:3001', 
    credentials: true
}));

app.use(express.json());

// This allows the browser to load /css/... , /js/... , /images/... correctly.
app.use(express.static(path.join(__dirname, 'public')));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'SyntaxWear backend is running'
    });
});

// Get all products from MySQL database
app.get('/api/products', (req, res) => {
    const query = 'SELECT * FROM products';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Failed to fetch products from database' });
        }

        res.json(results);
    });
});

// Create a new order and save it in the database
app.post('/api/orders', (req, res) => {
    const order = req.body;

    console.log('Incoming order payload:', JSON.stringify(order, null, 2));

    if (!order || !order.customer || !order.delivery || !order.totals || !order.items) {
        console.error('Invalid order data received');
        return res.status(400).json({ error: 'Invalid order data' });
    }

    // Convert totals to numbers safely
    const subtotal = Number(order.totals.subtotal) || 0;
    const shipping = Number(order.totals.shipping) || 0;
    const total = Number(order.totals.total) || (subtotal + shipping);

    // Prepare main order data
    const orderData = [
        order.orderNumber,
        order.customer.name,
        order.customer.email,
        order.customer.phone || null,
        order.delivery.address,
        order.delivery.city,
        order.delivery.postalCode,
        order.delivery.country,
        order.payment.method,
        subtotal,
        shipping,
        total,
        order.notes || null
    ];

    const insertOrderSql = `
        INSERT INTO orders (
            order_number,
            full_name,
            email,
            phone,
            address,
            city,
            postal_code,
            country,
            payment_method,
            subtotal,
            shipping,
            total,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Insert the order main record
    db.query(insertOrderSql, orderData, (orderErr, orderResult) => {
        if (orderErr) {
            console.error('Error inserting order:', orderErr);
            return res.status(500).json({ error: 'Failed to save order', details: orderErr.message });
        }

        const orderId = orderResult.insertId;
        console.log('Order inserted with ID:', orderId);

        // If there are no items, return early
        if (!Array.isArray(order.items) || order.items.length === 0) {
            return res.status(201).json({
                message: 'Order saved successfully (no items)',
                orderId,
                orderNumber: order.orderNumber
            });
        }

        // Prepare order items safely
        const itemsData = order.items.map(item => {
            const productIdNumber = Number(item.id);
            const quantity = Number(item.quantity) || 0;
            const unitPrice = Number(item.price) || 0;
            const lineTotal = quantity * unitPrice;

            return [
                orderId,
                Number.isNaN(productIdNumber) ? null : productIdNumber,
                item.name,
                quantity,
                unitPrice,
                lineTotal
            ];
        });

        console.log('Order items to insert:', itemsData);

        const insertItemsSql = `
            INSERT INTO order_items (
                order_id,
                product_id,
                product_name,
                quantity,
                unit_price,
                line_total
            )
            VALUES ?
        `;

        db.query(insertItemsSql, [itemsData], (itemsErr) => {
            if (itemsErr) {
                console.error('Error inserting order items:', itemsErr);
                return res.status(500).json({
                    error: 'Order saved but failed to save items',
                    details: itemsErr.message
                });
            }

            console.log('Order items inserted successfully');
            res.status(201).json({
                message: 'Order and items saved successfully',
                orderId,
                orderNumber: order.orderNumber
            });
        });
    });
});

// Get all orders
app.get('/api/orders', (req, res) => {
    const sql = `
        SELECT 
            order_id,
            order_number,
            full_name,
            email,
            total,
            created_at
        FROM orders
        ORDER BY created_at DESC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Failed to fetch orders' });
        }

        res.json(results);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`SyntaxWear backend listening on http://localhost:${PORT}`);
});
