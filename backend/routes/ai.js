const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const aiService = require('../services/aiService');
const Campaign = require('../models/Campaign');

const router = express.Router();

// POST /api/ai/natural-language-rules - Convert natural language to audience rules
router.post('/natural-language-rules', auth, [
  body('query')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Query must be between 5 and 500 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { query } = req.body;

    if (!aiService.isAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI service is not available. Please configure OpenAI API key.',
        fallback: {
          rules: {
            conditions: [
              {
                field: 'totalSpent',
                operator: 'gt',
                value: 1000
              }
            ],
            logic: 'AND'
          },
          note: 'This is a fallback rule. Configure AI service for natural language processing.'
        }
      });
    }

    const result = await aiService.naturalLanguageToRules(query);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to process natural language query',
        error: result.error,
        originalQuery: query
      });
    }

    res.status(200).json({
      success: true,
      message: 'Natural language query processed successfully',
      data: {
        originalQuery: query,
        generatedRules: result.rules,
        aiGenerated: true
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/message-suggestions - Generate AI-powered message suggestions
router.post('/message-suggestions', auth, [
  body('campaignName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Campaign name is required'),
  body('type')
    .isIn(['promotional', 'transactional', 'reminder', 'welcome', 'winback'])
    .withMessage('Invalid campaign type'),
  body('channel')
    .isIn(['email', 'sms', 'push', 'whatsapp'])
    .withMessage('Invalid channel'),
  body('audienceSize')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Audience size must be a positive integer'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const campaignData = req.body;

    if (!aiService.isAvailable()) {
      // Provide fallback suggestions
      const fallbackSuggestions = [
        {
          message: `Hi {name}, we have a special offer just for you! Don't miss out.`,
          tone: 'friendly',
          focus: 'discount'
        },
        {
          message: `Dear {name}, thank you for being a valued customer. Here's something special.`,
          tone: 'professional',
          focus: 'service'
        },
        {
          message: `{name}, limited time offer! Get exclusive access to our latest products.`,
          tone: 'urgent',
          focus: 'product'
        }
      ];

      return res.status(200).json({
        success: true,
        message: 'Message suggestions generated (fallback mode)',
        data: {
          suggestions: fallbackSuggestions,
          aiGenerated: false,
          note: 'Configure AI service for personalized suggestions'
        }
      });
    }

    const result = await aiService.generateMessageSuggestions(campaignData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate message suggestions',
        error: result.error
      });
    }

    // Handle both AI and fallback responses
    const suggestions = result.data ? result.data.suggestions : result.suggestions;
    const aiGenerated = result.data ? result.data.aiGenerated : true;

    res.status(200).json({
      success: true,
      message: 'Message suggestions generated successfully',
      data: {
        suggestions: suggestions,
        aiGenerated: aiGenerated,
        campaignName: result.campaignName || campaignData.campaignName
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/campaign-insights - Generate AI insights for campaign performance
router.post('/campaign-insights', auth, [
  body('campaignId')
    .isMongoId()
    .withMessage('Valid campaign ID is required'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { campaignId } = req.body;

    // Get campaign data
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    if (!aiService.isAvailable()) {
      // Provide fallback insights
      const deliveryRate = campaign.stats.sent > 0 ?
        ((campaign.stats.delivered / campaign.stats.sent) * 100).toFixed(1) : 0;

      const fallbackInsights = {
        summary: `Campaign "${campaign.name}" achieved a ${deliveryRate}% delivery rate with ${campaign.audienceSize} targeted customers.`,
        insights: [
          `Delivery rate of ${deliveryRate}% is ${deliveryRate > 90 ? 'excellent' : deliveryRate > 80 ? 'good' : 'needs improvement'}`,
          `Audience size of ${campaign.audienceSize} customers is ${campaign.audienceSize > 1000 ? 'large' : campaign.audienceSize > 100 ? 'moderate' : 'small'}`,
          `Campaign type "${campaign.type}" via "${campaign.channel}" channel`
        ],
        recommendations: [
          'Monitor delivery rates and optimize for better performance',
          'Consider A/B testing different message variations',
          'Analyze customer engagement patterns for future campaigns'
        ],
        performance_score: deliveryRate > 90 ? 'A' : deliveryRate > 80 ? 'B' : deliveryRate > 70 ? 'C' : 'D',
        key_metrics: {
          delivery_rate_assessment: deliveryRate > 90 ? 'excellent' : deliveryRate > 80 ? 'good' : 'needs_improvement',
          audience_size_assessment: campaign.audienceSize > 1000 ? 'large' : campaign.audienceSize > 100 ? 'optimal' : 'small',
          timing_assessment: 'good'
        }
      };

      return res.status(200).json({
        success: true,
        message: 'Campaign insights generated (fallback mode)',
        data: {
          insights: fallbackInsights,
          aiGenerated: false,
          campaignId,
          note: 'Configure AI service for advanced insights'
        }
      });
    }

    const result = await aiService.generateCampaignInsights(campaign);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to generate campaign insights',
        error: result.error
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaign insights generated successfully',
      data: {
        insights: result.insights,
        aiGenerated: true,
        campaignId,
        campaignName: result.campaignName
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/status - Check AI service availability
router.get('/status', auth, async (req, res, next) => {
  try {
    const isAvailable = aiService.isAvailable();

    res.status(200).json({
      success: true,
      data: {
        aiServiceAvailable: isAvailable,
        features: {
          naturalLanguageRules: isAvailable,
          messageSuggestions: isAvailable,
          campaignInsights: isAvailable,
          smartScheduling: isAvailable
        },
        message: isAvailable
          ? 'AI service is fully operational'
          : 'AI service is not configured. Set OPENAI_API_KEY to enable AI features.'
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/smart-scheduling - Get smart scheduling suggestions
router.post('/smart-scheduling', auth, [
  body('campaignType')
    .isIn(['promotional', 'transactional', 'reminder', 'welcome', 'winback'])
    .withMessage('Invalid campaign type'),
  body('channel')
    .isIn(['email', 'sms', 'push', 'whatsapp'])
    .withMessage('Invalid channel'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { campaignType, channel } = req.body;

    const result = await aiService.generateSchedulingSuggestions({
      type: campaignType,
      channel
    });

    res.status(200).json({
      success: true,
      message: 'Scheduling suggestions generated successfully',
      data: {
        suggestions: result.suggestions,
        aiGenerated: result.success,
        campaignType,
        channel
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
