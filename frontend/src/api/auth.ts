import { api } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  subscription_tier: 'FREE' | 'PRO';
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export async function loginRequest(credentials: { email: string; password: string }): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials);
  return data;
}

export async function registerRequest(userData: {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', userData);
  return data;
}

export async function getProfileRequest(): Promise<{ user: User }> {
  const { data } = await api.get<{ user: User }>('/users/me');
  return data;
}

export async function updateProfileRequest(payload: {
  name?: string;
  phone_number?: string | null;
}): Promise<{ message: string; user: User }> {
  const { data } = await api.put<{ message: string; user: User }>('/users/profile', payload);
  return data;
}
