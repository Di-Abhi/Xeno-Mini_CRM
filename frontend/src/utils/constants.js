/**
 * 📋 Application Constants - Single source of truth
 * 
 * This file contains all the constants used throughout the application.
 * Keeping them here makes the app easier to maintain and update.
 */

// 🎨 Brand Colors
export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8'
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a'
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706'
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626'
  }
};

// 👤 User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.USER]: 'User'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: ['create', 'read', 'update', 'delete', 'manage_users'],
  [USER_ROLES.MANAGER]: ['create', 'read', 'update', 'delete'],
  [USER_ROLES.USER]: ['read', 'update']
};

// 👥 Customer Status
export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CHURNED: 'churned'
};

export const CUSTOMER_STATUS_LABELS = {
  [CUSTOMER_STATUS.ACTIVE]: 'Active Customer',
  [CUSTOMER_STATUS.INACTIVE]: 'Inactive',
  [CUSTOMER_STATUS.CHURNED]: 'Churned'
};

// 🛍️ Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.RETURNED]: 'Returned'
};

// 💳 Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  UPI: 'upi',
  NET_BANKING: 'net_banking',
  WALLET: 'wallet',
  COD: 'cash_on_delivery'
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CREDIT_CARD]: 'Credit Card',
  [PAYMENT_METHODS.DEBIT_CARD]: 'Debit Card',
  [PAYMENT_METHODS.UPI]: 'UPI',
  [PAYMENT_METHODS.NET_BANKING]: 'Net Banking',
  [PAYMENT_METHODS.WALLET]: 'Digital Wallet',
  [PAYMENT_METHODS.COD]: 'Cash on Delivery'
};

// 📢 Campaign Types
export const CAMPAIGN_TYPES = {
  PROMOTIONAL: 'promotional',
  TRANSACTIONAL: 'transactional',
  REMINDER: 'reminder',
  WELCOME: 'welcome',
  WINBACK: 'winback'
};

export const CAMPAIGN_TYPE_LABELS = {
  [CAMPAIGN_TYPES.PROMOTIONAL]: 'Promotional',
  [CAMPAIGN_TYPES.TRANSACTIONAL]: 'Transactional',
  [CAMPAIGN_TYPES.REMINDER]: 'Reminder',
  [CAMPAIGN_TYPES.WELCOME]: 'Welcome',
  [CAMPAIGN_TYPES.WINBACK]: 'Win-back'
};

export const CAMPAIGN_TYPE_DESCRIPTIONS = {
  [CAMPAIGN_TYPES.PROMOTIONAL]: 'Marketing campaigns for sales, discounts, and offers',
  [CAMPAIGN_TYPES.TRANSACTIONAL]: 'Order confirmations, receipts, and updates',
  [CAMPAIGN_TYPES.REMINDER]: 'Gentle reminders for cart abandonment or renewals',
  [CAMPAIGN_TYPES.WELCOME]: 'Welcome new customers and onboard them',
  [CAMPAIGN_TYPES.WINBACK]: 'Re-engage inactive or churned customers'
};

// 📱 Communication Channels
export const CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WHATSAPP: 'whatsapp'
};

export const CHANNEL_LABELS = {
  [CHANNELS.EMAIL]: 'Email',
  [CHANNELS.SMS]: 'SMS',
  [CHANNELS.PUSH]: 'Push Notification',
  [CHANNELS.WHATSAPP]: 'WhatsApp'
};

export const CHANNEL_ICONS = {
  [CHANNELS.EMAIL]: '📧',
  [CHANNELS.SMS]: '💬',
  [CHANNELS.PUSH]: '🔔',
  [CHANNELS.WHATSAPP]: '📱'
};

// 📊 Campaign Status
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  RUNNING: 'running',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
};

export const CAMPAIGN_STATUS_LABELS = {
  [CAMPAIGN_STATUS.DRAFT]: 'Draft',
  [CAMPAIGN_STATUS.SCHEDULED]: 'Scheduled',
  [CAMPAIGN_STATUS.RUNNING]: 'Running',
  [CAMPAIGN_STATUS.COMPLETED]: 'Completed',
  [CAMPAIGN_STATUS.PAUSED]: 'Paused',
  [CAMPAIGN_STATUS.CANCELLED]: 'Cancelled'
};

