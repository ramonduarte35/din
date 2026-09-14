import { api } from './client';

export type ReceivableStatus = 'PENDING' | 'RECEIVED' | 'OVERDUE' | 'CANCELLED';

export interface Receivable {
  id: string;
  user_id: string;
  contact_id?: string | null;
  category_id?: string | null;
  account_id?: string | null;
  transaction_id?: string | null;
  description: string;
  amount: number;
  due_date: string;
  received_date?: string | null;
  status: ReceivableStatus;
  computed_status?: ReceivableStatus;
  notes?: string | null;
  is_recurring: boolean;
  installment_number?: number | null;
  total_installments?: number | null;
  group_id?: string | null;
  created_at: string;
  updated_at: string;
  contact?: {
    id: string;
    name: string;
    type: 'PF' | 'PJ';
  } | null;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
  account?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
}

export interface ReceivableSummary {
  month: number;
  year: number;
  total_pending: { amount: number; count: number };
  total_overdue: { amount: number; count: number };
  total_received: { amount: number; count: number };
  upcoming_receivables: Receivable[];
}

export interface ListReceivablesParams {
  status?: ReceivableStatus;
  contact_id?: string;
  category_id?: string;
  account_id?: string;
  search?: string;
  month?: number;
  year?: number;
  start_due_date?: string;
  end_due_date?: string;
  page?: number;
  limit?: number;
}

export interface ListReceivablesResponse {
  receivables: Receivable[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateReceivableData {
  description: string;
  amount: number;
  due_date: string;
  contact_id?: string | null;
  category_id?: string | null;
  account_id?: string | null;
  notes?: string | null;
  is_recurring?: boolean;
  total_installments?: number;
}

export interface ReceiveReceivableData {
  account_id: string;
  received_date?: string;
  amount?: number;
}

export async function fetchReceivables(params?: ListReceivablesParams): Promise<ListReceivablesResponse> {
  const { data } = await api.get('/receivables', { params });
  return data;
}

export async function fetchReceivableSummary(month?: number, year?: number): Promise<ReceivableSummary> {
  const { data } = await api.get('/receivables/summary', { params: { month, year } });
  return data;
}

export async function fetchReceivableById(id: string): Promise<Receivable> {
  const { data } = await api.get(`/receivables/${id}`);
  return data;
}

export async function createReceivable(receivableData: CreateReceivableData): Promise<Receivable> {
  const { data } = await api.post('/receivables', receivableData);
  return data;
}

export async function updateReceivable(
  id: string,
  receivableData: Partial<CreateReceivableData>
): Promise<Receivable> {
  const { data } = await api.put(`/receivables/${id}`, receivableData);
  return data;
}

export async function deleteReceivable(id: string, scope: 'SINGLE' | 'ALL' = 'SINGLE'): Promise<void> {
  await api.delete(`/receivables/${id}`, { params: { scope } });
}

export async function receiveReceivable(
  id: string,
  receiveData: ReceiveReceivableData
): Promise<{ receivable: Receivable; transaction: any }> {
  const { data } = await api.post(`/receivables/${id}/receive`, receiveData);
  return data;
}

export async function unreceiveReceivable(id: string): Promise<Receivable> {
  const { data } = await api.post(`/receivables/${id}/unreceive`);
  return data;
}
