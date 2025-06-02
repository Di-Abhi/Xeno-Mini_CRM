const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware for order creation
const validateOrder = [
    body('customerId')
        .isMongoId()
        .withMessage('Valid customer ID is required'),
    body('amount')
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number'),
    body('currency')
        .optional()
        .isIn(['INR', 'USD', 'EUR', 'GBP'])
        .withMessage('Invalid currency'),
    body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'])
        .withMessage('Invalid order status'),
    body('items')
        .isArray({ min: 1 })
        .withMessage('At least one item is required'),
    body('items.*.productName')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Product name must be between 1 and 200 characters'),
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be a positive integer'),
    body('items.*.price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('paymentMethod')
        .isIn(['credit_card', 'debit_card', 'upi', 'net_banking', 'cash_on_delivery', 'wallet'])
        .withMessage('Invalid payment method'),
    body('paymentStatus')
        .optional()
        .isIn(['pending', 'paid', 'failed', 'refunded'])
        .withMessage('Invalid payment status')
];

// GET /api/orders - Get all orders with filtering and pagination
router.get('/', auth, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('customerId').optional().isMongoId().withMessage('Invalid customer ID'),
    query('status').optional().isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded']).withMessage('Invalid status'),
    query('paymentStatus').optional().isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid payment status'),
    query('minAmount').optional().isFloat({ min: 0 }).withMessage('Min amount must be positive'),
    query('maxAmount').optional().isFloat({ min: 0 }).withMessage('Max amount must be positive'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
    query('sortBy').optional().isIn(['orderNumber', 'amount', 'orderDate', 'status']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            page = 1,
            limit = 10,
            customerId,
            status,
            paymentStatus,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            sortBy = 'orderDate',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        let filter = {};

        if (customerId) {
            filter.customerId = customerId;
        }

        if (status) {
            filter.status = status;
        }

        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount) filter.amount.$gte = parseFloat(minAmount);
            if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
        }

        if (startDate || endDate) {
            filter.orderDate = {};
            if (startDate) filter.orderDate.$gte = new Date(startDate);
            if (endDate) filter.orderDate.$lte = new Date(endDate);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [orders, totalCount] = await Promise.all([
            Order.find(filter)
                .populate('customerId', 'name email phone')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Order.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/orders - Create a new order
router.post('/', auth, validateOrder, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Verify customer exists
        const customer = await Customer.findById(req.body.customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Calculate total amount from items if not provided
        if (!req.body.amount) {
            req.body.amount = req.body.items.reduce((total, item) => {
                return total + (item.price * item.quantity);
            }, 0);
        }

        const order = new Order(req.body);
        await order.save();

        // Populate customer data for response
        await order.populate('customerId', 'name email phone');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/orders/stats/overview - Get order statistics
router.get('/stats/overview', auth, async (req, res, next) => {
    try {
        const stats = await Order.getStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', auth, async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customerId', 'name email phone');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/orders/:id - Update order
router.put('/:id', auth, [
    body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'])
        .withMessage('Invalid order status'),
    body('paymentStatus')
        .optional()
        .isIn(['pending', 'paid', 'failed', 'refunded'])
        .withMessage('Invalid payment status'),
    body('deliveryDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid delivery date')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('customerId', 'name email phone');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
