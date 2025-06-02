import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, ShoppingCart, User, CreditCard, Package } from 'lucide-react';
import { ordersAPI, customersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'card',
      currency: 'INR'
    }
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await customersAPI.getAll({ limit: 100 });
      setCustomers(response.data.data.customers || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Convert string values to appropriate types
      const orderData = {
        ...data,
        amount: parseFloat(data.amount),
        totalItems: parseInt(data.totalItems) || 1,
        orderDate: new Date(data.orderDate),
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined
      };

      await ordersAPI.create(orderData);
      toast.success('Order created successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new order to your system
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
                Customer Information
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="form-group">
                <label htmlFor="customerId" className="form-label">
                  Customer *
                </label>
                {loadingCustomers ? (
                  <div className="flex items-center justify-center py-4">
                    <LoadingSpinner size="sm" text="Loading customers..." />
                  </div>
                ) : (
                  <select
                    id="customerId"
                    className={`input ${errors.customerId ? 'input-error' : ''}`}
                    {...register('customerId', {
                      required: 'Customer is required'
                    })}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} ({customer.email})
                      </option>
                    ))}
                  </select>
                )}
                {errors.customerId && (
                  <p className="form-error">{errors.customerId.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Details
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="form-group">
                <label htmlFor="orderNumber" className="form-label">
                  Order Number *
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  className={`input ${errors.orderNumber ? 'input-error' : ''}`}
                  placeholder="ORD-2024-001"
                  {...register('orderNumber', {
                    required: 'Order number is required'
                  })}
                />
                {errors.orderNumber && (
                  <p className="form-error">{errors.orderNumber.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="amount" className="form-label">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    id="amount"
                    className={`input ${errors.amount ? 'input-error' : ''}`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    {...register('amount', {
                      required: 'Amount is required',
                      min: {
                        value: 0.01,
                        message: 'Amount must be greater than 0'
                      }
                    })}
                  />
                  {errors.amount && (
                    <p className="form-error">{errors.amount.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="totalItems" className="form-label">
                    Total Items
                  </label>
                  <input
                    type="number"
                    id="totalItems"
                    className="input"
                    placeholder="1"
                    min="1"
                    {...register('totalItems')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="status" className="form-label">
                    Order Status
                  </label>
                  <select
                    id="status"
                    className="input"
                    {...register('status')}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="currency" className="form-label">
                    Currency
                  </label>
                  <select
                    id="currency"
                    className="input"
                    {...register('currency')}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="orderDate" className="form-label">
                    Order Date *
                  </label>
                  <input
                    type="datetime-local"
                    id="orderDate"
                    className={`input ${errors.orderDate ? 'input-error' : ''}`}
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    {...register('orderDate', {
                      required: 'Order date is required'
                    })}
                  />
                  {errors.orderDate && (
                    <p className="form-error">{errors.orderDate.message}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="deliveryDate" className="form-label">
                    Expected Delivery Date
                  </label>
                  <input
                    type="datetime-local"
                    id="deliveryDate"
                    className="input"
                    {...register('deliveryDate')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="paymentStatus" className="form-label">
                    Payment Status
                  </label>
                  <select
                    id="paymentStatus"
                    className="input"
                    {...register('paymentStatus')}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="paymentMethod" className="form-label">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    className="input"
                    {...register('paymentMethod')}
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="upi">UPI</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="wallet">Digital Wallet</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Additional Information
              </h3>
            </div>
            <div className="card-body space-y-4">
              <div className="form-group">
                <label htmlFor="notes" className="form-label">
                  Order Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="input"
                  placeholder="Any additional notes about this order..."
                  {...register('notes')}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/orders')}
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Order
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
