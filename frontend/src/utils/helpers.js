/**
 * 🛠️ Helper Utilities - Making life easier for developers and users
 * 
 * This file contains reusable utility functions that make the app more
 * human-friendly and developer-friendly.
 */

// 📅 Date formatting utilities
export const formatDate = (date, options = {}) => {
  if (!date) return 'Not available';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateTime = (date) => {
  if (!date) return 'Not available';
  
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

export const getRelativeTime = (date) => {
  if (!date) return 'Unknown';
  
  try {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return formatDate(date);
  } catch (error) {
    return 'Unknown';
  }
};

// 💰 Currency formatting
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '₹0';
  
  try {
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    return `${currency} ${amount}`;
  }
};

// 📊 Number formatting
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  
  try {
    return new Intl.NumberFormat('en-IN').format(number);
  } catch (error) {
    return number.toString();
  }
};

// 📱 Phone number formatting
export const formatPhoneNumber = (phone) => {
  if (!phone) return 'Not provided';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format Indian phone numbers
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  
  return phone;
};

// 🎨 Status badge colors
export const getStatusColor = (status) => {
  const colors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    churned: 'bg-red-100 text-red-800',
    pending: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    sent: 'bg-blue-100 text-blue-800',
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-purple-100 text-purple-800'
  };
  
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

// 🔤 Text utilities
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// 📧 Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 📱 Phone validation
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// 🎯 Array utilities
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

// 🔍 Search utilities
export const searchInObject = (obj, searchTerm) => {
  if (!searchTerm) return true;
  
  const search = searchTerm.toLowerCase();
  
  return Object.values(obj).some(value => {
    if (typeof value === 'string') {
      return value.toLowerCase().includes(search);
    }
    if (typeof value === 'number') {
      return value.toString().includes(search);
    }
    return false;
  });
};

// 🎨 Generate avatar colors
export const getAvatarColor = (name) => {
  if (!name) return 'bg-gray-500';
  
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// 🔤 Get initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// 📊 Calculate percentage
export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

// 🎯 Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 🔄 Retry function for API calls
export const retryAsync = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryAsync(fn, retries - 1, delay);
    }
    throw error;
  }
};

// 🎨 Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// 📱 Check if mobile device
export const isMobile = () => {
  return window.innerWidth < 768;
};

// 🌙 Get greeting based on time
export const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// 🎯 Human-friendly error messages
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Something went wrong. Please try again.';
};
