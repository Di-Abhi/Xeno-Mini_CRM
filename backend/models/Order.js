const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer ID is required']
    },
    orderNumber: {
        type: String,
        unique: true,
        required: [true, 'Order number is required']
    },
    amount: {
        type: Number,
        required: [true, 'Order amount is required'],
        min: [0, 'Order amount cannot be negative']
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    items: [{
        productName: {
            type: String,
            required: true,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: String,
            trim: true
        }
    }],
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'India'
        }
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'cash_on_delivery', 'wallet'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Date
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
    const diffTime = Math.abs(new Date() - this.orderDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Index for efficient queries (orderNumber already has unique index)
orderSchema.index({ customerId: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ amount: -1 });

// Pre-validate middleware to generate order number if not provided
orderSchema.pre('validate', async function(next) {
    if (!this.orderNumber) {
        const count = await this.constructor.countDocuments();
        this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
    }
    next();
});

// Post-save middleware to update customer metrics
orderSchema.post('save', async function(doc) {
    try {
        const Customer = mongoose.model('Customer');
        const customer = await Customer.findById(doc.customerId);

        if (customer && doc.status === 'delivered') {
            await customer.updateMetrics(doc.amount);
        }
    } catch (error) {
        console.error('Error updating customer metrics:', error);
    }
});

// Static method to get order statistics
orderSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$amount' },
                averageOrderValue: { $avg: '$amount' },
                pendingOrders: {
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                deliveredOrders: {
                    $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        pendingOrders: 0,
        deliveredOrders: 0
    };
};

// Static method to get orders by date range
orderSchema.statics.getOrdersByDateRange = function(startDate, endDate) {
    return this.find({
        orderDate: {
            $gte: startDate,
            $lte: endDate
        }
    }).populate('customerId', 'name email');
};

module.exports = mongoose.model('Order', orderSchema);
