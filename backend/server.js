const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables first
dotenv.config();

// Welcome message
console.log('🚀 Starting Mini CRM Platform...');
console.log('📅 Started at:', new Date().toLocaleString());
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');

// Production optimizations
if (process.env.NODE_ENV === 'production') {
    console.log('🔧 Production mode enabled');
    // Disable detailed error messages in production
    app.set('trust proxy', 1);
}

// Import routes
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const campaignRoutes = require('./routes/campaigns');
const authRoutes = require('./routes/auth');
const vendorRoutes = require('./routes/vendor');
const aiRoutes = require('./routes/ai');

const app = express();

// 🛡️ Security & CORS Configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, 'https://xeno-mini-crm-five.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'];

console.log('🔧 CORS allowed origins:', allowedOrigins);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 📝 Body parsing middleware
app.use(express.json({
    limit: '10mb',
    type: 'application/json'
}));
app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));

// 📊 Request logging middleware (human-friendly)
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleString();
    const method = req.method.padEnd(6);
    const url = req.path;
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log(`📡 ${timestamp} | ${method} | ${url}`);

    // Log user info if available
    if (req.headers.authorization) {
        console.log(`👤 Authenticated request from: ${userAgent.split(' ')[0]}`);
    }

    next();
});

// 🗄️ Database connection with retry logic
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-crm';

        console.log('🔌 Connecting to MongoDB...');

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });

        console.log('✅ MongoDB connected successfully!');
        console.log(`📍 Database: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('🔄 Retrying in 5 seconds...');

        setTimeout(() => {
            console.log('🔄 Attempting to reconnect to MongoDB...');
            connectDB();
        }, 5000);
    }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err.message);
});

mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected successfully!');
});

// Connect to database
connectDB();

// 🏥 Health check endpoint with detailed system info
app.get('/health', (req, res) => {
    const uptime = process.uptime();
    const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

    res.status(200).json({
        status: 'OK',
        message: '🚀 Mini CRM Platform is running smoothly!',
        timestamp: new Date().toLocaleString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: uptimeFormatted,
        database: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌',
        memory: {
            used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
            total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`
        },
        version: '1.0.0'
    });
});

// Remove duplicate routes - using routes from /api/auth instead

// API Routes
console.log('Loading API routes...');
try {
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.error('❌ Error loading auth routes:', error.message);
}

try {
    app.use('/api/customers', customerRoutes);
    console.log('✅ Customer routes loaded');
} catch (error) {
    console.error('❌ Error loading customer routes:', error.message);
}

try {
    app.use('/api/orders', orderRoutes);
    console.log('✅ Order routes loaded');
} catch (error) {
    console.error('❌ Error loading order routes:', error.message);
}

try {
    app.use('/api/campaigns', campaignRoutes);
    console.log('✅ Campaign routes loaded');
} catch (error) {
    console.error('❌ Error loading campaign routes:', error.message);
}

try {
    app.use('/api/vendor', vendorRoutes);
    console.log('✅ Vendor routes loaded');
} catch (error) {
    console.error('❌ Error loading vendor routes:', error.message);
}

try {
    app.use('/api/ai', aiRoutes);
    console.log('✅ AI routes loaded');
} catch (error) {
    console.error('❌ Error loading AI routes:', error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Routes loaded:`);
    console.log(`   - /api/auth`);
    console.log(`   - /api/customers`);
    console.log(`   - /api/orders`);
    console.log(`   - /api/campaigns`);
    console.log(`   - /api/vendor`);
    console.log(`   - /api/ai`);
});

module.exports = app;
