export enum UserRole {
  ADMIN_GENERAL = 'ADMIN_GENERAL',
  ADMIN_COMMERCANT = 'ADMIN_COMMERCANT',
  EMPLOYE = 'EMPLOYE',
}

export enum TenantStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  TRIAL_EXPIRED = 'TRIAL_EXPIRED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: TenantStatus;
  trialEndsAt?: string;
  createdAt: string;
  subscription?: Subscription;
  _count?: { users: number; products: number; sales: number };
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  buyPrice: number;
  sellPrice: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  stock?: Stock;
  category?: Category;
}

export interface Stock {
  id: string;
  quantity: number;
  alertThreshold: number;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Sale {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: SaleItem[];
  user?: { name: string };
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  lowStocks: number;
}

export interface RevenueData {
  period: string;
  totalRevenue: number;
  totalSales: number;
  startDate: string;
  endDate: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
  maxProducts?: number;
  maxEmployees?: number;
  maxStores?: number;
  isActive?: boolean;
}

export interface Subscription {
  id: string;
  tenantId: string;
  plan: string;
  status: string;
  startDate: string;
  endDate?: string;
  renewedAt?: string;
}

export interface UsageStats {
  plan: string;
  planId: string;
  products: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  employees: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  stores: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  status: string;
  endDate?: string;
}

export type NotificationType = 'SUBSCRIPTION_EXPIRY' | 'TRIAL_EXPIRY' | 'ADMIN_MESSAGE' | 'SYSTEM';

export interface Notification {
  id: string;
  tenantId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  tenant?: { id: string; name: string };
}
