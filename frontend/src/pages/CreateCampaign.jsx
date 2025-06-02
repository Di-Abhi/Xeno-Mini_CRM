import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Send, Save, Users, Sparkles } from 'lucide-react';
import { campaignsAPI } from '../services/api';
import RuleBuilder from '../components/RuleBuilder';
import NaturalLanguageRuleBuilder from '../components/NaturalLanguageRuleBuilder';
import AIMessageSuggestions from '../components/AIMessageSuggestions';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [audiencePreview, setAudiencePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeRuleTab, setActiveRuleTab] = useState('manual'); // 'manual' or 'ai'
  const [activeMessageTab, setActiveMessageTab] = useState('manual'); // 'manual' or 'ai'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      messageTemplate: '',
      type: 'promotional',
      channel: 'email',
      audienceRules: {
        conditions: [
          {
            field: 'totalSpent',
            operator: 'gt',
            value: '',
          },
        ],
        logic: 'AND',
      },
    },
  });

  const audienceRules = watch('audienceRules');

  const handleRulesChange = (newRules) => {
    setValue('audienceRules', newRules);
    // Clear preview when rules change
    setAudiencePreview(null);
  };

  const handleAIRulesGenerated = (aiRules) => {
    setValue('audienceRules', aiRules);
    setAudiencePreview(null);
    // Switch to manual tab to show the generated rules
    setActiveRuleTab('manual');
  };

  const handleAIMessageSelected = (message) => {
    setValue('messageTemplate', message);
    // Switch to manual tab to show the selected message
    setActiveMessageTab('manual');
  };

  const handlePreviewAudience = async (rules) => {
    try {
      const response = await campaignsAPI.previewAudience({ audienceRules: rules });
      setAudiencePreview(response.data.data);
      toast.success(`Found ${response.data.data.audienceSize} matching customers`);
    } catch (error) {
      console.error('Failed to preview audience:', error);
      toast.error('Failed to preview audience');
    }
  };

  const onSubmit = async (data, shouldLaunch = false) => {
    try {
      setIsSubmitting(true);

      // Validate that all conditions have values
      const hasEmptyConditions = data.audienceRules.conditions.some(
        condition => condition.value === '' || condition.value === null || condition.value === undefined
      );

      if (hasEmptyConditions) {
        toast.error('Please fill in all condition values');
        return;
      }

      const campaignData = {
        ...data,
        launch: shouldLaunch,
      };

      const response = await campaignsAPI.create(campaignData);

      if (shouldLaunch) {
        toast.success('Campaign created and launched successfully!');
      } else {
        toast.success('Campaign created successfully!');
      }

      navigate('/campaigns');
    } catch (error) {
      console.error('Failed to create campaign:', error);
      const message = error.response?.data?.message || 'Failed to create campaign';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = (data) => {
    onSubmit(data, false);
  };

  const handleLaunchCampaign = (data) => {
    onSubmit(data, true);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/campaigns')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new marketing campaign with targeted audience rules
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              </div>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Campaign Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={`input ${errors.name ? 'input-error' : ''}`}
                    placeholder="Enter campaign name"
                    {...register('name', {
                      required: 'Campaign name is required',
                      maxLength: {
                        value: 100,
                        message: 'Campaign name cannot exceed 100 characters',
                      },
                    })}
                  />
                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="input"
                    placeholder="Enter campaign description"
                    {...register('description', {
                      maxLength: {
                        value: 500,
                        message: 'Description cannot exceed 500 characters',
                      },
                    })}
                  />
                  {errors.description && (
                    <p className="form-error">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="type" className="form-label">
                      Campaign Type
                    </label>
                    <select
                      id="type"
                      className="input"
                      {...register('type')}
                    >
                      <option value="promotional">Promotional</option>
                      <option value="transactional">Transactional</option>
                      <option value="reminder">Reminder</option>
                      <option value="welcome">Welcome</option>
                      <option value="winback">Win-back</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="channel" className="form-label">
                      Channel
                    </label>
                    <select
                      id="channel"
                      className="input"
                      {...register('channel')}
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push Notification</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Template */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Message Template</h3>
                    <p className="text-sm text-gray-500">
                      Create your message manually or use AI suggestions
                    </p>
                  </div>
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setActiveMessageTab('manual')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        activeMessageTab === 'manual'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMessageTab('ai')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center ${
                        activeMessageTab === 'ai'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Suggestions
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {activeMessageTab === 'manual' ? (
                  <div className="form-group">
                    <label htmlFor="messageTemplate" className="form-label">
                      Message Content *
                    </label>
                    <textarea
                      id="messageTemplate"
                      rows={4}
                      className={`input ${errors.messageTemplate ? 'input-error' : ''}`}
                      placeholder="Hi {name}, here's a special offer just for you!"
                      {...register('messageTemplate', {
                        required: 'Message template is required',
                        maxLength: {
                          value: 1000,
                          message: 'Message template cannot exceed 1000 characters',
                        },
                      })}
                    />
                    {errors.messageTemplate && (
                      <p className="form-error">{errors.messageTemplate.message}</p>
                    )}
                    <p className="form-help">
                      Available variables: {'{name}'}, {'{totalSpent}'}, {'{visitCount}'}
                    </p>
                  </div>
                ) : (
                  <AIMessageSuggestions
                    campaignData={{
                      name: watch('name'),
                      type: watch('type'),
                      channel: watch('channel'),
                      audienceSize: audiencePreview?.audienceSize,
                      audienceRules: watch('audienceRules')
                    }}
                    onMessageSelect={handleAIMessageSelected}
                    disabled={isSubmitting}
                  />
                )}
              </div>
            </div>

            {/* Audience Rules */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Audience Rules</h3>
                    <p className="text-sm text-gray-500">
                      Define who should receive this campaign
                    </p>
                  </div>
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setActiveRuleTab('manual')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        activeRuleTab === 'manual'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveRuleTab('ai')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center ${
                        activeRuleTab === 'ai'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Builder
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">
                {activeRuleTab === 'manual' ? (
                  <RuleBuilder
                    rules={audienceRules}
                    onChange={handleRulesChange}
                    onPreview={handlePreviewAudience}
                  />
                ) : (
                  <NaturalLanguageRuleBuilder
                    onRulesGenerated={handleAIRulesGenerated}
                    disabled={isSubmitting}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Audience Preview */}
            {audiencePreview && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Audience Preview</h3>
                </div>
                <div className="card-body">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-gray-900">
                        {audiencePreview.audienceSize}
                      </p>
                      <p className="text-sm text-gray-500">customers match</p>
                    </div>
                  </div>

                  {audiencePreview.sampleCustomers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Sample Customers:
                      </h4>
                      <div className="space-y-2">
                        {audiencePreview.sampleCustomers.slice(0, 3).map((customer) => (
                          <div key={customer._id} className="text-sm text-gray-600">
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-xs">
                              ₹{customer.totalSpent} spent • {customer.visitCount} visits
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Actions</h3>
              </div>
              <div className="card-body space-y-3">
                <button
                  type="button"
                  onClick={handleSubmit(handleSaveDraft)}
                  disabled={isSubmitting}
                  className="btn btn-secondary btn-md w-full"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit(handleLaunchCampaign)}
                  disabled={isSubmitting || !audiencePreview}
                  className="btn btn-primary btn-md w-full"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Launch Campaign
                    </>
                  )}
                </button>

                {!audiencePreview && (
                  <p className="text-xs text-gray-500 text-center">
                    Preview audience before launching
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
