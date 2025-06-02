const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Campaign name is required'],
        trim: true,
        maxlength: [100, 'Campaign name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // Audience segmentation rules
    audienceRules: {
        conditions: [{
            field: {
                type: String,
                required: true,
                enum: ['totalSpent', 'visitCount', 'daysSinceLastOrder', 'status', 'city', 'valueCategory']
            },
            operator: {
                type: String,
                required: true,
                enum: ['gt', 'gte', 'lt', 'lte', 'eq', 'ne', 'in', 'nin', 'exists']
            },
            value: {
                type: mongoose.Schema.Types.Mixed,
                required: true
            }
        }],
        logic: {
            type: String,
            enum: ['AND', 'OR'],
            default: 'AND'
        }
    },
    // Message template
    messageTemplate: {
        type: String,
        required: [true, 'Message template is required'],
        maxlength: [1000, 'Message template cannot exceed 1000 characters']
    },
    // Campaign metrics
    audienceSize: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'scheduled', 'running', 'completed', 'paused', 'cancelled'],
        default: 'draft'
    },
    scheduledAt: {
        type: Date
    },
    startedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    // Delivery statistics
    stats: {
        sent: {
            type: Number,
            default: 0
        },
        delivered: {
            type: Number,
            default: 0
        },
        failed: {
            type: Number,
            default: 0
        },
        pending: {
            type: Number,
            default: 0
        }
    },
    // Campaign type and channel
    type: {
        type: String,
        enum: ['promotional', 'transactional', 'reminder', 'welcome', 'winback'],
        default: 'promotional'
    },
    channel: {
        type: String,
        enum: ['email', 'sms', 'push', 'whatsapp'],
        default: 'email'
    },
    // Creator information
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // AI-generated insights (optional)
    aiInsights: {
        summary: String,
        recommendations: [String],
        predictedPerformance: {
            expectedDeliveryRate: Number,
            expectedEngagementRate: Number
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for delivery rate
campaignSchema.virtual('deliveryRate').get(function() {
    if (this.stats.sent === 0) return 0;
    return ((this.stats.delivered / this.stats.sent) * 100).toFixed(2);
});

// Virtual for failure rate
campaignSchema.virtual('failureRate').get(function() {
    if (this.stats.sent === 0) return 0;
    return ((this.stats.failed / this.stats.sent) * 100).toFixed(2);
});

// Virtual for campaign duration
campaignSchema.virtual('duration').get(function() {
    if (!this.startedAt || !this.completedAt) return null;
    const diffTime = Math.abs(this.completedAt - this.startedAt);
    return Math.ceil(diffTime / (1000 * 60)); // Duration in minutes
});

// Index for efficient queries
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ createdBy: 1 });
campaignSchema.index({ type: 1 });
campaignSchema.index({ scheduledAt: 1 });

// Static method to evaluate audience rules
campaignSchema.statics.evaluateAudience = async function(rules) {
    const Customer = mongoose.model('Customer');
    
    if (!rules || !rules.conditions || rules.conditions.length === 0) {
        return [];
    }
    
    let query = {};
    
    if (rules.logic === 'OR') {
        query.$or = rules.conditions.map(condition => {
            return buildConditionQuery(condition);
        });
    } else {
        // AND logic (default)
        rules.conditions.forEach(condition => {
            const conditionQuery = buildConditionQuery(condition);
            Object.assign(query, conditionQuery);
        });
    }
    
    return await Customer.find(query);
};

// Helper function to build MongoDB query from condition
function buildConditionQuery(condition) {
    const { field, operator, value } = condition;
    let query = {};
    
    switch (operator) {
        case 'gt':
            query[field] = { $gt: value };
            break;
        case 'gte':
            query[field] = { $gte: value };
            break;
        case 'lt':
            query[field] = { $lt: value };
            break;
        case 'lte':
            query[field] = { $lte: value };
            break;
        case 'eq':
            query[field] = value;
            break;
        case 'ne':
            query[field] = { $ne: value };
            break;
        case 'in':
            query[field] = { $in: Array.isArray(value) ? value : [value] };
            break;
        case 'nin':
            query[field] = { $nin: Array.isArray(value) ? value : [value] };
            break;
        case 'exists':
            query[field] = { $exists: Boolean(value) };
            break;
        default:
            query[field] = value;
    }
    
    return query;
}

// Instance method to update campaign statistics
campaignSchema.methods.updateStats = function(status) {
    if (this.stats[status] !== undefined) {
        this.stats[status] += 1;
    }
    return this.save();
};

// Instance method to start campaign
campaignSchema.methods.start = function() {
    this.status = 'running';
    this.startedAt = new Date();
    return this.save();
};

// Instance method to complete campaign
campaignSchema.methods.complete = function() {
    this.status = 'completed';
    this.completedAt = new Date();
    return this.save();
};

module.exports = mongoose.model('Campaign', campaignSchema);
