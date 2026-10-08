/*
 * Backend API Service
 * 
 * This file contains all API endpoints for the eCommerce application.
 * Currently commented out and using mock data from mockData.js
 * Uncomment and configure when backend services are ready.
 */

import axios from 'axios';
import * as mockData from './mockData';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests from localStorage
api.interceptors.request.use(
  (config) => {
    try {
      // Get access token from localStorage (preferred for API calls)
      const accessToken = localStorage.getItem('accessToken');
      const idToken = localStorage.getItem('token');
      
      // Use accessToken if available, otherwise fall back to idToken
      const token = accessToken || idToken;
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn(`API Request to ${config.url}: No token found in localStorage`);
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// User Service (Port 3001)
const USER_SERVICE_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001';

export const userAPI = {
  signin: (data) => api.post(`${USER_SERVICE_URL}/api/users/signin`, data),
  signup: (data) => api.post(`${USER_SERVICE_URL}/api/users`, data),
  getCurrentUser: () => api.get(`${USER_SERVICE_URL}/api/users/me`),
  createProfile: (data) => api.post(`${USER_SERVICE_URL}/api/users`, data),
  getProfile: () => api.get(`${USER_SERVICE_URL}/api/users/me`),
  updateProfile: (data) => api.put(`${USER_SERVICE_URL}/api/users/me`, data),
  deleteProfile: () => api.delete(`${USER_SERVICE_URL}/api/users/me`),
};

// Catalog Service (Port 3002)
const CATALOG_SERVICE_URL = process.env.REACT_APP_CATALOG_SERVICE_URL || 'http://localhost:3002';

export const catalogAPI = {
  getProducts: (params) => api.get(`${CATALOG_SERVICE_URL}/api/products`, { params }),
  getProduct: (id) => api.get(`${CATALOG_SERVICE_URL}/api/products/${id}`),
  getCategories: () => api.get(`${CATALOG_SERVICE_URL}/api/categories`),
  getCategory: (id) => api.get(`${CATALOG_SERVICE_URL}/api/categories/${id}`),
};

// Inventory Service (Port 3003)
const INVENTORY_SERVICE_URL = process.env.REACT_APP_INVENTORY_SERVICE_URL || 'http://localhost:3003';

export const inventoryAPI = {
  getStock: (productId) => api.get(`${INVENTORY_SERVICE_URL}/api/inventory/${productId}`),
  checkAvailability: (productId, quantity) =>
    api.get(`${INVENTORY_SERVICE_URL}/api/inventory/${productId}/check-availability`, {
      params: { quantity },
    }),
  getAllInventory: (params) => api.get(`${INVENTORY_SERVICE_URL}/api/inventory`, { params }),
  createInventory: (data) => api.post(`${INVENTORY_SERVICE_URL}/api/inventory`, data),
  updateStock: (productId, data) => api.post(`${INVENTORY_SERVICE_URL}/api/inventory/${productId}/update`, data),
  reserveStock: (productId, data) => api.post(`${INVENTORY_SERVICE_URL}/api/inventory/${productId}/reserve`, data),
  releaseStock: (productId, data) => api.post(`${INVENTORY_SERVICE_URL}/api/inventory/${productId}/release`, data),
  confirmSale: (productId, data) => api.post(`${INVENTORY_SERVICE_URL}/api/inventory/${productId}/confirm-sale`, data),
  getInventoryLogs: (productId, params) => api.get(`${INVENTORY_SERVICE_URL}/api/inventory/${productId}/logs`, { params }),
};

// Order Service (Port 3004)
const ORDER_SERVICE_URL = process.env.REACT_APP_ORDER_SERVICE_URL || 'http://localhost:3004';

export const orderAPI = {
  createOrder: (data) => api.post(`${ORDER_SERVICE_URL}/api/orders`, data),
  getOrders: (userId) => api.get(`${ORDER_SERVICE_URL}/api/orders`, { params: { userId } }),
  getOrder: (id) => api.get(`${ORDER_SERVICE_URL}/api/orders/${id}`),
  cancelOrder: (id) => api.put(`${ORDER_SERVICE_URL}/api/orders/${id}/cancel`),
};

// Payment Service (Port 3005)
const PAYMENT_SERVICE_URL = process.env.REACT_APP_PAYMENT_SERVICE_URL || 'http://localhost:3005';

export const paymentAPI = {
  processPayment: (data) => api.post(`${PAYMENT_SERVICE_URL}/api/payments`, data),
  getPayment: (id) => api.get(`${PAYMENT_SERVICE_URL}/api/payments/${id}`),
  getPaymentsByOrder: (orderId) =>
    api.get(`${PAYMENT_SERVICE_URL}/api/payments`, { params: { orderId } }),
};

// TEMP: Using mock data instead of real API

// Helper functions for easier imports
export const getProducts = async (params = {}) => {
  try {
    const response = await catalogAPI.getProducts(params);
    if (response.data && response.data.success) {
      return {
        products: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    }
    return { products: [], pagination: {} };
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Error details:', error.message, error.response?.data);
    // Fallback to mock data
    return { products: mockData.getProducts(), pagination: {} };
  }
};

export const getProductById = async (id) => {
  try {
    const response = await catalogAPI.getProduct(id);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    console.error('Error details:', error.message, error.response?.data);
    // Fallback to mock data
    return mockData.getProductById(id);
  }
};

export const getFeaturedProducts = async (limit = 10) => {
  try {
    const response = await api.get(`${CATALOG_SERVICE_URL}/api/products/featured`, {
      params: { limit }
    });
    if (response.data && response.data.success) {
      return response.data.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    console.error('Error details:', error.message, error.response?.data);
    // Fallback to mock data
    return mockData.getFeaturedProducts();
  }
};

export const getCategories = async () => {
  try {
    const response = await catalogAPI.getCategories();
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    console.error('Error details:', error.message, error.response?.data);
    // Return empty array instead of mock data to see the actual error
    return [];
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await catalogAPI.getCategory(id);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching category:', error);
    return null;
  }
};

export const createProduct = async (data, images = []) => {
  try {
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', data.name);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('sku', data.sku);
    
    if (data.description) formData.append('description', data.description);
    if (data.brand) formData.append('brand', data.brand);
    if (data.tags) formData.append('tags', data.tags);
    if (data.isFeatured !== undefined) formData.append('isFeatured', data.isFeatured);
    
    // Add image files (up to 5)
    if (images && images.length > 0) {
      images.slice(0, 5).forEach((image) => {
        formData.append('images', image);
      });
    }
    
    const response = await api.post(`${CATALOG_SERVICE_URL}/api/products`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to create product' 
    };
  }
};

export const updateProduct = async (id, data, images = []) => {
  try {
    const formData = new FormData();
    
    // Add text fields
    if (data.name) formData.append('name', data.name);
    if (data.price !== undefined) formData.append('price', data.price);
    if (data.category) formData.append('category', data.category);
    if (data.sku) formData.append('sku', data.sku);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.brand !== undefined) formData.append('brand', data.brand);
    if (data.tags !== undefined) formData.append('tags', data.tags);
    if (data.isFeatured !== undefined) formData.append('isFeatured', data.isFeatured);
    
    // Add new image files if provided
    if (images && images.length > 0) {
      images.slice(0, 5).forEach((image) => {
        formData.append('images', image);
      });
    }
    
    const response = await api.put(`${CATALOG_SERVICE_URL}/api/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update product' 
    };
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`${CATALOG_SERVICE_URL}/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete product' 
    };
  }
};

export const createCategory = async (data) => {
  try {
    const response = await api.post(`${CATALOG_SERVICE_URL}/api/categories`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to create category' 
    };
  }
};

export const updateCategory = async (id, data) => {
  try {
    const response = await api.put(`${CATALOG_SERVICE_URL}/api/categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update category' 
    };
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`${CATALOG_SERVICE_URL}/api/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to delete category' 
    };
  }
};

export const createOrder = async (data) => {
  // const response = await orderAPI.createOrder(data);
  // return response.data;
  return Promise.resolve({ success: true, data: { orderNumber: 'ORD-' + Date.now() } });
};

export const getAllOrders = async (params = {}) => {
  try {
    // Request all orders with large limit
    const response = await api.get(`${ORDER_SERVICE_URL}/api/orders`, {
      params: { limit: 100, ...params }
    });
    // Handle nested response structure
    return response.data.data || response.data.orders || response.data;
  } catch (error) {
    console.error('Failed to fetch all orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  return mockData.getOrderById(orderId);
};

export const updateOrderStatus = async (orderId, status) => {
  return mockData.updateOrderStatus(orderId, status);
};

export const getDashboardStats = async () => {
  return mockData.getDashboardStats();
};

export const getRevenueByPeriod = async (period) => {
  return mockData.getRevenueByPeriod(period);
};

export const getTopProducts = async (limit) => {
  return mockData.getTopProducts(limit);
};

export const getOrdersByStatus = async () => {
  return mockData.getOrdersByStatus();
};

export const processPayment = async (data) => {
  // const response = await paymentAPI.processPayment(data);
  // return response.data;
  return Promise.resolve({ 
    success: true, 
    transactionId: 'TXN-' + Date.now(),
    status: 'COMPLETED'
  });
};

// Inventory helper functions
export const getAllInventory = async (params = {}) => {
  try {
    const response = await inventoryAPI.getAllInventory(params);
    if (response.data && response.data.success) {
      return {
        items: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    }
    return { items: [], pagination: {} };
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return { items: [], pagination: {} };
  }
};

export const getInventoryByProduct = async (productId) => {
  try {
    const response = await inventoryAPI.getStock(productId);
    if (response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return null;
  }
};

export const createInventory = async (data) => {
  try {
    const response = await inventoryAPI.createInventory(data);
    return response.data;
  } catch (error) {
    console.error('Error creating inventory:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to create inventory' 
    };
  }
};

export const updateInventoryStock = async (productId, data) => {
  try {
    const response = await inventoryAPI.updateStock(productId, data);
    return response.data;
  } catch (error) {
    console.error('Error updating inventory:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to update inventory' 
    };
  }
};

export const getInventoryLogs = async (productId, params = {}) => {
  try {
    const response = await inventoryAPI.getInventoryLogs(productId, params);
    if (response.data && response.data.success) {
      return {
        logs: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    }
    return { logs: [], pagination: {} };
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    return { logs: [], pagination: {} };
  }
};

export default api;
