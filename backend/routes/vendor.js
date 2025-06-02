const express = require('express');
const { body, validationResult } = require('express-validator');
const CommunicationLog = require('../models/CommunicationLog');
const Campaign = require('../models/Campaign');

const router = express.Router();

// Mock vendor API to simulate message sending
router.post('/send', [
    body('messageId').notEmpty().withMessage('Message ID is required'),
    body('message').notEmpty().withMessage('Message content is required'),
    body('channel').isIn(['email', 'sms', 'push', 'whatsapp']).withMessage('Invalid channel'),
    body('recipient').isMongoId().withMessage('Valid recipient ID is required')
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

        const { messageId, message, channel, recipient } = req.body;

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

        // Simulate 90% success rate, 10% failure rate
        const isSuccess = Math.random() > 0.1;
        
        const vendorResponse = {
            messageId,
            status: isSuccess ? 'sent' : 'failed',
            timestamp: new Date().toISOString(),
            vendorMessageId: `VENDOR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            channel,
            recipient
        };

        if (!isSuccess) {
            vendorResponse.errorCode = 'DELIVERY_FAILED';
            vendorResponse.errorMessage = 'Temporary delivery failure - recipient unavailable';
        }

        // Simulate calling our delivery receipt API
        setTimeout(async () => {
            try {
                await processDeliveryReceipt(vendorResponse);
            } catch (error) {
                console.error('Error processing delivery receipt:', error);
            }
        }, Math.random() * 2000 + 1000); // 1-3 seconds delay

        res.status(200).json({
            success: true,
            message: 'Message queued for delivery',
            data: vendorResponse
        });
    } catch (error) {
        next(error);
    }
});

// Delivery receipt webhook endpoint
router.post('/delivery-receipt', [
    body('messageId').notEmpty().withMessage('Message ID is required'),
    body('status').isIn(['sent', 'delivered', 'failed', 'bounced']).withMessage('Invalid status'),
    body('timestamp').isISO8601().withMessage('Valid timestamp is required')
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

        await processDeliveryReceipt(req.body);

        res.status(200).json({
            success: true,
            message: 'Delivery receipt processed successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Helper function to process delivery receipts
async function processDeliveryReceipt(receiptData) {
    const { messageId, status, timestamp, errorCode, errorMessage, vendorMessageId } = receiptData;

    try {
        // Find the communication log entry
        const communicationLog = await CommunicationLog.findOne({ messageId });

        if (!communicationLog) {
            console.error(`Communication log not found for messageId: ${messageId}`);
            return;
        }

        // Update communication log based on status
        communicationLog.vendorId = vendorMessageId;
        communicationLog.vendorResponse = receiptData;

        switch (status) {
            case 'sent':
                await communicationLog.markAsSent();
                break;
            case 'delivered':
                await communicationLog.markAsDelivered();
                // Simulate some messages being opened (30% rate)
                if (Math.random() < 0.3) {
                    setTimeout(async () => {
                        await communicationLog.markAsOpened();
                        // Simulate some opened messages being clicked (20% of opened)
                        if (Math.random() < 0.2) {
                            setTimeout(async () => {
                                await communicationLog.markAsClicked();
                            }, Math.random() * 3600000); // Within 1 hour
                        }
                    }, Math.random() * 1800000); // Within 30 minutes
                }
                break;
            case 'failed':
            case 'bounced':
                await communicationLog.markAsFailed(errorCode, errorMessage);
                break;
        }

        // Update campaign statistics
        const campaign = await Campaign.findById(communicationLog.campaignId);
        if (campaign) {
            await campaign.updateStats(status === 'bounced' ? 'failed' : status);
            
            // Check if campaign is complete
            const totalSent = campaign.stats.sent + campaign.stats.failed;
            if (totalSent >= campaign.audienceSize && campaign.status === 'running') {
                await campaign.complete();
            }
        }

        console.log(`Processed delivery receipt for messageId: ${messageId}, status: ${status}`);
    } catch (error) {
        console.error('Error processing delivery receipt:', error);
        throw error;
    }
}

// Engagement tracking endpoints (for email opens, clicks)
router.get('/track/open/:messageId', async (req, res, next) => {
    try {
        const { messageId } = req.params;
        
        const communicationLog = await CommunicationLog.findOne({ messageId });
        
        if (communicationLog) {
            await communicationLog.markAsOpened();
        }

        // Return a 1x1 transparent pixel
        const pixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'base64'
        );

        res.set({
            'Content-Type': 'image/png',
            'Content-Length': pixel.length,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        res.send(pixel);
    } catch (error) {
        // Don't expose errors for tracking pixels
        const pixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            'base64'
        );
        res.set('Content-Type', 'image/png');
        res.send(pixel);
    }
});

router.get('/track/click/:messageId', async (req, res, next) => {
    try {
        const { messageId } = req.params;
        const { url } = req.query;
        
        const communicationLog = await CommunicationLog.findOne({ messageId });
        
        if (communicationLog) {
            await communicationLog.markAsClicked();
        }

        // Redirect to the actual URL or a default page
        const redirectUrl = url || 'https://example.com';
        res.redirect(redirectUrl);
    } catch (error) {
        res.redirect('https://example.com');
    }
});

// Batch processing endpoint for updating delivery statuses
router.post('/batch-update', [
    body('updates').isArray({ min: 1 }).withMessage('Updates array is required'),
    body('updates.*.messageId').notEmpty().withMessage('Message ID is required'),
    body('updates.*.status').isIn(['sent', 'delivered', 'failed', 'bounced']).withMessage('Invalid status')
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

        const { updates } = req.body;
        const results = [];

        // Process updates in batches
        for (const update of updates) {
            try {
                await processDeliveryReceipt(update);
                results.push({
                    messageId: update.messageId,
                    status: 'processed',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                results.push({
                    messageId: update.messageId,
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Processed ${results.length} updates`,
            data: {
                results,
                summary: {
                    total: results.length,
                    processed: results.filter(r => r.status === 'processed').length,
                    errors: results.filter(r => r.status === 'error').length
                }
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
