import { api } from './client';

export interface PlanItem {
  id: string;
  name: string;
  cycle: 'MONTHLY' | 'YEARLY';
  price: number;
  period: string;
  popular?: boolean;
  badge?: string;
  features: string[];
}

export interface SubscriptionPaymentRecord {
  id: string;
  asaas_payment_id: string;
  amount: number | string;
  billing_type: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'UNDEFINED';
  status: string;
  due_date: string | null;
  payment_date: string | null;
  invoice_url: string | null;
  bank_slip_url: string | null;
  pix_qr_code: string | null;
  pix_copy_paste: string | null;
  description: string | null;
  created_at: string;
}

export interface MySubscriptionResponse {
  tier: 'FREE' | 'PRO';
  status: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
  expires_at: string | null;
  days_remaining: number | null;
  is_pro: boolean;
  telegram_linked: boolean;
  whatsapp_configured: boolean;
  recent_payments: SubscriptionPaymentRecord[];
}

export interface CheckoutPayload {
  plan_cycle: 'MONTHLY' | 'YEARLY';
  billing_type?: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | 'UNDEFINED';
  cpf_cnpj?: string;
  phone?: string;
}

export interface CheckoutResponse {
  payment_id: string;
  asaas_payment_id: string;
  amount: number;
  due_date: string;
  url?: string;
  invoice_url?: string;
  bank_slip_url?: string;
  pix_qr_code?: string;
  pix_copy_paste?: string;
  pix_expires_at?: string;
}

export interface AdminSubscriptionOverview {
  total_users: number;
  total_pro_users: number;
  total_free_users: number;
  expiring_soon_users: number;
  estimated_mrr: number;
  total_revenue: number;
  recent_payments: any[];
}

export interface AdminSubscriptionUser {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  telegram_id: string | null;
  telegram_username: string | null;
  avatar_url: string | null;
  role: 'USER' | 'ADMIN';
  subscription_tier: 'FREE' | 'PRO';
  subscription_status: string;
  subscription_expires_at: string | null;
  days_remaining: number | null;
  is_expired: boolean;
  asaas_customer_id: string | null;
  created_at: string;
  _count: {
    transactions: number;
    bills: number;
    payments: number;
  };
}

export interface ManageSubscriptionPayload {
  subscription_tier: 'FREE' | 'PRO';
  subscription_status?: string;
  days_to_add?: number;
  expires_at?: string | null;
  is_lifetime?: boolean;
  notes?: string;
}

// ─── Rotas de Usuário ────────────────────────────────────────────────────────

export async function fetchMySubscription(): Promise<MySubscriptionResponse> {
  const res = await api.get('/subscriptions/my-subscription');
  return res.data;
}

export async function fetchPlans(): Promise<{ plans: PlanItem[] }> {
  const res = await api.get('/subscriptions/plans');
  return res.data;
}

export async function createCheckout(payload: CheckoutPayload): Promise<CheckoutResponse> {
  const res = await api.post('/subscriptions/checkout', payload);
  return res.data;
}

// ─── Rotas Administrativas ───────────────────────────────────────────────────

export async function fetchAdminSubscriptionsOverview(): Promise<AdminSubscriptionOverview> {
  const res = await api.get('/admin/subscriptions/overview');
  return res.data;
}

export async function fetchAdminSubscriptionsUsers(params?: {
  search?: string;
  tier?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: AdminSubscriptionUser[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const res = await api.get('/admin/subscriptions/users', { params });
  return res.data;
}

export async function manageAdminUserSubscription(
  userId: string,
  payload: ManageSubscriptionPayload
): Promise<{ success: boolean; message: string; user: any }> {
  const res = await api.post(`/admin/subscriptions/users/${userId}/manage`, payload);
  return res.data;
}

export async function fetchAdminSubscriptionsPayments(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ payments: any[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const res = await api.get('/admin/subscriptions/payments', { params });
  return res.data;
}
