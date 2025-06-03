const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Campaign = require('../models/Campaign');
const CommunicationLog = require('../models/CommunicationLog');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Validation middleware for campaign creation
const validateCampaign = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Campaign name must be between 1 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('messageTemplate')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message template must be between 1 and 1000 characters'),
    body('audienceRules.conditions')
        .isArray({ min: 1 })
        .withMessage('At least one audience condition is required'),
    body('audienceRules.conditions.*.field')
        .isIn(['totalSpent', 'visitCount', 'daysSinceLastOrder', 'status', 'city', 'valueCategory'])
        .withMessage('Invalid condition field'),
    body('audienceRules.conditions.*.operator')
        .isIn(['gt', 'gte', 'lt', 'lte', 'eq', 'ne', 'in', 'nin', 'exists'])
        .withMessage('Invalid condition operator'),
    body('audienceRules.logic')
        .optional()
        .isIn(['AND', 'OR'])
        .withMessage('Logic must be AND or OR'),
    body('type')
        .optional()
        .isIn(['promotional', 'transactional', 'reminder', 'welcome', 'winback'])
        .withMessage('Invalid campaign type'),
    body('channel')
        .optional()
        .isIn(['email', 'sms', 'push', 'whatsapp'])
        .withMessage('Invalid communication channel')
];

