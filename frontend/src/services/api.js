import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
console.log('Frontend API_URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message;
    const isOptionalEndpoint = error.config?.url?.includes('/recommendations');
    
    if (error.response?.status === 401) {
      // Only redirect/show toast for critical 401 errors (not recommendations)
      if (!isOptionalEndpoint) {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
      // For optional endpoints, fail silently to allow fallback behavior
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (userData) => api.put('/auth/profile', userData);

// Product APIs
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (productData) => {
  const formData = new FormData();
  Object.keys(productData).forEach(key => {
    if (key === 'image' && productData.image) {
      formData.append('image', productData.image);
    } else if (key === 'model' && productData.model) {
      formData.append('model', productData.model);
    } else {
      formData.append(key, productData[key]);
    }
  });
  return api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateProduct = (id, productData) => {
  const formData = new FormData();
  Object.keys(productData).forEach(key => {
    if (key === 'image' && productData.image) {
      formData.append('image', productData.image);
    } else if (key === 'model' && productData.model) {
      formData.append('model', productData.model);
    } else if (productData[key] !== undefined) {
      formData.append(key, productData[key]);
    }
  });
  return api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getCategories = () => api.get('/products/categories');

// Cart APIs
export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity) => api.post('/cart', { productId, quantity });
export const updateCartItem = (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity });
export const removeFromCart = (itemId) => api.delete(`/cart/${itemId}`);
export const clearCart = () => api.delete('/cart');

// Order APIs
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getMyOrders = () => api.get('/orders/myorders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const getOrders = () => api.get('/orders');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

// Recommendation APIs
export const getRecommendations = () => api.get('/recommendations');
export const predictDemand = (productId, months) => 
  api.post('/recommendations/predict-demand', { productId, months });

// User APIs (Admin)
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export default api;