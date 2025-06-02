import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Database,
  Mail
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AIStatusIndicator from '../components/AIStatusIndicator';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword
  } = useForm();

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email
      });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(data);
      updateUser(response.data.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      setLoading(true);
      await authAPI.changePassword(data);
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'ai', name: 'AI Features', icon: Sparkles },
    { id: 'system', name: 'System', icon: Database },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                <p className="text-sm text-gray-500">
                  Update your account profile information and email address.
                </p>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      className={`input ${profileErrors.name ? 'input-error' : ''}`}
                      {...registerProfile('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        }
                      })}
                    />
                    {profileErrors.name && (
                      <p className="form-error">{profileErrors.name.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`input ${profileErrors.email ? 'input-error' : ''}`}
                      {...registerProfile('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                    {profileErrors.email && (
                      <p className="form-error">{profileErrors.email.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Update Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-500">
                  Ensure your account is using a long, random password to stay secure.
                </p>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                  <div className="form-group">
                    <label htmlFor="currentPassword" className="form-label">
                      Current Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        id="currentPassword"
                        className={`input pr-10 ${passwordErrors.currentPassword ? 'input-error' : ''}`}
                        {...registerPassword('currentPassword', {
                          required: 'Current password is required'
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="form-error">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword" className="form-label">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        className={`input pr-10 ${passwordErrors.newPassword ? 'input-error' : ''}`}
                        {...registerPassword('newPassword', {
                          required: 'New password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="form-error">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                <p className="text-sm text-gray-500">
                  Configure how you want to receive notifications.
                </p>
              </div>
              <div className="card-body space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle"
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Campaign Updates</h4>
                      <p className="text-sm text-gray-500">Get notified about campaign status changes</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle"
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Order Notifications</h4>
                      <p className="text-sm text-gray-500">Receive alerts for new orders</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle"
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                      <p className="text-sm text-gray-500">Get weekly performance summaries</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="btn btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">AI Features Status</h3>
                  <p className="text-sm text-gray-500">
                    Current status of AI-powered features in your CRM.
                  </p>
                </div>
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">AI Service Status</h4>
                      <p className="text-sm text-gray-500">Real-time status of AI capabilities</p>
                    </div>
                    <AIStatusIndicator />
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">AI Feature Settings</h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Natural Language Rules</h4>
                      <p className="text-sm text-gray-500">Convert plain English to audience rules</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle"
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Message Suggestions</h4>
                      <p className="text-sm text-gray-500">AI-generated campaign messages</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle"
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Smart Insights</h4>
                      <p className="text-sm text-gray-500">AI-powered campaign analytics</p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle"
                      defaultChecked
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">System Information</h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Version</p>
                      <p className="text-sm text-gray-900">Xeno CRM v1.0.0</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Environment</p>
                      <p className="text-sm text-gray-900">Development</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Database</p>
                      <p className="text-sm text-gray-900">MongoDB</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-sm text-gray-900">{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Export Data</h4>
                      <p className="text-sm text-gray-500">Download your CRM data</p>
                    </div>
                    <button className="btn btn-secondary btn-sm">
                      <Database className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Clear Cache</h4>
                      <p className="text-sm text-gray-500">Clear application cache</p>
                    </div>
                    <button className="btn btn-secondary btn-sm">
                      Clear Cache
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
