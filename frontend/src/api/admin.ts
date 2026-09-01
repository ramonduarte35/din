import { api } from './client';

export interface AdminWhatsAppInstance {
  id: string;
  instance_name: string;
  phone_number: string;
  label: string;
  is_active: boolean;
  created_at: string;
  connection_status: 'open' | 'close' | 'connecting' | string;
  is_connected: boolean;
}

export interface AdminWhatsAppLog {
  id: string;
  sender_number: string;
  target_instance: string;
  message_body: string;
  status: 'SUCCESS' | 'USER_NOT_FOUND' | 'PRO_REQUIRED' | 'PARSING_ERROR';
  openai_response_payload?: any;
  created_at: string;
}

export interface QrCodeResponse {
  instance_name: string;
  base64: string | null;
  code: string | null;
  pairingCode?: string | null;
  count: number;
}

export async function fetchAdminInstances(): Promise<AdminWhatsAppInstance[]> {
  const { data } = await api.get<{ instances: AdminWhatsAppInstance[] }>('/admin/whatsapp/instances');
  return data.instances;
}

export async function createAdminInstance(payload: {
  instance_name: string;
  phone_number: string;
  label: string;
  is_active?: boolean;
}): Promise<AdminWhatsAppInstance> {
  const { data } = await api.post<{ instance: AdminWhatsAppInstance }>('/admin/whatsapp/instances', payload);
  return data.instance;
}

export async function getAdminInstanceQrCode(id: string): Promise<QrCodeResponse> {
  const { data } = await api.get<QrCodeResponse>(`/admin/whatsapp/instances/${id}/qrcode`);
  return data;
}

export async function getAdminInstanceStatus(id: string): Promise<{
  id: string;
  instance_name: string;
  connection_status: string;
  is_connected: boolean;
}> {
  const { data } = await api.get(`/admin/whatsapp/instances/${id}/status`);
  return data;
}

export async function restartAdminInstance(id: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(`/admin/whatsapp/instances/${id}/restart`);
  return data;
}

export async function logoutAdminInstance(id: string): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(`/admin/whatsapp/instances/${id}/logout`);
  return data;
}

export async function updateAdminInstance(
  id: string,
  payload: { label?: string; phone_number?: string; is_active?: boolean }
): Promise<{ message: string; instance: AdminWhatsAppInstance }> {
  const { data } = await api.patch<{ message: string; instance: AdminWhatsAppInstance }>(
    `/admin/whatsapp/instances/${id}`,
    payload
  );
  return data;
}

export async function deleteAdminInstance(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/admin/whatsapp/instances/${id}`);
  return data;
}

export async function fetchAdminLogs(params?: {
  page?: number;
  limit?: number;
  status?: string;
  sender?: string;
}): Promise<{
  data: AdminWhatsAppLog[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}> {
  const { data } = await api.get('/admin/whatsapp/logs', { params });
  return data;
}
