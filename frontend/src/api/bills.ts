import { api } from './client';

export type BillStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface Bill {
  id: string;
  user_id: string;
  category_id?: string | null;
  account_id?: string | null;
  transaction_id?: string | null;
  description: string;
  amount: number;
  due_date: string;
  paid_date?: string | null;
  status: BillStatus;
  computed_status?: BillStatus;
  barcode?: string | null;
  notes?: string | null;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
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

export interface BillSummary {
  month: number;
  year: number;
  total_pending: {
    amount: number;
    count: number;
  };
  total_overdue: {
    amount: number;
    count: number;
  };
  total_paid: {
    amount: number;
    count: number;
  };
  upcoming_bills: Bill[];
}

export interface ListBillsParams {
  status?: BillStatus;
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

export interface ListBillsResponse {
  bills: Bill[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateBillData {
  description: string;
  amount: number;
  due_date: string;
  category_id?: string | null;
  account_id?: string | null;
  barcode?: string | null;
  notes?: string | null;
  is_recurring?: boolean;
}

export interface PayBillData {
  account_id: string;
  paid_date?: string;
  amount?: number;
}

export async function fetchBills(params?: ListBillsParams): Promise<ListBillsResponse> {
  const { data } = await api.get('/bills', { params });
  return data;
}

export async function fetchBillSummary(month?: number, year?: number): Promise<BillSummary> {
  const { data } = await api.get('/bills/summary', { params: { month, year } });
  return data;
}

export async function fetchBillById(id: string): Promise<Bill> {
  const { data } = await api.get(`/bills/${id}`);
  return data;
}

export async function createBill(billData: CreateBillData): Promise<Bill> {
  const { data } = await api.post('/bills', billData);
  return data;
}

export async function updateBill(id: string, billData: Partial<CreateBillData>): Promise<Bill> {
  const { data } = await api.put(`/bills/${id}`, billData);
  return data;
}

export async function deleteBill(id: string): Promise<void> {
  await api.delete(`/bills/${id}`);
}

export async function payBill(id: string, payData: PayBillData): Promise<{ bill: Bill; transaction: any }> {
  const { data } = await api.post(`/bills/${id}/pay`, payData);
  return data;
}

export async function unpayBill(id: string): Promise<Bill> {
  const { data } = await api.post(`/bills/${id}/unpay`);
  return data;
}
