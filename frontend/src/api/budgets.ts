import { api } from './client';

export interface BudgetCategory {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
}

export interface BudgetItem {
  id: string;
  category_id: string;
  category: BudgetCategory;
  budgeted_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage: number;
  status: 'NORMAL' | 'WARNING' | 'DANGER' | 'EXCEEDED';
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetSummary {
  total_budgeted: number;
  total_spent: number;
  total_remaining: number;
  overall_percentage: number;
  total_all_expenses: number;
  budgeted_categories_count: number;
  available_categories_count: number;
}

export interface MonthlyBudgetsResponse {
  month: number;
  year: number;
  summary: BudgetSummary;
  budgets: BudgetItem[];
  available_categories: BudgetCategory[];
}

export async function getBudgetsRequest(month?: number, year?: number): Promise<MonthlyBudgetsResponse> {
  const params: Record<string, number> = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const { data } = await api.get<MonthlyBudgetsResponse>('/budgets', { params });
  return data;
}

export async function upsertBudgetRequest(payload: {
  category_id: string;
  amount: number;
  month: number;
  year: number;
}): Promise<any> {
  const { data } = await api.post('/budgets', payload);
  return data;
}

export async function updateBudgetRequest(id: string, amount: number): Promise<any> {
  const { data } = await api.put(`/budgets/${id}`, { amount });
  return data;
}

export async function deleteBudgetRequest(id: string): Promise<void> {
  await api.delete(`/budgets/${id}`);
}

export async function copyPreviousBudgetsRequest(payload: {
  target_month: number;
  target_year: number;
}): Promise<any> {
  const { data } = await api.post('/budgets/copy-previous', payload);
  return data;
}
