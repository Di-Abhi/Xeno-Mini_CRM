import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { aiService } from '../services/aiService';

const AIStatusIndicator = ({ className = '' }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      setLoading(true);
      const result = await aiService.getStatus();
      setStatus(result.data);
    } catch (error) {
      console.error('Failed to check AI status:', error);
      setStatus({
        aiServiceAvailable: false,
        message: 'Failed to check AI service status'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Brain className="h-4 w-4 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-500">Checking AI status...</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {status.aiServiceAvailable ? (
        <>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm text-green-700 font-medium">
            AI Features Active
          </span>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-700">
            AI Features Unavailable
          </span>
        </>
      )}
    </div>
  );
};

export default AIStatusIndicator;
