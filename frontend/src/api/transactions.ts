import { api } from './client';
import { Category } from './categories';
import { Account } from './accounts';

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionOrigin = 'MANUAL' | 'WHATSAPP_TEXT' | 'WHATSAPP_AUDIO';

export interface Transaction {
  id: string;
  user_id: string;
  account_id?: string | null;
  category_id: string | null;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  origin: TransactionOrigin;
  received_on_number: string | null;
  raw_message: string | null;
  created_at: string;
  category?: Category | null;
  account?: Account | null;
}

export interface TransactionsListResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SummaryKPI {
  income: number;
  expense: number;
  balance: number;
  transactions_count: number;
}

export interface CategoryBreakdownItem {
  name: string;
  amount: number;
  color: string;
  icon: string;
  count: number;
  percentage: number;
}

export interface MonthlyHistoryItem {
  month: string;
  year: number;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

export interface TransactionsSummary {
  current_month: SummaryKPI;
  previous_month: {
    income: number;
    expense: number;
    balance: number;
  };
  total_balance: number;
  category_breakdown: CategoryBreakdownItem[];
  monthly_history: MonthlyHistoryItem[];
  recent_transactions: Transaction[];
}

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  type?: TransactionType;
  account_id?: string;
  category_id?: string;
  origin?: TransactionOrigin;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getTransactionsRequest(filters: TransactionFilters = {}): Promise<TransactionsListResponse> {
  const { data } = await api.get<TransactionsListResponse>('/transactions', { params: filters });
  return data;
}

export async function createTransactionRequest(payload: {
  description: string;
  amount: number;
  type: TransactionType;
  account_id?: string | null;
  category_id?: string | null;
  date?: string;
}): Promise<{ transaction: Transaction }> {
  const { data } = await api.post<{ transaction: Transaction }>('/transactions', payload);
  return data;
}

export async function updateTransactionRequest(
  id: string,
  payload: Partial<{
    description: string;
    amount: number;
    type: TransactionType;
    account_id?: string | null;
    category_id?: string | null;
    date?: string;
  }>
): Promise<{ transaction: Transaction }> {
  const { data } = await api.put<{ transaction: Transaction }>(`/transactions/${id}`, payload);
  return data;
}

export async function deleteTransactionRequest(id: string): Promise<void> {
  await api.delete(`/transactions/${id}`);
}

export async function getTransactionsSummaryRequest(): Promise<TransactionsSummary> {
  const { data } = await api.get<{ summary: TransactionsSummary }>('/transactions/summary');
  return data.summary;
}

export async function simulateWhatsAppRequest(payload: {
  sender: string;
  message: string;
  instance?: string;
}): Promise<any> {
  const { data } = await api.post('/webhooks/simulate', payload);
  return data;
}
