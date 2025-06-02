import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  ShoppingCart,
  User,
  CreditCard,
  Calendar,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin
} from 'lucide-react';
import { ordersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderData();
  }, [id]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(id);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Failed to load order:', error);
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      shipped: Truck,
      delivered: Package,
      cancelled: XCircle,
      refunded: XCircle,
    };
    return icons[status] || Clock;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-primary',
      shipped: 'badge-info',
      delivered: 'badge-success',
      cancelled: 'badge-error',
      refunded: 'badge-secondary',
    };
    return badges[status] || 'badge-secondary';
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      paid: 'badge-success',
      failed: 'badge-error',
      refunded: 'badge-secondary',
    };
    return badges[status] || 'badge-secondary';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading order details..." />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Order not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The order you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Link to="/orders" className="btn btn-primary">
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Order ID: {order._id.slice(-8)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to={`/orders/${order._id}/edit`}
              className="btn btn-secondary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <StatusIcon className="h-5 w-5 mr-2" />
                Order Status
              </h3>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`badge ${getStatusBadge(order.status)} text-lg px-4 py-2`}>
                    {order.status}
                  </span>
                  <p className="mt-2 text-sm text-gray-500">
                    Last updated: {formatDate(order.updatedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(order.amount)}
                  </p>
                  <p className="text-sm text-gray-500">{order.currency}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h3>
            </div>
            <div className="card-body">
              {order.customerId ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-sm text-gray-900">{order.customerId.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{order.customerId.email}</p>
                  </div>
                  {order.customerId.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-sm text-gray-900">{order.customerId.phone}</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <Link
                      to={`/customers/${order.customerId._id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View Customer Profile →
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Customer information not available</p>
              )}
            </div>
          </div>

          {/* Order Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Order Details
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Number</p>
                    <p className="text-sm text-gray-900">{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Date</p>
                    <p className="text-sm text-gray-900">{formatDate(order.orderDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Items</p>
                    <p className="text-sm text-gray-900">{order.totalItems || order.items?.length || 1}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount</p>
                    <p className="text-sm text-gray-900">{formatCurrency(order.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Currency</p>
                    <p className="text-sm text-gray-900">{order.currency}</p>
                  </div>
                  {order.deliveryDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Expected Delivery</p>
                      <p className="text-sm text-gray-900">{formatDate(order.deliveryDate)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {order.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-500 mb-2">Order Notes</p>
                  <p className="text-sm text-gray-900">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Status</p>
                    <span className={`badge ${getPaymentStatusBadge(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="text-sm text-gray-900 capitalize">{order.paymentMethod}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                    <p className="text-sm text-gray-900">{formatCurrency(order.amount)}</p>
                  </div>
                  {order.paymentDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Date</p>
                      <p className="text-sm text-gray-900">{formatDate(order.paymentDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Timeline Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Order Timeline</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Order Placed</p>
                    <p className="text-sm text-gray-500">{formatDate(order.orderDate)}</p>
                  </div>
                </div>

                {order.status !== 'pending' && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Order Confirmed</p>
                      <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                    </div>
                  </div>
                )}

                {order.status === 'shipped' && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Truck className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Order Shipped</p>
                      <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                    </div>
                  </div>
                )}

                {order.status === 'delivered' && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Order Delivered</p>
                      <p className="text-sm text-gray-500">
                        {order.deliveryDate ? formatDate(order.deliveryDate) : formatDate(order.updatedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {(order.status === 'cancelled' || order.status === 'refunded') && (
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Order {order.status === 'cancelled' ? 'Cancelled' : 'Refunded'}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(order.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="card-body space-y-3">
              <Link
                to={`/orders/${order._id}/edit`}
                className="btn btn-secondary btn-sm w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </Link>
              
              {order.customerId && (
                <Link
                  to={`/customers/${order.customerId._id}`}
                  className="btn btn-secondary btn-sm w-full"
                >
                  <User className="h-4 w-4 mr-2" />
                  View Customer
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
