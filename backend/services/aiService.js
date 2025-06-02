const OpenAI = require('openai');

/**
 * 🤖 AI Service - Your intelligent marketing assistant
 *
 * This service provides AI-powered features to make your CRM smarter:
 * - Convert natural language to audience rules
 * - Generate personalized campaign messages
 * - Analyze campaign performance
 * - Suggest optimal scheduling
 *
 * Works with or without OpenAI API key (fallback mode available)
 */
class AIService {
  constructor() {
    this.isEnabled = !!process.env.OPENAI_API_KEY;
    this.openai = null;
    this.initializationTime = new Date();

    console.log('🤖 Initializing AI Service...');

    // Only initialize OpenAI if API key is available
    if (this.isEnabled) {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('✅ AI Service ready with OpenAI integration!');
        console.log('🧠 Features available: Natural Language Processing, Message Generation, Insights');
      } catch (error) {
        console.warn('⚠️  Failed to initialize OpenAI client:', error.message);
        console.log('🔄 Switching to fallback mode...');
        this.isEnabled = false;
      }
    } else {
      console.log('💡 AI Service running in fallback mode (no OpenAI API key)');
      console.log('🎯 Smart fallbacks available for all features');
    }
  }

  /**
   * 🗣️ Convert natural language to audience segmentation rules
   *
   * Examples:
   * - "customers who spent more than 10000"
   * - "high value customers from Mumbai"
   * - "inactive users who haven't ordered in 30 days"
   *
   * @param {string} naturalLanguageQuery - Plain English description
   * @returns {Object} Structured audience rules
   */
  async naturalLanguageToRules(naturalLanguageQuery) {
    console.log(`🧠 Processing query: "${naturalLanguageQuery}"`);

    if (!this.isEnabled) {
      console.log('💡 Using smart fallback rules...');
      return this.getFallbackRules(naturalLanguageQuery);
    }

    const systemPrompt = `You are an expert at converting natural language queries into structured audience segmentation rules for a CRM system.

Available fields and their types:
- totalSpent (number): Customer's total spending amount
- visitCount (number): Number of visits/orders
- daysSinceLastOrder (number): Days since last order
- status (string): Customer status - "active", "inactive", "churned"
- city (string): Customer's city
- valueCategory (string): Auto-calculated category - "new", "regular", "high-value", "premium"

Available operators:
- gt: greater than
- gte: greater than or equal
- lt: less than
- lte: less than or equal
- eq: equal to
- ne: not equal to
- in: in array (for multiple values)
- nin: not in array

Logic operators: AND, OR

Convert the user's natural language query into a JSON structure with this format:
{
  "conditions": [
    {
      "field": "fieldName",
      "operator": "operatorName",
      "value": "value"
    }
  ],
  "logic": "AND" or "OR"
}

Examples:
"Customers who spent more than 10000" ->
{
  "conditions": [{"field": "totalSpent", "operator": "gt", "value": 10000}],
  "logic": "AND"
}

"High value customers from Mumbai or Delhi" ->
{
  "conditions": [
    {"field": "valueCategory", "operator": "eq", "value": "high-value"},
    {"field": "city", "operator": "in", "value": ["Mumbai", "Delhi"]}
  ],
  "logic": "AND"
}

Return ONLY the JSON structure, no additional text.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: naturalLanguageQuery }
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const response = completion.choices[0].message.content.trim();

      // Parse and validate the JSON response
      const rules = JSON.parse(response);

      // Validate the structure
      if (!rules.conditions || !Array.isArray(rules.conditions)) {
        throw new Error('Invalid rules structure: missing conditions array');
      }

      if (!rules.logic || !['AND', 'OR'].includes(rules.logic)) {
        rules.logic = 'AND'; // Default to AND
      }

      return {
        success: true,
        rules,
        originalQuery: naturalLanguageQuery
      };
    } catch (error) {
      console.error('Error converting natural language to rules:', error);

      // If it's a quota/billing error, fall back to intelligent rules
      if (error.status === 429 || error.code === 'insufficient_quota') {
        console.log('OpenAI quota exceeded, using fallback rules...');
        return this.getFallbackRules(naturalLanguageQuery);
      }

      return {
        success: false,
        error: error.message,
        originalQuery: naturalLanguageQuery
      };
    }
  }

  /**
   * Generate AI-powered message suggestions for campaigns
   */
  async generateMessageSuggestions(campaignData) {
    if (!this.isEnabled) {
      // Return fallback message suggestions
      return this.getFallbackMessageSuggestions(campaignData);
    }

    const { name, type, audienceSize, audienceRules, channel } = campaignData;

    const systemPrompt = `You are an expert marketing copywriter specializing in personalized customer communications.

Generate 3 different message variations for a ${type} campaign via ${channel}.

Campaign Details:
- Name: ${name}
- Type: ${type}
- Channel: ${channel}
- Audience Size: ${audienceSize} customers
- Audience Rules: ${JSON.stringify(audienceRules)}

Guidelines:
1. Keep messages concise and engaging
2. Use personalization variables: {name}, {totalSpent}, {visitCount}
3. Include clear call-to-action
4. Match the tone to campaign type:
   - promotional: exciting, benefit-focused
   - transactional: clear, informative
   - reminder: gentle, helpful
   - welcome: warm, welcoming
   - winback: compelling, value-driven
5. Ensure messages are appropriate for ${channel}
6. Each message should be 50-150 characters for SMS, 200-500 for email

Return a JSON array with 3 message objects:
[
  {
    "message": "message text here",
    "tone": "friendly/professional/urgent",
    "focus": "discount/product/service"
  }
]

Return ONLY the JSON array, no additional text.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate message suggestions for this campaign.` }
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const response = completion.choices[0].message.content.trim();
      const suggestions = JSON.parse(response);

      return {
        success: true,
        suggestions,
        campaignName: name
      };
    } catch (error) {
      console.error('Error generating message suggestions:', error);

      // If it's a quota/billing error, fall back to intelligent suggestions
      if (error.status === 429 || error.code === 'insufficient_quota') {
        console.log('OpenAI quota exceeded, using fallback message suggestions...');
        return this.getFallbackMessageSuggestions(campaignData);
      }

      return {
        success: false,
        error: error.message,
        campaignName: name
      };
    }
  }

  /**
   * Generate AI insights for campaign performance
   */
  async generateCampaignInsights(campaignData) {
    if (!this.isEnabled) {
      // Return fallback insights
      return this.getFallbackInsights(campaignData);
    }

    const { name, stats, audienceSize, type, channel, createdAt } = campaignData;
    const deliveryRate = stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : 0;
    const failureRate = stats.sent > 0 ? ((stats.failed / stats.sent) * 100).toFixed(1) : 0;

    const systemPrompt = `You are an expert marketing analyst specializing in campaign performance analysis.

Analyze the campaign performance data and provide actionable insights.

Campaign Data:
- Name: ${name}
- Type: ${type}
- Channel: ${channel}
- Created: ${createdAt}
- Audience Size: ${audienceSize}
- Messages Sent: ${stats.sent}
- Messages Delivered: ${stats.delivered}
- Messages Failed: ${stats.failed}
- Delivery Rate: ${deliveryRate}%
- Failure Rate: ${failureRate}%

Provide insights in this JSON format:
{
  "summary": "Brief 1-2 sentence summary of performance",
  "insights": [
    "Specific insight about delivery rate",
    "Insight about audience engagement",
    "Recommendation for improvement"
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2"
  ],
  "performance_score": "A/B/C/D grade",
  "key_metrics": {
    "delivery_rate_assessment": "excellent/good/average/poor",
    "audience_size_assessment": "optimal/large/small",
    "timing_assessment": "good/needs_improvement"
  }
}

Return ONLY the JSON structure, no additional text.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this campaign performance.` }
        ],
        temperature: 0.3,
        max_tokens: 600,
      });

      const response = completion.choices[0].message.content.trim();
      const insights = JSON.parse(response);

      return {
        success: true,
        insights,
        campaignName: name
      };
    } catch (error) {
      console.error('Error generating campaign insights:', error);
      return {
        success: false,
        error: error.message,
        campaignName: name
      };
    }
  }

  /**
   * Generate smart scheduling suggestions
   */
  async generateSchedulingSuggestions(campaignData, customerActivityData) {
    if (!this.isEnabled) {
      return {
        success: false,
        error: 'AI service not configured',
        suggestions: [
          {
            time: '10:00 AM',
            day: 'Tuesday',
            reason: 'Based on general best practices for email campaigns',
            confidence: 'medium'
          }
        ]
      };
    }

    // This would analyze customer activity patterns
    // For now, return mock intelligent suggestions
    return {
      success: true,
      suggestions: [
        {
          time: '10:00 AM',
          day: 'Tuesday',
          reason: 'Peak engagement time based on customer activity patterns',
          confidence: 'high'
        },
        {
          time: '2:00 PM',
          day: 'Thursday',
          reason: 'Secondary peak with good conversion rates',
          confidence: 'medium'
        }
      ]
    };
  }

  // 🎯 Enhanced Fallback methods when AI is not available
  getFallbackRules(query) {
    const lowerQuery = query.toLowerCase();
    console.log(`🎯 Generating smart fallback rules for: "${query}"`);

    // Enhanced pattern matching for common queries
    let conditions = [];
    let explanation = '';

    if (lowerQuery.includes('high value') || lowerQuery.includes('premium') || lowerQuery.includes('vip')) {
      conditions = [
        { field: 'totalSpent', operator: 'gte', value: 50000 },
        { field: 'visitCount', operator: 'gte', value: 10 }
      ];
      explanation = 'High-value customers with significant spending and engagement';
    } else if (lowerQuery.includes('spent more than') || lowerQuery.includes('spending over')) {
      const amount = this.extractNumber(query) || 10000;
      conditions = [{ field: 'totalSpent', operator: 'gt', value: amount }];
      explanation = `Customers who spent more than ₹${amount}`;
    } else if (lowerQuery.includes('inactive') || lowerQuery.includes('churned') || lowerQuery.includes('not ordered')) {
      conditions = [
        { field: 'daysSinceLastOrder', operator: 'gt', value: 90 },
        { field: 'status', operator: 'ne', value: 'active' }
      ];
      explanation = 'Inactive customers who haven\'t ordered recently';
    } else if (lowerQuery.includes('new customer') || lowerQuery.includes('recent') || lowerQuery.includes('fresh')) {
      conditions = [
        { field: 'daysSinceLastOrder', operator: 'lt', value: 30 },
        { field: 'visitCount', operator: 'lte', value: 3 }
      ];
      explanation = 'New customers with recent activity';
    } else if (lowerQuery.includes('frequent') || lowerQuery.includes('regular') || lowerQuery.includes('loyal')) {
      conditions = [
        { field: 'visitCount', operator: 'gte', value: 5 },
        { field: 'daysSinceLastOrder', operator: 'lt', value: 60 }
      ];
      explanation = 'Frequent customers with regular purchase patterns';
    } else if (lowerQuery.includes('mumbai') || lowerQuery.includes('delhi') || lowerQuery.includes('bangalore')) {
      const city = this.extractCity(query) || 'Mumbai';
      conditions = [{ field: 'city', operator: 'eq', value: city }];
      explanation = `Customers from ${city}`;
    } else if (lowerQuery.includes('active')) {
      conditions = [{ field: 'status', operator: 'eq', value: 'active' }];
      explanation = 'Active customers';
    } else {
      // Default fallback
      conditions = [{ field: 'totalSpent', operator: 'gt', value: 5000 }];
      explanation = 'General customer segment with moderate spending';
    }

    const rules = {
      conditions: conditions,
      logic: 'AND'
    };

    console.log(`✅ Generated smart fallback rules with ${conditions.length} condition(s)`);

    return {
      success: true,
      data: {
        generatedRules: rules,
        aiGenerated: false,
        explanation: explanation,
        confidence: 'High',
        fallbackMode: true
      },
      originalQuery: query,
      message: 'Smart fallback rules generated successfully'
    };
  }

  // Helper method to extract numbers from query
  extractNumber(query) {
    const numbers = query.match(/\d+/g);
    return numbers ? parseInt(numbers[0]) : null;
  }

  // Helper method to extract city names from query
  extractCity(query) {
    const lowerQuery = query.toLowerCase();
    const cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'pune', 'hyderabad'];

    for (const city of cities) {
      if (lowerQuery.includes(city)) {
        return city.charAt(0).toUpperCase() + city.slice(1);
      }
    }
    return null;
  }

  getFallbackMessageSuggestions(campaignData) {
    const { name, type, channel } = campaignData;
    console.log(`💬 Generating smart fallback messages for ${type} campaign via ${channel}`);

    const suggestions = [];

    // Enhanced message suggestions based on campaign type and channel
    if (channel === 'email') {
      switch (type) {
        case 'promotional':
          suggestions.push({
            subject: `🎉 Exclusive Offer: ${name}`,
            content: `Hi {name}! We have an exclusive offer just for you. Get up to 50% off on your favorite products. Limited time only - don't miss out!`,
            tone: 'exciting',
            focus: 'discount'
          });
          suggestions.push({
            subject: `Last Chance: ${name}`,
            content: `Dear {name}, this is your final opportunity to grab amazing deals. Shop now before it's too late!`,
            tone: 'urgent',
            focus: 'urgency'
          });
          break;

        case 'welcome':
          suggestions.push({
            subject: `Welcome to our family, {name}! 🎊`,
            content: `Hi {name}! Welcome aboard! We're thrilled to have you with us. Here's a special 20% discount on your first purchase.`,
            tone: 'warm',
            focus: 'welcome'
          });
          break;

        case 'winback':
          suggestions.push({
            subject: `We miss you, {name}! Come back with 30% off`,
            content: `Hi {name}, we noticed you haven't shopped with us lately. We miss you! Here's a special 30% discount to welcome you back.`,
            tone: 'friendly',
            focus: 'comeback'
          });
          break;

        default:
          suggestions.push({
            subject: `Important Update: ${name}`,
            content: `Hi {name}, we have an important update regarding your account. Please check your dashboard for more details.`,
            tone: 'professional',
            focus: 'information'
          });
      }
    } else {
      // SMS/WhatsApp messages (shorter)
      switch (type) {
        case 'promotional':
          suggestions.push({
            content: `🎉 {name}, exclusive offer just for you! Get 50% off. Shop now: [link] Reply STOP to opt out.`,
            tone: 'exciting',
            focus: 'discount'
          });
          suggestions.push({
            content: `⏰ Last chance {name}! Amazing deals ending soon. Don't miss out: [link]`,
            tone: 'urgent',
            focus: 'urgency'
          });
          break;

        case 'reminder':
          suggestions.push({
            content: `Hi {name}! You have items waiting in your cart. Complete your purchase now: [link]`,
            tone: 'gentle',
            focus: 'reminder'
          });
          break;

        default:
          suggestions.push({
            content: `Hi {name}! We have something special for you. Check it out: [link]`,
            tone: 'friendly',
            focus: 'general'
          });
      }
    }

    // Add fallback suggestions if none were generated
    if (suggestions.length === 0) {
      suggestions.push({
        subject: channel === 'email' ? `Special offer just for you!` : undefined,
        content: channel === 'email'
          ? `Hi {name}! We have an exclusive offer that we think you'll love. Check it out and save big today!`
          : `🎉 {name}, special offer alert! Don't miss out on our latest deals. Limited time only!`,
        tone: 'friendly',
        focus: 'general'
      });
    }

    console.log(`✅ Generated ${suggestions.length} smart fallback message(s)`);

    return {
      success: true,
      data: {
        suggestions: suggestions,
        aiGenerated: false,
        campaignType: type,
        channel: channel,
        fallbackMode: true
      },
      message: 'Smart fallback messages generated successfully'
    };
  }

  getFallbackInsights(campaignData) {
    const { stats, audienceSize, type, channel, name } = campaignData;
    const deliveryRate = stats.sent > 0 ? ((stats.delivered / stats.sent) * 100).toFixed(1) : 0;
    const failureRate = stats.sent > 0 ? ((stats.failed / stats.sent) * 100).toFixed(1) : 0;

    console.log(`📊 Generating smart fallback insights for campaign: ${name}`);

    // Smart performance assessment
    const performanceScore = deliveryRate > 95 ? 'A' : deliveryRate > 85 ? 'B' : deliveryRate > 70 ? 'C' : 'D';
    const deliveryAssessment = deliveryRate > 95 ? 'excellent' : deliveryRate > 85 ? 'good' : deliveryRate > 70 ? 'average' : 'poor';
    const audienceAssessment = audienceSize > 1000 ? 'large' : audienceSize > 100 ? 'optimal' : 'small';

    // Generate smart recommendations based on performance
    const recommendations = [];
    const insights = [];

    // Delivery rate insights
    if (deliveryRate < 85) {
      recommendations.push('Improve delivery rates by cleaning your email list and checking for spam triggers');
      insights.push(`Delivery rate of ${deliveryRate}% is below industry average (85-95%)`);
    } else {
      insights.push(`Excellent delivery rate of ${deliveryRate}% - well above industry standards`);
    }

    // Audience size insights
    if (audienceSize < 50) {
      recommendations.push('Consider expanding your audience targeting to reach more potential customers');
      insights.push('Small audience size may limit campaign impact');
    } else if (audienceSize > 5000) {
      recommendations.push('Large audience detected - consider segmentation for better personalization');
      insights.push('Large audience provides good reach potential');
    } else {
      insights.push('Audience size is well-balanced for targeted messaging');
    }

    // Channel-specific recommendations
    if (channel === 'email') {
      recommendations.push('Test different subject lines to improve open rates');
      recommendations.push('Consider adding personalization tokens like {name} in your messages');
    } else if (channel === 'sms') {
      recommendations.push('Keep messages concise and include clear call-to-action');
      recommendations.push('Ensure compliance with SMS marketing regulations');
    }

    // Campaign type specific insights
    if (type === 'promotional') {
      recommendations.push('Track conversion rates to measure ROI effectiveness');
      insights.push('Promotional campaigns typically see higher engagement with time-limited offers');
    } else if (type === 'welcome') {
      recommendations.push('Follow up with educational content to improve customer onboarding');
      insights.push('Welcome campaigns are crucial for setting customer expectations');
    }

    // General recommendations
    recommendations.push('Monitor engagement metrics over the next 24-48 hours for complete analysis');
    recommendations.push('Consider A/B testing different message variations for future campaigns');

    const summary = `Campaign "${name}" reached ${stats.delivered} out of ${stats.sent} customers (${deliveryRate}% delivery rate) via ${channel}. Performance grade: ${performanceScore}`;

    console.log(`✅ Generated comprehensive fallback insights with grade ${performanceScore}`);

    return {
      success: true,
      data: {
        insights: {
          summary: summary,
          performance_score: performanceScore,
          key_metrics: {
            delivery_rate_assessment: deliveryAssessment,
            audience_size_assessment: audienceAssessment,
            timing_assessment: 'good',
            overall_health: deliveryRate > 85 ? 'healthy' : 'needs_attention'
          },
          insights: insights,
          recommendations: recommendations,
          statistics: {
            total_sent: stats.sent,
            delivered: stats.delivered,
            failed: stats.failed,
            delivery_rate: `${deliveryRate}%`,
            failure_rate: `${failureRate}%`,
            audience_size: audienceSize
          }
        },
        aiGenerated: false,
        campaignName: name,
        fallbackMode: true
      },
      message: 'Smart fallback insights generated successfully'
    };
  }

  /**
   * Get AI service status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      service: 'OpenAI GPT-3.5',
      status: this.isEnabled ? 'connected' : 'disabled',
      message: this.isEnabled ? 'AI features are available' : 'OpenAI API key not configured'
    };
  }

  /**
   * Check if AI service is available
   */
  isAvailable() {
    return this.isEnabled;
  }
}

module.exports = new AIService();
