const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

// Connect to database
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-crm';
        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Sample data - Single admin user
const sampleUsers = [
    {
        name: 'Admin User',
        email: 'admin@minicrm.com',
        password: 'admin123',
        role: 'admin'
    }
];

const sampleCustomers = [
    {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '+919876543210',
        totalSpent: 25000,
        visitCount: 8,
        lastOrderDate: new Date('2024-01-15'),
        status: 'active',
        city: 'Mumbai',
        country: 'India',
        tags: ['premium', 'loyal']
    },
    {
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+919876543211',
        totalSpent: 8500,
        visitCount: 4,
        lastOrderDate: new Date('2024-01-20'),
        status: 'active',
        city: 'Delhi',
        country: 'India',
        tags: ['regular']
    },
    {
        name: 'Amit Patel',
        email: 'amit.patel@email.com',
        phone: '+919876543212',
        totalSpent: 45000,
        visitCount: 12,
        lastOrderDate: new Date('2024-01-25'),
        status: 'active',
        city: 'Bangalore',
        country: 'India',
        tags: ['premium', 'vip']
    },
    {
        name: 'Sneha Reddy',
        email: 'sneha.reddy@email.com',
        phone: '+919876543213',
        totalSpent: 3200,
        visitCount: 2,
        lastOrderDate: new Date('2023-12-10'),
        status: 'inactive',
        city: 'Hyderabad',
        country: 'India',
        tags: ['new']
    },
    {
        name: 'Vikram Singh',
        email: 'vikram.singh@email.com',
        phone: '+919876543214',
        totalSpent: 15000,
        visitCount: 6,
        lastOrderDate: new Date('2024-01-18'),
        status: 'active',
        city: 'Pune',
        country: 'India',
        tags: ['regular', 'tech-savvy']
    },
    {
        name: 'Anita Gupta',
        email: 'anita.gupta@email.com',
        phone: '+919876543215',
        totalSpent: 1200,
        visitCount: 1,
        lastOrderDate: new Date('2023-11-05'),
        status: 'churned',
        city: 'Chennai',
        country: 'India',
        tags: ['new']
    },
    {
        name: 'Rohit Agarwal',
        email: 'rohit.agarwal@email.com',
        phone: '+919876543216',
        totalSpent: 32000,
        visitCount: 15,
        lastOrderDate: new Date('2024-01-22'),
        status: 'active',
        city: 'Kolkata',
        country: 'India',
        tags: ['premium', 'frequent']
    },
    {
        name: 'Kavya Nair',
        email: 'kavya.nair@email.com',
        phone: '+919876543217',
        totalSpent: 6800,
        visitCount: 3,
        lastOrderDate: new Date('2024-01-12'),
        status: 'active',
        city: 'Kochi',
        country: 'India',
        tags: ['regular']
    }
];

const sampleOrders = [
    {
        amount: 5000,
        currency: 'INR',
        status: 'delivered',
        items: [
            { productName: 'Smartphone', quantity: 1, price: 5000, category: 'Electronics' }
        ],
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        orderDate: new Date('2024-01-15')
    },
    {
        amount: 2500,
        currency: 'INR',
        status: 'delivered',
        items: [
            { productName: 'Headphones', quantity: 1, price: 2500, category: 'Electronics' }
        ],
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        orderDate: new Date('2024-01-20')
    },
    {
        amount: 15000,
        currency: 'INR',
        status: 'delivered',
        items: [
            { productName: 'Laptop', quantity: 1, price: 15000, category: 'Electronics' }
        ],
        paymentMethod: 'net_banking',
        paymentStatus: 'paid',
        orderDate: new Date('2024-01-25')
    },
    {
        amount: 800,
        currency: 'INR',
        status: 'cancelled',
        items: [
            { productName: 'Book Set', quantity: 1, price: 800, category: 'Books' }
        ],
        paymentMethod: 'cash_on_delivery',
        paymentStatus: 'pending',
        orderDate: new Date('2023-12-10')
    },
    {
        amount: 3500,
        currency: 'INR',
        status: 'delivered',
        items: [
            { productName: 'Shoes', quantity: 1, price: 3500, category: 'Fashion' }
        ],
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        orderDate: new Date('2024-01-18')
    }
];

// Seed function
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Customer.deleteMany({});
        await Order.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create users (one by one to trigger pre-save middleware for password hashing)
        const users = [];
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            users.push(user);
        }
        console.log(`👥 Created ${users.length} users`);

        // Create customers
        const customers = await Customer.insertMany(sampleCustomers);
        console.log(`👤 Created ${customers.length} customers`);

        // Create orders with customer references (one by one to trigger pre-save middleware)
        const orders = [];
        for (let i = 0; i < sampleOrders.length; i++) {
            const orderData = {
                ...sampleOrders[i],
                customerId: customers[i % customers.length]._id
            };
            const order = new Order(orderData);
            await order.save();
            orders.push(order);
        }
        console.log(`📦 Created ${orders.length} orders`);

        console.log('✅ Database seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Users: ${users.length}`);
        console.log(`   Customers: ${customers.length}`);
        console.log(`   Orders: ${orders.length}`);

        console.log('\n🔑 Login Credentials:');
        console.log('   Admin: admin@minicrm.com / admin123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run seeder
if (require.main === module) {
    connectDB().then(() => {
        seedDatabase();
    });
}

module.exports = { seedDatabase };
