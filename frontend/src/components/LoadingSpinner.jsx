import React from 'react';

/**
 * 🌀 Loading Spinner - Beautiful loading states for better UX
 *
 * This component provides various loading states with smooth animations
 * and human-friendly messages to keep users engaged.
 */

const LoadingSpinner = ({
  size = 'md',
  message = 'Loading...',
  fullScreen = false,
  variant = 'default',
  className = ''
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Variant configurations
  const variants = {
    default: 'border-blue-600',
    success: 'border-green-600',
    warning: 'border-yellow-600',
    error: 'border-red-600'
  };

  // Spinner component
  const Spinner = () => (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Main spinner */}
      <div className="relative">
        <div
          className={`
            ${sizeClasses[size]}
            border-4 border-gray-200 border-t-transparent
            ${variants[variant]}
            rounded-full animate-spin
          `}
        />
        {/* Inner spinner for extra effect */}
        <div
          className={`
            absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            ${size === 'xl' ? 'w-8 h-8' : size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-2 h-2'}
            border-2 border-gray-300 border-b-transparent
            ${variants[variant]}
            rounded-full animate-spin
          `}
          style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
        />
      </div>

      {/* Loading message */}
      {message && (
        <div className="text-center">
          <p className="text-gray-600 font-medium">{message}</p>
          <div className="flex justify-center mt-2 space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
    </div>
  );

  // Full screen loading
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4">
          <Spinner />
        </div>
      </div>
    );
  }

  // Regular loading
  return <Spinner />;
};

// Skeleton loading component for content placeholders
export const SkeletonLoader = ({ lines = 3, className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div key={index} className="flex space-x-4 mb-4">
        <div className="rounded-full bg-gray-200 h-10 w-10" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Button loading state
export const ButtonSpinner = ({ size = 'sm' }) => (
  <div
    className={`
      ${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}
      border-2 border-white border-t-transparent
      rounded-full animate-spin
    `}
  />
);

export default LoadingSpinner;
