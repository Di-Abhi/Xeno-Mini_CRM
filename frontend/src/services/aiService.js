import api from './api';

// AI Service for frontend
export const aiService = {
  // Convert natural language to audience rules
  async naturalLanguageToRules(query) {
    try {
      const response = await api.post('/api/ai/natural-language-rules', { query });
      return response.data;
    } catch (error) {
      console.error('Error converting natural language to rules:', error);
      throw error;
    }
  },

  // Generate AI-powered message suggestions
  async generateMessageSuggestions(campaignData) {
    try {
      const response = await api.post('/api/ai/message-suggestions', campaignData);
      return response.data;
    } catch (error) {
      console.error('Error generating message suggestions:', error);
      throw error;
    }
  },

  // Generate campaign insights
  async generateCampaignInsights(campaignId) {
    try {
      const response = await api.post('/api/ai/campaign-insights', { campaignId });
      return response.data;
    } catch (error) {
      console.error('Error generating campaign insights:', error);
      throw error;
    }
  },

  // Get smart scheduling suggestions
  async getSmartSchedulingSuggestions(campaignType, channel) {
    try {
      const response = await api.post('/api/ai/smart-scheduling', {
        campaignType,
        channel
      });
      return response.data;
    } catch (error) {
      console.error('Error getting scheduling suggestions:', error);
      throw error;
    }
  },

  // Get AI service status
  async getStatus() {
    try {
      const response = await api.get('/api/ai/status');
      return response.data;
    } catch (error) {
      console.error('Error getting AI status:', error);
      throw error;
    }
  }
};

export default aiService;
