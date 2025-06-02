import React, { useState } from 'react';
import { Sparkles, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

const AIMessageSuggestions = ({
  campaignData,
  onMessageSelect,
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const generateSuggestions = async () => {
    if (!campaignData.name || !campaignData.type || !campaignData.channel) {
      toast.error('Please fill in campaign name, type, and channel first');
      return;
    }

    console.log('🤖 Generating AI suggestions with data:', campaignData);

    setIsGenerating(true);
    setSuggestions([]);

    try {
      const requestData = {
        campaignName: campaignData.name,
        name: campaignData.name, // Add both for compatibility
        type: campaignData.type,
        channel: campaignData.channel,
        audienceSize: campaignData.audienceSize || 100,
        audienceRules: campaignData.audienceRules || {}
      };

      console.log('📤 Sending request:', requestData);

      const result = await aiService.generateMessageSuggestions(requestData);

      console.log('📥 Received response:', result);

      if (result.success) {
        console.log('✅ Suggestions received:', result.data.suggestions);
        setSuggestions(result.data.suggestions);
        toast.success('Message suggestions generated!');
      } else {
        console.log('❌ Request failed:', result.message);
        toast.error(result.message || 'Failed to generate suggestions');
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);

      // More specific error messages
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'Invalid request data';
        toast.error(`Validation error: ${errorMsg}`);
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Network error. Check your connection.');
      } else {
        toast.error('Failed to generate message suggestions');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectMessage = (suggestion, index) => {
    setSelectedIndex(index);
    // Create a complete message including subject if available
    const fullMessage = suggestion.subject
      ? `Subject: ${suggestion.subject}\n\n${suggestion.message || suggestion.content}`
      : (suggestion.message || suggestion.content);
    onMessageSelect(fullMessage);
    toast.success('Message selected!');
  };

  const handleCopyMessage = async (suggestion) => {
    try {
      const fullMessage = suggestion.subject
        ? `Subject: ${suggestion.subject}\n\n${suggestion.message || suggestion.content}`
        : (suggestion.message || suggestion.content);
      await navigator.clipboard.writeText(fullMessage);
      toast.success('Message copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy message:', error);
      toast.error('Failed to copy message');
    }
  };

  const getToneColor = (tone) => {
    const colors = {
      friendly: 'bg-green-100 text-green-800',
      professional: 'bg-blue-100 text-blue-800',
      urgent: 'bg-red-100 text-red-800',
      casual: 'bg-yellow-100 text-yellow-800',
      formal: 'bg-gray-100 text-gray-800'
    };
    return colors[tone] || 'bg-gray-100 text-gray-800';
  };

  const getFocusColor = (focus) => {
    const colors = {
      discount: 'bg-purple-100 text-purple-800',
      product: 'bg-indigo-100 text-indigo-800',
      service: 'bg-teal-100 text-teal-800',
      relationship: 'bg-pink-100 text-pink-800'
    };
    return colors[focus] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">
            AI Message Suggestions
          </h3>
        </div>
        <button
          onClick={generateSuggestions}
          disabled={disabled || isGenerating}
          className="btn btn-primary btn-sm"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Suggestions
            </>
          )}
        </button>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600">
        Get AI-powered message suggestions tailored to your campaign type, channel, and target audience.
      </p>

      {/* Campaign Info */}
      {campaignData.name && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Campaign Details:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <span className="ml-2 font-medium">{campaignData.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 font-medium capitalize">{campaignData.type}</span>
            </div>
            <div>
              <span className="text-gray-500">Channel:</span>
              <span className="ml-2 font-medium capitalize">{campaignData.channel}</span>
            </div>
            <div>
              <span className="text-gray-500">Audience:</span>
              <span className="ml-2 font-medium">{campaignData.audienceSize || 'TBD'} customers</span>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">
            Generated Suggestions:
          </h4>

          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all ${
                  selectedIndex === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Message Text */}
                  <div className="relative">
                    {/* Handle both email and SMS formats */}
                    {suggestion.subject && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 font-medium">Subject:</p>
                        <p className="text-sm text-gray-900 font-medium">{suggestion.subject}</p>
                        <div className="mt-1 p-1 bg-green-50 rounded">
                          <p className="text-xs text-green-600 font-medium">Preview:</p>
                          <p className="text-sm text-green-800 italic">
                            {suggestion.subject
                              .replace(/\{name\}/g, 'John Doe')
                              .replace(/\{totalSpent\}/g, '₹15,000')
                              .replace(/\{visitCount\}/g, '8')
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="mb-2">
                      {suggestion.subject && (
                        <p className="text-xs text-gray-500 font-medium">Message:</p>
                      )}
                      <p className="text-sm text-gray-900 leading-relaxed">
                        {suggestion.message || suggestion.content || 'No message content'}
                      </p>

                      {/* Preview with sample data */}
                      <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-200">
                        <p className="text-xs text-blue-600 font-medium mb-1">Preview with sample data:</p>
                        <p className="text-sm text-blue-800 italic">
                          {(suggestion.message || suggestion.content || '')
                            .replace(/\{name\}/g, 'John Doe')
                            .replace(/\{totalSpent\}/g, '₹15,000')
                            .replace(/\{visitCount\}/g, '8')
                          }
                        </p>
                      </div>
                    </div>
                    {selectedIndex === index && (
                      <div className="absolute top-0 right-0">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex items-center space-x-2">
                    <span className={`badge text-xs ${getToneColor(suggestion.tone)}`}>
                      {suggestion.tone}
                    </span>
                    <span className={`badge text-xs ${getFocusColor(suggestion.focus)}`}>
                      {suggestion.focus}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Suggestion {index + 1} of {suggestions.length}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyMessage(suggestion)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </button>
                      <button
                        onClick={() => handleSelectMessage(suggestion, index)}
                        className={`btn btn-sm ${
                          selectedIndex === index
                            ? 'btn-success'
                            : 'btn-primary'
                        }`}
                      >
                        {selectedIndex === index ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </>
                        ) : (
                          'Use This'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && !isGenerating && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Sparkles className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No suggestions yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Click "Generate Suggestions" to get AI-powered message ideas.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="text-center py-8">
          <RefreshCw className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Generating suggestions...
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Our AI is crafting personalized messages for your campaign.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIMessageSuggestions;
