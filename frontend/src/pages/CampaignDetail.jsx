import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Edit, 
  Users, 
  Send, 
  CheckCircle, 
  XCircle,
  Calendar,
  MessageSquare,
  Target
} from 'lucide-react';
import { campaignsAPI } from '../services/api';
import CampaignInsights from '../components/CampaignInsights';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignsAPI.getById(id);
      setCampaign(response.data.data);
    } catch (error) {
      console.error('Failed to load campaign:', error);
      toast.error('Failed to load campaign details');
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async () => {
    try {
      setActionLoading(true);
      await campaignsAPI.launch(id);
      toast.success('Campaign launched successfully!');
      loadCampaign();
    } catch (error) {
      console.error('Failed to launch campaign:', error);
      toast.error('Failed to launch campaign');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: { class: 'badge-secondary', icon: null },
      scheduled: { class: 'badge-warning', icon: null },
      running: { class: 'badge-primary', icon: Play },
      completed: { class: 'badge-success', icon: CheckCircle },
      paused: { class: 'badge-warning', icon: Pause },
      cancelled: { class: 'badge-error', icon: XCircle },
    };
    return badges[status] || badges.draft;
  };

  const getTypeBadge = (type) => {
    const badges = {
      promotional: 'badge-primary',
      transactional: 'badge-success',
      reminder: 'badge-warning',
      welcome: 'badge-secondary',
      winback: 'badge-error',
    };
    return badges[type] || 'badge-secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading campaign details..." />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Campaign not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The campaign you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/campaigns" className="mt-4 btn btn-primary btn-sm">
          Back to Campaigns
        </Link>
      </div>
    );
  }

  const statusBadge = getStatusBadge(campaign.status);
  const StatusIcon = statusBadge.icon;
  const deliveryRate = campaign.stats.sent > 0 ? 
    ((campaign.stats.delivered / campaign.stats.sent) * 100).toFixed(1) : 0;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => navigate('/campaigns')}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900 truncate">
                {campaign.name}
              </h1>
              <span className={`badge ${statusBadge.class}`}>
                {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                {campaign.status}
              </span>
              <span className={`badge ${getTypeBadge(campaign.type)}`}>
                {campaign.type}
              </span>
            </div>
            
            {campaign.description && (
              <p className="mt-2 text-sm text-gray-500">
                {campaign.description}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {campaign.status === 'draft' && (
              <button
                onClick={handleLaunchCampaign}
                disabled={actionLoading}
                className="btn btn-primary btn-md"
              >
                <Play className="h-4 w-4 mr-2" />
                Launch Campaign
              </button>
            )}
            
            <Link
              to={`/campaigns/${campaign._id}/edit`}
              className="btn btn-secondary btn-md"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="card">
              <div className="card-body text-center">
                <Users className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                <p className="text-2xl font-semibold text-gray-900">
                  {campaign.audienceSize}
                </p>
                <p className="text-sm text-gray-500">Target Audience</p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <Send className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                <p className="text-2xl font-semibold text-gray-900">
                  {campaign.stats.sent}
                </p>
                <p className="text-sm text-gray-500">Messages Sent</p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <p className="text-2xl font-semibold text-gray-900">
                  {campaign.stats.delivered}
                </p>
                <p className="text-sm text-gray-500">Delivered</p>
              </div>
            </div>

            <div className="card">
              <div className="card-body text-center">
                <XCircle className="mx-auto h-8 w-8 text-red-600 mb-2" />
                <p className="text-2xl font-semibold text-gray-900">
                  {campaign.stats.failed}
                </p>
                <p className="text-sm text-gray-500">Failed</p>
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Campaign Details</h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Created</p>
                      <p className="text-sm text-gray-500">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Channel</p>
                      <p className="text-sm text-gray-500 capitalize">{campaign.channel}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Target className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Type</p>
                      <p className="text-sm text-gray-500 capitalize">{campaign.type}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Delivery Rate</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(deliveryRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {deliveryRate}%
                      </span>
                    </div>
                  </div>

                  {campaign.scheduledAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Scheduled For</p>
                      <p className="text-sm text-gray-500">
                        {new Date(campaign.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Message Template */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Message Template</h3>
            </div>
            <div className="card-body">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {campaign.messageTemplate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Insights */}
          <CampaignInsights 
            campaign={campaign} 
            onRefresh={loadCampaign}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
