const mongoose = require('mongoose');

const communicationLogSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: [true, 'Campaign ID is required']
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer ID is required']
    },
    messageId: {
        type: String,
        unique: true,
        required: [true, 'Message ID is required']
    },
    message: {
        type: String,
        required: [true, 'Message content is required'],
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    channel: {
        type: String,
        enum: ['email', 'sms', 'push', 'whatsapp'],
        required: [true, 'Communication channel is required']
    },
    status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'],
        default: 'pending'
    },
    // Delivery details
    sentAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    failedAt: {
        type: Date
    },
    // Error information for failed messages
    errorCode: {
        type: String
    },
    errorMessage: {
        type: String
    },
    // Vendor information
    vendorId: {
        type: String
    },
    vendorResponse: {
        type: mongoose.Schema.Types.Mixed
    },
    // Engagement tracking
    openedAt: {
        type: Date
    },
    clickedAt: {
        type: Date
    },
    // Retry information
    retryCount: {
        type: Number,
        default: 0,
        max: 3
    },
    nextRetryAt: {
        type: Date
    },
    // Personalization data
    personalizedData: {
        customerName: String,
        offerDetails: String,
        customFields: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for delivery time (time taken from sent to delivered)
communicationLogSchema.virtual('deliveryTime').get(function() {
    if (!this.sentAt || !this.deliveredAt) return null;
    const diffTime = Math.abs(this.deliveredAt - this.sentAt);
    return Math.ceil(diffTime / (1000 * 60)); // Time in minutes
});

// Virtual for message age
communicationLogSchema.virtual('messageAge').get(function() {
    const diffTime = Math.abs(new Date() - this.createdAt);
    return Math.ceil(diffTime / (1000 * 60 * 60)); // Age in hours
});

// Index for efficient queries (messageId already has unique index)
communicationLogSchema.index({ campaignId: 1 });
communicationLogSchema.index({ customerId: 1 });
communicationLogSchema.index({ status: 1 });
communicationLogSchema.index({ sentAt: -1 });
communicationLogSchema.index({ channel: 1 });
communicationLogSchema.index({ nextRetryAt: 1 });

// Pre-save middleware to generate message ID if not provided
communicationLogSchema.pre('save', function(next) {
    if (!this.messageId) {
        this.messageId = `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    next();
});

// Static method to get communication statistics for a campaign
communicationLogSchema.statics.getCampaignStats = async function(campaignId) {
    const stats = await this.aggregate([
        { $match: { campaignId: mongoose.Types.ObjectId(campaignId) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const result = {
        pending: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        bounced: 0,
        opened: 0,
        clicked: 0
    };

    stats.forEach(stat => {
        result[stat._id] = stat.count;
    });

    return result;
};

// Static method to get messages that need retry
communicationLogSchema.statics.getMessagesForRetry = function() {
    return this.find({
        status: 'failed',
        retryCount: { $lt: 3 },
        nextRetryAt: { $lte: new Date() }
    }).populate('campaignId customerId');
};

// Instance method to mark as sent
communicationLogSchema.methods.markAsSent = function() {
    this.status = 'sent';
    this.sentAt = new Date();
    return this.save();
};

// Instance method to mark as delivered
communicationLogSchema.methods.markAsDelivered = function() {
    this.status = 'delivered';
    this.deliveredAt = new Date();
    return this.save();
};

// Instance method to mark as failed
communicationLogSchema.methods.markAsFailed = function(errorCode, errorMessage) {
    this.status = 'failed';
    this.failedAt = new Date();
    this.errorCode = errorCode;
    this.errorMessage = errorMessage;
    this.retryCount += 1;

    // Set next retry time (exponential backoff)
    const retryDelayMinutes = Math.pow(2, this.retryCount) * 5; // 5, 10, 20 minutes
    this.nextRetryAt = new Date(Date.now() + retryDelayMinutes * 60 * 1000);

    return this.save();
};

// Instance method to mark as opened
communicationLogSchema.methods.markAsOpened = function() {
    if (this.status === 'delivered') {
        this.status = 'opened';
        this.openedAt = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

// Instance method to mark as clicked
communicationLogSchema.methods.markAsClicked = function() {
    if (['delivered', 'opened'].includes(this.status)) {
        this.status = 'clicked';
        this.clickedAt = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

module.exports = mongoose.model('CommunicationLog', communicationLogSchema);
