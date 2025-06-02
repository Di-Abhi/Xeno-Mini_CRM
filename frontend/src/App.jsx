import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// 🎯 Welcome to Mini CRM Platform
// A modern, intuitive customer relationship management system
// Built with love for modern businesses

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CreateCustomer from './pages/CreateCustomer';
import CustomerDetail from './pages/CustomerDetail';
import EditCustomer from './pages/EditCustomer';
import Orders from './pages/Orders';
import CreateOrder from './pages/CreateOrder';
import OrderDetail from './pages/OrderDetail';
import EditOrder from './pages/EditOrder';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Customer and Order Management */}
            <Route path="/customers" element={
              <ProtectedRoute>
                <Layout>
                  <Customers />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/customers/new" element={
              <ProtectedRoute>
                <Layout>
                  <CreateCustomer />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/customers/:id" element={
              <ProtectedRoute>
                <Layout>
                  <CustomerDetail />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/customers/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <EditCustomer />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/orders" element={
              <ProtectedRoute>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/orders/new" element={
              <ProtectedRoute>
                <Layout>
                  <CreateOrder />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <Layout>
                  <OrderDetail />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/orders/:id/edit" element={
              <ProtectedRoute>
                <Layout>
                  <EditOrder />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/campaigns" element={
              <ProtectedRoute>
                <Layout>
                  <Campaigns />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/campaigns/new" element={
              <ProtectedRoute>
                <Layout>
                  <CreateCampaign />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/campaigns/:id" element={
              <ProtectedRoute>
                <Layout>
                  <CampaignDetail />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 🚫 404 - Page Not Found */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
                  <div className="text-6xl mb-4">🔍</div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                  <p className="text-gray-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                  >
                    ← Go Back
                  </button>
                </div>
              </div>
            } />
          </Routes>

          {/* 🍞 Beautiful toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              },
              success: {
                duration: 3000,
                style: {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#10b981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#ef4444',
                },
              },
              loading: {
                style: {
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#3b82f6',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
