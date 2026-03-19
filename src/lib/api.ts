import axios from 'axios';
import type { AuthResponse, User, Tenant, Product, Sale, DashboardStats, RevenueData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (identifier: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { identifier, password }),
  
  register: (data: {
    tenantName: string;
    name: string;
    phone: string;
    email?: string;
    password: string;
  }) => api.post<AuthResponse>('/auth/register', data),
  
  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),
};

// Tenants (Admin Général)
export const tenantsAPI = {
  getAll: () => api.get<Tenant[]>('/tenants'),
  getOne: (id: string) => api.get<Tenant>(`/tenants/${id}`),
  getStats: () => api.get('/tenants/stats'),
  suspend: (id: string) => api.patch(`/tenants/${id}/suspend`),
  activate: (id: string) => api.patch(`/tenants/${id}/activate`),
  changePlan: (id: string, planId: string) => api.patch(`/tenants/${id}/plan`, { planId }),
};

// Products
export const productsAPI = {
  getAll: () => api.get<Product[]>('/products'),
  getOne: (id: string) => api.get<Product>(`/products/${id}`),
  create: (data: Partial<Product>) => api.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => api.patch<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Sales
export const salesAPI = {
  getAll: (limit?: number) => api.get<Sale[]>('/sales', { params: { limit } }),
  getMine: (limit?: number) => api.get('/sales/mine', { params: { limit } }),
  getOne: (id: string) => api.get<Sale>(`/sales/${id}`),
  create: (data: {
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
    totalAmount: number;
    paymentMethod: string;
  }) => api.post<Sale>('/sales', data),
  cancel: (id: string) => api.patch(`/sales/${id}/cancel`),
};

// Inventory
export const inventoryAPI = {
  getStocks: () => api.get('/inventory/stocks'),
  getLowStocks: () => api.get('/inventory/low-stocks'),
  adjustStock: (data: {
    productId: string;
    quantity: number;
    type: string;
    note?: string;
  }) => api.post('/inventory/adjust', data),
  getMovements: (productId?: string) =>
    api.get('/inventory/movements', { params: { productId } }),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRevenues: (period: 'day' | 'week' | 'month' | 'year') =>
    api.get<RevenueData>('/dashboard/revenues', { params: { period } }),
  getActivity: () => api.get('/dashboard/activity'),
};

// Users
export const usersAPI = {
  getAll: () => api.get<User[]>('/users'),
  invite: (data: { name: string; email: string; password: string }) =>
    api.post('/users/invite', data),
  toggleActive: (id: string) => api.patch(`/users/${id}/toggle-active`),
  updateProfile: (data: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) =>
    api.patch('/users/profile', data),
};

// Subscriptions
export const subscriptionsAPI = {
  getPlans: (includeInactive = false) => 
    api.get(`/subscriptions/plans?includeInactive=${includeInactive}`),
  getPlan: (planId: string) => api.get(`/subscriptions/plans/${planId}`),
  createPlan: (data: any) => api.post('/subscriptions/plans', data),
  updatePlan: (planId: string, data: any) => api.patch(`/subscriptions/plans/${planId}`, data),
  togglePlanStatus: (planId: string) => api.patch(`/subscriptions/plans/${planId}/toggle`),
  getMySubscription: () => api.get('/subscriptions/me'),
  getUsage: () => api.get('/subscriptions/usage'),
  upgrade: (planId: string) => api.patch(`/subscriptions/upgrade/${planId}`),
  cancel: () => api.patch('/subscriptions/cancel'),
  getTrialConfig: () => api.get('/subscriptions/trial-config'),
  updateTrialConfig: (trialDurationDays: number) =>
    api.patch('/subscriptions/trial-config', { trialDurationDays }),
};

export default api;

// Notifications
export const notificationsAPI = {
  getMine: () => api.get('/notifications'),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
  getAll: () => api.get('/notifications/admin/all'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  send: (data: { tenantId: string; title: string; message: string }) =>
    api.post('/notifications/send', data),
  broadcast: (data: { title: string; message: string }) =>
    api.post('/notifications/broadcast', data),
};
