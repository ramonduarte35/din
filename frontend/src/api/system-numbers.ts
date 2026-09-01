import { api } from './client';

export interface SystemWhatsAppNumber {
  id: string;
  instance_name: string;
  phone_number: string;
  formatted_phone: string;
  label: string;
  whatsapp_link: string;
  is_active: boolean;
}

export async function getSystemNumbersRequest(): Promise<SystemWhatsAppNumber[]> {
  const { data } = await api.get<{ system_numbers: SystemWhatsAppNumber[] }>('/system-numbers');
  return data.system_numbers;
}