// GET /api/campaigns - Get all campaigns with filtering and pagination
router.get('/', auth, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled']).withMessage('Invalid status'),
    query('type').optional().isIn(['promotional', 'transactional', 'reminder', 'welcome', 'winback']).withMessage('Invalid type'),
    query('sortBy').optional().isIn(['name', 'createdAt', 'audienceSize', 'status']).withMessage('Invalid sort field'),
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
            status,
            type,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        let filter = {};

        if (status) {
            filter.status = status;
        }

        if (type) {
            filter.type = type;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [campaigns, totalCount] = await Promise.all([
            Campaign.find(filter)
                .populate('createdBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Campaign.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                campaigns,
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

// POST /api/campaigns/preview - Preview audience for campaign rules
router.post('/preview', auth, [
    body('audienceRules.conditions')
        .isArray({ min: 1 })
        .withMessage('At least one audience condition is required'),
    body('audienceRules.conditions.*.field')
        .isIn(['totalSpent', 'visitCount', 'daysSinceLastOrder', 'status', 'city', 'valueCategory'])
        .withMessage('Invalid condition field'),
    body('audienceRules.conditions.*.operator')
        .isIn(['gt', 'gte', 'lt', 'lte', 'eq', 'ne', 'in', 'nin', 'exists'])
        .withMessage('Invalid condition operator'),
    body('audienceRules.logic')
        .optional()
        .isIn(['AND', 'OR'])
        .withMessage('Logic must be AND or OR')
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

        const { audienceRules } = req.body;

        // Evaluate audience based on rules
        const audience = await Campaign.evaluateAudience(audienceRules);

        res.status(200).json({
            success: true,
            data: {
                audienceSize: audience.length,
                sampleCustomers: audience.slice(0, 5), // Return first 5 customers as sample
                rules: audienceRules
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/campaigns - Create and optionally launch campaign
router.post('/', auth, validateCampaign, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Evaluate audience size
        const audience = await Campaign.evaluateAudience(req.body.audienceRules);

        // Create campaign
        const campaign = new Campaign({
            ...req.body,
            audienceSize: audience.length,
            createdBy: req.user._id
        });

        await campaign.save();

        // If launch is requested, start the campaign immediately
        if (req.body.launch === true) {
            await launchCampaign(campaign, audience);
        }

        await campaign.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: req.body.launch ? 'Campaign created and launched successfully' : 'Campaign created successfully',
            data: campaign
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/campaigns/:id/launch - Launch a campaign
router.post('/:id/launch', auth, async (req, res, next) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Only draft campaigns can be launched'
            });
        }

        // Get audience
        const audience = await Campaign.evaluateAudience(campaign.audienceRules);

        // Launch campaign
        await launchCampaign(campaign, audience);

        res.status(200).json({
            success: true,
            message: 'Campaign launched successfully',
            data: campaign
        });
    } catch (error) {
        next(error);
    }
});

// Helper function to launch campaign
async function launchCampaign(campaign, audience) {
    // Start campaign
    await campaign.start();

    // Create communication logs for each customer
    const communicationLogs = audience.map((customer, index) => ({
        campaignId: campaign._id,
        customerId: customer._id,
        messageId: `MSG-${campaign._id}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`,
        message: personalizeMessage(campaign.messageTemplate, customer),
        channel: campaign.channel,
        personalizedData: {
            customerName: customer.name,
            customFields: {
                totalSpent: customer.totalSpent,
                visitCount: customer.visitCount
            }
        }
    }));

    // Batch insert communication logs
    if (communicationLogs.length > 0) {
        await CommunicationLog.insertMany(communicationLogs);

        // Send messages to vendor API (simulate)
        await sendMessagesToVendor(communicationLogs, campaign);
    }
}

// Helper function to personalize message
function personalizeMessage(template, customer) {
    return template
        .replace(/\{name\}/g, customer.name)
        .replace(/\{totalSpent\}/g, `₹${customer.totalSpent?.toLocaleString('en-IN') || 0}`)
        .replace(/\{visitCount\}/g, customer.visitCount || 0);
}

// Helper function to send messages to vendor API
async function sendMessagesToVendor(communicationLogs, campaign) {
    const vendorApiUrl = process.env.VENDOR_API_URL || 'http://localhost:3000/api/vendor';

    for (const log of communicationLogs) {
        try {
            // Simulate vendor API call
            const response = await axios.post(`${vendorApiUrl}/send`, {
                messageId: log.messageId,
                message: log.message,
                channel: log.channel,
                recipient: log.customerId
            }, {
                timeout: 5000
            });

            // Update campaign stats
            await campaign.updateStats('sent');
        } catch (error) {
            console.error('Error sending to vendor API:', error.message);
            // Update campaign stats for failed
            await campaign.updateStats('failed');
        }
    }
}

// GET /api/campaigns/:id - Get campaign by ID
router.get('/:id', auth, async (req, res, next) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Get communication stats
        const communicationStats = await CommunicationLog.getCampaignStats(campaign._id);

        res.status(200).json({
            success: true,
            data: {
                campaign,
                communicationStats
            }
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/campaigns/:id - Update campaign (only if draft)
router.put('/:id', auth, validateCampaign, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.status !== 'draft') {
            return res.status(400).json({
                success: false,
                message: 'Only draft campaigns can be updated'
            });
        }

        // Re-evaluate audience size if rules changed
        if (req.body.audienceRules) {
            const audience = await Campaign.evaluateAudience(req.body.audienceRules);
            req.body.audienceSize = audience.length;
        }

        const updatedCampaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Campaign updated successfully',
            data: updatedCampaign
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/campaigns/preview-message - Preview personalized message
router.post('/preview-message', auth, [
  body('messageTemplate')
    .notEmpty()
    .withMessage('Message template is required'),
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

    const { messageTemplate } = req.body;

    // Get a sample customer for preview
    const Customer = require('../models/Customer');
    const sampleCustomer = await Customer.findOne().limit(1);

    if (!sampleCustomer) {
      return res.status(404).json({
        success: false,
        message: 'No customers found for preview'
      });
    }

    // Personalize the message
    const personalizedMessage = personalizeMessage(messageTemplate, sampleCustomer);

    res.status(200).json({
      success: true,
      message: 'Message preview generated',
      data: {
        template: messageTemplate,
        personalizedMessage: personalizedMessage,
        sampleCustomer: {
          name: sampleCustomer.name,
          totalSpent: sampleCustomer.totalSpent,
          visitCount: sampleCustomer.visitCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
