import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { customersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const EditCustomer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      setInitialLoading(true);
      const response = await customersAPI.getById(id);
      const customer = response.data.data;
      
      // Reset form with customer data
      reset({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        city: customer.city || '',
        state: customer.state || '',
        country: customer.country || '',
        totalSpent: customer.totalSpent || 0,
        visitCount: customer.visitCount || 0,
        status: customer.status || 'active'
      });
    } catch (error) {
      console.error('Failed to load customer:', error);
      toast.error('Failed to load customer details');
      navigate('/customers');
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Convert string values to appropriate types
      const customerData = {
        ...data,
        totalSpent: parseFloat(data.totalSpent) || 0,
        visitCount: parseInt(data.visitCount) || 0,
      };

      await customersAPI.update(id, customerData);
      toast.success('Customer updated successfully!');
      navigate(`/customers/${id}`);
    } catch (error) {
      console.error('Failed to update customer:', error);
      toast.error(error.response?.data?.message || 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading customer details..." />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/customers/${id}`)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update customer information in your CRM
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  className={`input ${errors.name ? 'input-error' : ''}`}
                  placeholder="Enter customer's full name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    placeholder="customer@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="form-error">{errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    className={`input pl-10 ${errors.phone ? 'input-error' : ''}`}
                    placeholder="+91 98765 43210"
                    {...register('phone', {
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
                        message: 'Invalid phone number'
                      }
                    })}
                  />
                </div>
                {errors.phone && (
                  <p className="form-error">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location Information
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="form-group">
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  className="input"
                  placeholder="Mumbai"
                  {...register('city')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="state" className="form-label">
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  className="input"
                  placeholder="Maharashtra"
                  {...register('state')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="country" className="form-label">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  className="input"
                  placeholder="India"
                  {...register('country')}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Customer Details
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="totalSpent" className="form-label">
                    Total Spent (₹)
                  </label>
                  <input
                    type="number"
                    id="totalSpent"
                    className="input"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    {...register('totalSpent')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="visitCount" className="form-label">
                    Visit Count
                  </label>
                  <input
                    type="number"
                    id="visitCount"
                    className="input"
                    placeholder="0"
                    min="0"
                    {...register('visitCount')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  id="status"
                  className="input"
                  {...register('status')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/customers/${id}`)}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
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
                  Update Customer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomer;
