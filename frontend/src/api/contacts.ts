import { api } from './client';

export type ContactType = 'PF' | 'PJ';

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  type: ContactType;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  _count?: {
    receivables: number;
  };
}

export interface ListContactsParams {
  search?: string;
  type?: ContactType;
  page?: number;
  limit?: number;
}

export interface ListContactsResponse {
  contacts: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateContactData {
  name: string;
  type?: ContactType;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
}

export async function fetchContacts(params?: ListContactsParams): Promise<ListContactsResponse> {
  const { data } = await api.get('/contacts', { params });
  return data;
}

export async function fetchContactById(id: string): Promise<Contact> {
  const { data } = await api.get(`/contacts/${id}`);
  return data;
}

export async function createContact(contactData: CreateContactData): Promise<Contact> {
  const { data } = await api.post('/contacts', contactData);
  return data;
}

export async function updateContact(id: string, contactData: Partial<CreateContactData>): Promise<Contact> {
  const { data } = await api.put(`/contacts/${id}`, contactData);
  return data;
}

export async function deleteContact(id: string): Promise<void> {
  await api.delete(`/contacts/${id}`);
}
