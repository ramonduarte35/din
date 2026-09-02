import { api } from './client';

export type AccountType = 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CREDIT_CARD' | 'CASH' | 'OTHER';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  color: string;
  icon: string;
  initial_balance: number;
  current_balance: number;
  month_income?: number;
  month_expense?: number;
  month_balance?: number;
  transactions_count?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountInput {
  name: string;
  type?: AccountType;
  color?: string;
  icon?: string;
  initial_balance?: number;
  is_default?: boolean;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
  color?: string;
  icon?: string;
  initial_balance?: number;
  is_default?: boolean;
}

export async function getAccountsRequest(): Promise<Account[]> {
  const response = await api.get<Account[]>('/accounts');
  return response.data;
}

export async function getAccountByIdRequest(id: string): Promise<Account> {
  const response = await api.get<Account>(`/accounts/${id}`);
  return response.data;
}

export async function createAccountRequest(data: CreateAccountInput): Promise<Account> {
  const response = await api.post<Account>('/accounts', data);
  return response.data;
}

export async function updateAccountRequest(id: string, data: UpdateAccountInput): Promise<Account> {
  const response = await api.put<Account>(`/accounts/${id}`, data);
  return response.data;
}

export async function deleteAccountRequest(id: string): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(`/accounts/${id}`);
  return response.data;
}
