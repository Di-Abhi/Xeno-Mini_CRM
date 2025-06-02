import React from 'react';

/**
 * 🛡️ Error Boundary - Graceful error handling for better UX
 *
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the app.
 */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
      console.log('Error logged to monitoring service');
    }
  }

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    // Reload the entire page as last resort
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
            {/* Error Icon */}
            <div className="text-6xl mb-4">😵</div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>

            {/* Error Description */}
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified
              and is working to fix this issue.
            </p>

            {/* Error ID for support */}
            <div className="bg-gray-100 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-500 mb-1">Error ID (for support):</p>
              <code className="text-sm font-mono text-gray-700">
                {this.state.errorId}
              </code>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                🔄 Try Again
              </button>

              <button
                onClick={this.handleReload}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
              >
                🔃 Reload Page
              </button>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  🔍 Developer Details (Development Only)
                </summary>
                <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h3 className="font-medium text-red-800 mb-2">Error:</h3>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap mb-3">
                    {this.state.error.toString()}
                  </pre>

                  <h3 className="font-medium text-red-800 mb-2">Stack Trace:</h3>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-40">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              </details>
            )}

            {/* Help Links */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Need help?</p>
              <div className="flex justify-center space-x-4 text-sm">
                <a
                  href="mailto:support@minicrm.com"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  📧 Contact Support
                </a>
                <a
                  href="/help"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  📚 Help Center
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withErrorBoundary = (Component, fallback = null) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for error handling in functional components
export const useErrorHandler = () => {
  return (error, errorInfo) => {
    console.error('🚨 Error caught by error handler:', error, errorInfo);

    // In a real app, you might want to show a toast or modal
    // instead of throwing the error
    throw error;
  };
};

// Simple error fallback component
export const ErrorFallback = ({
  error,
  resetError,
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again."
}) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <div className="text-4xl mb-3">😵</div>
    <h3 className="text-lg font-semibold text-red-800 mb-2">{title}</h3>
    <p className="text-red-600 mb-4">{message}</p>

    {resetError && (
      <button
        onClick={resetError}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
      >
        🔄 Try Again
      </button>
    )}

    {process.env.NODE_ENV === 'development' && error && (
      <details className="mt-4 text-left">
        <summary className="cursor-pointer text-sm font-medium text-red-700">
          🔍 Error Details (Development)
        </summary>
        <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32 bg-red-100 p-2 rounded">
          {error.toString()}
        </pre>
      </details>
    )}
  </div>
);

// Network error component
export const NetworkError = ({ onRetry }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
    <div className="text-4xl mb-3">🌐</div>
    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Connection Problem</h3>
    <p className="text-yellow-600 mb-4">
      Unable to connect to the server. Please check your internet connection.
    </p>

    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200"
      >
        🔄 Retry Connection
      </button>
    )}
  </div>
);

// Not found error component
export const NotFoundError = ({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist.",
  onGoBack
}) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
    <div className="text-4xl mb-3">🔍</div>
    <h3 className="text-lg font-semibold text-blue-800 mb-2">{title}</h3>
    <p className="text-blue-600 mb-4">{message}</p>

    {onGoBack && (
      <button
        onClick={onGoBack}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
      >
        ← Go Back
      </button>
    )}
  </div>
);

export default ErrorBoundary;
