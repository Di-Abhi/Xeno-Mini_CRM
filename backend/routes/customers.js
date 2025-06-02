const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateCustomer = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('phone')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),
    body('totalSpent')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Total spent must be a positive number'),
    body('visitCount')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Visit count must be a positive integer'),
    body('city')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('City name cannot exceed 50 characters'),
    body('country')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Country name cannot exceed 50 characters')
];

// GET /api/customers - Get all customers with filtering and pagination
router.get('/', auth, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Search term too long'),
    query('status').optional().isIn(['active', 'inactive', 'churned']).withMessage('Invalid status'),
    query('minSpent').optional().isFloat({ min: 0 }).withMessage('Min spent must be positive'),
    query('maxSpent').optional().isFloat({ min: 0 }).withMessage('Max spent must be positive'),
    query('sortBy').optional().isIn(['name', 'email', 'totalSpent', 'visitCount', 'createdAt']).withMessage('Invalid sort field'),
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
            search,
            status,
            minSpent,
            maxSpent,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        let filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            filter.status = status;
        }

        if (minSpent || maxSpent) {
            filter.totalSpent = {};
            if (minSpent) filter.totalSpent.$gte = parseFloat(minSpent);
            if (maxSpent) filter.totalSpent.$lte = parseFloat(maxSpent);
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [customers, totalCount] = await Promise.all([
            Customer.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Customer.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                customers,
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

// POST /api/customers - Create a new customer
router.post('/', auth, validateCustomer, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const customer = new Customer(req.body);
        await customer.save();

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: customer
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/customers/stats/overview - Get customer statistics
router.get('/stats/overview', auth, async (req, res, next) => {
    try {
        const stats = await Customer.getStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/customers/:id - Get customer by ID
router.get('/:id', auth, async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/customers/:id - Update customer
router.put('/:id', auth, validateCustomer, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            data: customer
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/customers/:id - Delete customer
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
