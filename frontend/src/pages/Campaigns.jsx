import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Eye,
  Users,
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { campaignsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  useEffect(() => {
    loadCampaigns();
  }, [searchTerm, statusFilter, pagination.currentPage]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await campaignsAPI.getAll(params);
      const { campaigns: campaignData, pagination: paginationData } = response.data.data;

      setCampaigns(campaignData);
      setPagination(paginationData);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchCampaign = async (campaignId) => {
    try {
      await campaignsAPI.launch(campaignId);
      toast.success('Campaign launched successfully!');
      loadCampaigns();
    } catch (error) {
      console.error('Failed to launch campaign:', error);
      toast.error('Failed to launch campaign');
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

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your marketing campaigns and track their performance
            </p>
          </div>
          <Link to="/campaigns/new" className="btn btn-primary btn-md">
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading campaigns..." />
        </div>
      ) : filteredCampaigns.length > 0 ? (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => {
            const statusBadge = getStatusBadge(campaign.status);
            const StatusIcon = statusBadge.icon;

            return (
              <div key={campaign._id} className="card hover:shadow-medium transition-shadow">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {campaign.name}
                        </h3>
                        <span className={`badge ${statusBadge.class}`}>
                          {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                          {campaign.status}
                        </span>
                        <span className={`badge ${getTypeBadge(campaign.type)}`}>
                          {campaign.type}
                        </span>
                      </div>

                      {campaign.description && (
                        <p className="mt-1 text-sm text-gray-500 truncate">
                          {campaign.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {campaign.audienceSize} customers
                        </div>
                        <div className="flex items-center">
                          <Send className="h-4 w-4 mr-1" />
                          {campaign.stats?.sent || 0} sent
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          {campaign.stats?.delivered || 0} delivered
                        </div>
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-1 text-red-500" />
                          {campaign.stats?.failed || 0} failed
                        </div>
                        <div>
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => handleLaunchCampaign(campaign._id)}
                          className="btn btn-primary btn-sm"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Launch
                        </button>
                      )}

                      <Link
                        to={`/campaigns/${campaign._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>

                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar for Running Campaigns */}
                  {campaign.status === 'running' && campaign.stats && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Delivery Progress</span>
                        <span>
                          {Math.round(((campaign.stats.sent || 0) / campaign.audienceSize) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(((campaign.stats.sent || 0) / campaign.audienceSize) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="btn btn-secondary btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="btn btn-secondary btn-sm"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(pagination.currentPage - 1) * 10 + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * 10, pagination.totalCount)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.totalCount}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={pagination.currentPage === 1}
                      className="btn btn-secondary btn-sm rounded-r-none"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="btn btn-secondary btn-sm rounded-l-none"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first campaign.'
            }
          </p>
          <div className="mt-6">
            <Link to="/campaigns/new" className="btn btn-primary btn-sm">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
