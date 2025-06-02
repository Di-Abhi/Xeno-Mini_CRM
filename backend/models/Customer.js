const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email address'
        ]
    },
    phone: {
        type: String,
        trim: true,
        match: [
            /^[\+]?[1-9][\d]{0,15}$/,
            'Please enter a valid phone number'
        ]
    },
    totalSpent: {
        type: Number,
        default: 0,
        min: [0, 'Total spent cannot be negative']
    },
    visitCount: {
        type: Number,
        default: 0,
        min: [0, 'Visit count cannot be negative']
    },
    lastOrderDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // Additional fields for segmentation
    status: {
        type: String,
        enum: ['active', 'inactive', 'churned'],
        default: 'active'
    },
    tags: [{
        type: String,
        trim: true
    }],
    // Location data (optional)
    city: {
        type: String,
        trim: true
    },
    country: {
        type: String,
        trim: true,
        default: 'India'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for days since last order
customerSchema.virtual('daysSinceLastOrder').get(function() {
    if (!this.lastOrderDate) return null;
    const diffTime = Math.abs(new Date() - this.lastOrderDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for customer lifetime value category
customerSchema.virtual('valueCategory').get(function() {
    if (this.totalSpent >= 50000) return 'premium';
    if (this.totalSpent >= 10000) return 'high-value';
    if (this.totalSpent >= 1000) return 'regular';
    return 'new';
});

// Index for efficient queries
customerSchema.index({ email: 1 });
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ lastOrderDate: -1 });
customerSchema.index({ createdAt: -1 });
customerSchema.index({ status: 1 });

// Pre-save middleware to update the updatedAt field
customerSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Static method to get customer statistics
customerSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalCustomers: { $sum: 1 },
                averageSpent: { $avg: '$totalSpent' },
                totalRevenue: { $sum: '$totalSpent' },
                activeCustomers: {
                    $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                }
            }
        }
    ]);
    
    return stats[0] || {
        totalCustomers: 0,
        averageSpent: 0,
        totalRevenue: 0,
        activeCustomers: 0
    };
};

// Instance method to update customer metrics
customerSchema.methods.updateMetrics = async function(orderAmount) {
    this.totalSpent += orderAmount;
    this.visitCount += 1;
    this.lastOrderDate = new Date();
    this.status = 'active';
    return this.save();
};

module.exports = mongoose.model('Customer', customerSchema);
