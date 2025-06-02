import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  TrendingUp,
  User,
  Activity
} from 'lucide-react';
import { customersAPI, ordersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    loadCustomerData();
    loadCustomerOrders();
  }, [id]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getById(id);
      setCustomer(response.data.data);
    } catch (error) {
      console.error('Failed to load customer:', error);
      toast.error('Failed to load customer details');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await ordersAPI.getAll({ customerId: id, limit: 10 });
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Failed to load customer orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      await customersAPI.delete(id);
      toast.success('Customer deleted successfully');
      navigate('/customers');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      inactive: 'badge-warning',
      churned: 'badge-error',
    };
    return badges[status] || 'badge-secondary';
  };

  const getValueCategoryBadge = (totalSpent) => {
    if (totalSpent >= 50000) return { class: 'badge-primary', text: 'Premium' };
    if (totalSpent >= 10000) return { class: 'badge-success', text: 'High Value' };
    if (totalSpent >= 1000) return { class: 'badge-warning', text: 'Regular' };
    return { class: 'badge-secondary', text: 'New' };
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
    });
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading customer details..." />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Customer not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The customer you're looking for doesn't exist.
          </p>
          <div className="mt-6">
            <Link to="/customers" className="btn btn-primary">
              Back to Customers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const valueBadge = getValueCategoryBadge(customer.totalSpent);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/customers')}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <p className="mt-1 text-sm text-gray-500">
                Customer ID: {customer._id.slice(-8)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to={`/customers/${customer._id}/edit`}
              className="btn btn-secondary"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-error"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{customer.email}</p>
                    </div>
                  </div>
                  
                  {customer.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-3 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{customer.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Joined</p>
                      <p className="text-sm text-gray-900">{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {(customer.city || customer.state || customer.country) && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-3 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-sm text-gray-900">
                          {[customer.city, customer.state, customer.country]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`badge ${getStatusBadge(customer.status)}`}>
                        {customer.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-3 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <span className={`badge ${valueBadge.class}`}>
                        {valueBadge.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Recent Orders
                </h3>
                <Link
                  to={`/orders?customer=${customer._id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View all orders
                </Link>
              </div>
            </div>
            <div className="card-body">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner text="Loading orders..." />
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.orderDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.amount)}
                        </p>
                        <span className={`badge badge-sm ${
                          order.status === 'delivered' ? 'badge-success' :
                          order.status === 'shipped' ? 'badge-info' :
                          order.status === 'cancelled' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto h-8 w-8 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This customer hasn't placed any orders.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Customer Stats</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(customer.totalSpent)}
                </p>
                <p className="text-sm text-gray-500">Total Spent</p>
              </div>
              
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {customer.visitCount || 0}
                </p>
                <p className="text-sm text-gray-500">Total Visits</p>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </p>
                <p className="text-sm text-gray-500">Total Orders</p>
              </div>

              {customer.lastOrderDate && (
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(customer.lastOrderDate)}
                  </p>
                  <p className="text-sm text-gray-500">Last Order</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
