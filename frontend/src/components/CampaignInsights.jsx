import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

const CampaignInsights = ({ campaign, onRefresh }) => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (campaign && campaign._id) {
      generateInsights();
    }
  }, [campaign]);

  const generateInsights = async () => {
    if (!campaign?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.generateCampaignInsights(campaign._id);
      
      if (result.success) {
        setInsights(result.data.insights);
      } else {
        setError(result.message || 'Failed to generate insights');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      setError('Failed to connect to AI service');
    } finally {
      setIsLoading(false);
    }
  };

  const getPerformanceColor = (score) => {
    switch (score) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAssessmentIcon = (assessment) => {
    switch (assessment) {
      case 'excellent': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'good': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'average': return <BarChart3 className="h-4 w-4 text-yellow-600" />;
      case 'poor': 
      case 'needs_improvement': 
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!campaign) {
    return (
      <div className="card">
        <div className="card-body text-center py-8">
          <Brain className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No Campaign Selected
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Select a campaign to view AI-powered insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              AI Campaign Insights
            </h3>
          </div>
          <button
            onClick={generateInsights}
            disabled={isLoading}
            className="btn btn-secondary btn-sm"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="card-body">
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="mx-auto h-8 w-8 text-blue-600 animate-spin" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Analyzing Campaign...
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Our AI is analyzing your campaign performance.
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Analysis Failed
            </h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={generateInsights}
              className="mt-3 btn btn-primary btn-sm"
            >
              Try Again
            </button>
          </div>
        ) : insights ? (
          <div className="space-y-6">
            {/* Performance Score */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  Performance Score
                </h4>
                <p className="text-xs text-gray-500">
                  Overall campaign rating
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-lg font-bold ${getPerformanceColor(insights.performance_score)}`}>
                {insights.performance_score}
              </div>
            </div>

            {/* Summary */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Summary
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {insights.summary}
              </p>
            </div>

            {/* Key Metrics */}
            {insights.key_metrics && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Key Metrics Assessment
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {getAssessmentIcon(insights.key_metrics.delivery_rate_assessment)}
                      <span className="text-sm text-gray-700">Delivery Rate</span>
                    </div>
                    <span className="text-xs font-medium text-gray-600 capitalize">
                      {insights.key_metrics.delivery_rate_assessment?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {getAssessmentIcon(insights.key_metrics.audience_size_assessment)}
                      <span className="text-sm text-gray-700">Audience Size</span>
                    </div>
                    <span className="text-xs font-medium text-gray-600 capitalize">
                      {insights.key_metrics.audience_size_assessment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      {getAssessmentIcon(insights.key_metrics.timing_assessment)}
                      <span className="text-sm text-gray-700">Timing</span>
                    </div>
                    <span className="text-xs font-medium text-gray-600 capitalize">
                      {insights.key_metrics.timing_assessment?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Insights */}
            {insights.insights && insights.insights.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  AI Insights
                </h4>
                <div className="space-y-2">
                  {insights.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-green-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Attribution */}
            <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200">
              {insights.aiGenerated !== false ? (
                <>
                  <Brain className="inline h-3 w-3 mr-1" />
                  Powered by AI Analytics
                </>
              ) : (
                <>
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  Basic analysis (AI service not configured)
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Ready for Analysis
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Click the refresh button to generate AI insights for this campaign.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignInsights;
