import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShoppingCart,
  Megaphone,
  TrendingUp,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';
import { customersAPI, ordersAPI, campaignsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AIStatusIndicator from '../components/AIStatusIndicator';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customers: null,
    orders: null,
    campaigns: null,
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get current date
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load statistics
      const [customersStats, ordersStats, campaignsData] = await Promise.all([
        customersAPI.getStats(),
        ordersAPI.getStats(),
        campaignsAPI.getAll({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
      ]);

      setStats({
        customers: customersStats.data.data,
        orders: ordersStats.data.data,
        campaigns: {
          total: campaignsData.data.data.pagination.totalCount,
        },
      });

      setRecentCampaigns(campaignsData.data.data.campaigns);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic changes based on data
  const calculateChange = (current, field) => {
    // For demo purposes, we'll calculate some basic changes
    // In a real app, you'd compare with previous period data
    const baseValues = {
      customers: 50,
      orders: 30,
      campaigns: 5,
      revenue: 100000
    };

    const currentValue = current || 0;
    const baseValue = baseValues[field] || 1;
    const change = ((currentValue - baseValue) / baseValue * 100).toFixed(1);

    return {
      value: `${change > 0 ? '+' : ''}${change}%`,
      type: change >= 0 ? 'positive' : 'negative'
    };
  };

  const customerChange = calculateChange(stats.customers?.totalCustomers, 'customers');
  const orderChange = calculateChange(stats.orders?.totalOrders, 'orders');
  const campaignChange = calculateChange(stats.campaigns?.total, 'campaigns');
  const revenueChange = calculateChange(stats.orders?.totalRevenue, 'revenue');

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.customers?.totalCustomers || 0,
      change: customerChange.value,
      changeType: customerChange.type,
      icon: Users,
      color: 'primary',
      href: '/customers',
    },
    {
      title: 'Total Orders',
      value: stats.orders?.totalOrders || 0,
      change: orderChange.value,
      changeType: orderChange.type,
      icon: ShoppingCart,
      color: 'success',
      href: '/orders',
    },
    {
      title: 'Active Campaigns',
      value: stats.campaigns?.total || 0,
      change: campaignChange.value,
      changeType: campaignChange.type,
      icon: Megaphone,
      color: 'warning',
      href: '/campaigns',
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats.orders?.totalRevenue || 0).toLocaleString()}`,
      change: revenueChange.value,
      changeType: revenueChange.type,
      icon: TrendingUp,
      color: 'error',
      href: '/orders',
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-secondary',
      running: 'badge-primary',
      completed: 'badge-success',
      paused: 'badge-warning',
      cancelled: 'badge-error',
    };
    return badges[status] || 'badge-secondary';
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500 mb-2">
              <div className="flex items-center mb-1 sm:mb-0">
                <Calendar className="h-4 w-4 mr-1" />
                {getCurrentDate()}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </div>
            </div>
            <p className="text-gray-600">
              Here's what's happening with your CRM today.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <AIStatusIndicator />
            <Link to="/campaigns/new" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.href}
              className="card card-hover"
            >
              <div className="card-body">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      stat.color === 'primary' ? 'bg-blue-100' :
                      stat.color === 'success' ? 'bg-green-100' :
                      stat.color === 'warning' ? 'bg-yellow-100' :
                      stat.color === 'error' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        stat.color === 'primary' ? 'text-blue-600' :
                        stat.color === 'success' ? 'text-green-600' :
                        stat.color === 'warning' ? 'text-yellow-600' :
                        stat.color === 'error' ? 'text-red-600' : 'text-gray-600'
                      }`} />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600 ml-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600 ml-1" />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Campaigns */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Campaigns</h3>
              <Link
                to="/campaigns"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            {recentCampaigns.length > 0 ? (
              <div className="space-y-4">
                {recentCampaigns.map((campaign) => (
                  <div key={campaign._id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {campaign.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {campaign.audienceSize} customers • {campaign.type}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`badge ${getStatusBadge(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first campaign.
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
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <Link
                to="/campaigns/new"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Megaphone className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Create Campaign</p>
                  <p className="text-sm text-gray-500">Start a new marketing campaign</p>
                </div>
              </Link>

              <Link
                to="/customers/new"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Add Customer</p>
                  <p className="text-sm text-gray-500">Add a new customer to your CRM</p>
                </div>
              </Link>

              <Link
                to="/orders/new"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Create Order</p>
                  <p className="text-sm text-gray-500">Record a new customer order</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
