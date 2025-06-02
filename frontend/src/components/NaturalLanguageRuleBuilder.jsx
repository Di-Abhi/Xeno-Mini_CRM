import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

const NaturalLanguageRuleBuilder = ({ onRulesGenerated, disabled = false }) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a description of your target audience');
      return;
    }

    setIsProcessing(true);
    setLastResult(null);

    try {
      const result = await aiService.naturalLanguageToRules(query.trim());
      
      if (result.success) {
        setLastResult({
          success: true,
          originalQuery: query,
          rules: result.data.generatedRules,
          aiGenerated: result.data.aiGenerated
        });
        
        // Pass the generated rules to parent component
        onRulesGenerated(result.data.generatedRules);
        
        toast.success('Audience rules generated successfully!');
      } else {
        setLastResult({
          success: false,
          error: result.message || 'Failed to process query'
        });
        toast.error(result.message || 'Failed to process your query');
      }
    } catch (error) {
      console.error('Error processing natural language query:', error);
      setLastResult({
        success: false,
        error: 'Failed to connect to AI service'
      });
      toast.error('Failed to process your query. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const exampleQueries = [
    "Customers who spent more than ₹10,000",
    "High value customers from Mumbai or Delhi",
    "Inactive customers who haven't ordered in 90 days",
    "New customers with less than 3 visits",
    "Premium customers from Bangalore"
  ];

  const handleExampleClick = (example) => {
    setQuery(example);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900">
          AI-Powered Audience Builder
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600">
        Describe your target audience in plain English, and our AI will convert it into precise targeting rules.
      </p>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label htmlFor="nlQuery" className="form-label">
            Describe your target audience
          </label>
          <div className="relative">
            <textarea
              id="nlQuery"
              rows={3}
              className="input resize-none"
              placeholder="e.g., Customers who spent more than ₹5,000 and visited less than 3 times"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={disabled || isProcessing}
            />
            <div className="absolute bottom-3 right-3">
              <Sparkles className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || isProcessing || !query.trim()}
          className="btn btn-primary btn-md"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Rules
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </button>
      </form>

      {/* Example Queries */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Try these examples:</h4>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleExampleClick(example)}
              disabled={disabled || isProcessing}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {lastResult && (
        <div className={`rounded-lg border p-4 ${
          lastResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {lastResult.success ? (
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-green-800">
                      Rules Generated Successfully
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      Your query: "{lastResult.originalQuery}"
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-md p-3 border border-green-200">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">
                      Generated Rules:
                    </h5>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-600">
                        Logic: <span className="font-medium">{lastResult.rules.logic}</span>
                      </div>
                      {lastResult.rules.conditions.map((condition, index) => (
                        <div key={index} className="text-xs bg-gray-50 rounded px-2 py-1">
                          <span className="font-medium">{condition.field}</span>
                          {' '}
                          <span className="text-gray-500">{condition.operator}</span>
                          {' '}
                          <span className="font-medium">
                            {Array.isArray(condition.value) 
                              ? condition.value.join(', ') 
                              : condition.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!lastResult.aiGenerated && (
                    <div className="text-xs text-yellow-700 bg-yellow-50 rounded px-2 py-1">
                      ⚠️ AI service not configured. Using fallback rules.
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Failed to Generate Rules
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {lastResult.error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NaturalLanguageRuleBuilder;