// 🎯 Audience Rules Operators
export const OPERATORS = {
  EQUALS: 'eq',
  NOT_EQUALS: 'ne',
  GREATER_THAN: 'gt',
  GREATER_THAN_EQUAL: 'gte',
  LESS_THAN: 'lt',
  LESS_THAN_EQUAL: 'lte',
  IN: 'in',
  NOT_IN: 'nin',
  CONTAINS: 'contains'
};

export const OPERATOR_LABELS = {
  [OPERATORS.EQUALS]: 'equals',
  [OPERATORS.NOT_EQUALS]: 'does not equal',
  [OPERATORS.GREATER_THAN]: 'is greater than',
  [OPERATORS.GREATER_THAN_EQUAL]: 'is greater than or equal to',
  [OPERATORS.LESS_THAN]: 'is less than',
  [OPERATORS.LESS_THAN_EQUAL]: 'is less than or equal to',
  [OPERATORS.IN]: 'is one of',
  [OPERATORS.NOT_IN]: 'is not one of',
  [OPERATORS.CONTAINS]: 'contains'
};

// 📋 Customer Fields for Audience Rules
export const CUSTOMER_FIELDS = {
  TOTAL_SPENT: 'totalSpent',
  VISIT_COUNT: 'visitCount',
  DAYS_SINCE_LAST_ORDER: 'daysSinceLastOrder',
  STATUS: 'status',
  CITY: 'city',
  VALUE_CATEGORY: 'valueCategory'
};

export const CUSTOMER_FIELD_LABELS = {
  [CUSTOMER_FIELDS.TOTAL_SPENT]: 'Total Amount Spent',
  [CUSTOMER_FIELDS.VISIT_COUNT]: 'Number of Orders',
  [CUSTOMER_FIELDS.DAYS_SINCE_LAST_ORDER]: 'Days Since Last Order',
  [CUSTOMER_FIELDS.STATUS]: 'Customer Status',
  [CUSTOMER_FIELDS.CITY]: 'City',
  [CUSTOMER_FIELDS.VALUE_CATEGORY]: 'Value Category'
};

// 🏆 Value Categories
export const VALUE_CATEGORIES = {
  NEW: 'new',
  REGULAR: 'regular',
  HIGH_VALUE: 'high-value',
  PREMIUM: 'premium'
};

export const VALUE_CATEGORY_LABELS = {
  [VALUE_CATEGORIES.NEW]: 'New Customer',
  [VALUE_CATEGORIES.REGULAR]: 'Regular Customer',
  [VALUE_CATEGORIES.HIGH_VALUE]: 'High-Value Customer',
  [VALUE_CATEGORIES.PREMIUM]: 'Premium Customer'
};

// 📱 Responsive Breakpoints
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// ⏱️ Time Constants
export const TIME_FORMATS = {
  DATE_ONLY: 'YYYY-MM-DD',
  DATE_TIME: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATE_TIME: 'MMM DD, YYYY HH:mm'
};

// 📊 Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100
};

// 🔍 Search
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300
};

// 📁 File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'text/csv', 'application/json'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.csv', '.json']
};

// 🌍 Supported Countries
export const COUNTRIES = {
  IN: 'India',
  US: 'United States',
  UK: 'United Kingdom',
  CA: 'Canada'
};

// 🏙️ Indian Cities (for demo)
export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad'
];

// 🎨 Theme Configuration
export const THEME = {
  SIDEBAR_WIDTH: '256px',
  HEADER_HEIGHT: '64px',
  BORDER_RADIUS: '8px',
  SHADOW: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
};

// 🔔 Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// 📈 Chart Colors
export const CHART_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

// 🎯 Default Values
export const DEFAULTS = {
  CURRENCY: 'INR',
  COUNTRY: 'IN',
  TIMEZONE: 'Asia/Kolkata',
  LANGUAGE: 'en',
  DATE_FORMAT: 'DD/MM/YYYY'
};
