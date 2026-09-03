import { api } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  avatar_url?: string | null;
  google_id?: string | null;
  has_password?: boolean;
  subscription_tier: 'FREE' | 'PRO';
  role?: 'USER' | 'ADMIN';
  theme?: 'dark' | 'rose' | 'light' | 'purple' | string;
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

export async function googleLoginRequest(idToken: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/google', { idToken });
  return data;
}

export async function getProfileRequest(): Promise<{ user: User }> {
  const { data } = await api.get<{ user: User }>('/users/me');
  return data;
}

export async function updateProfileRequest(payload: {
  name?: string;
  phone_number?: string | null;
  theme?: 'dark' | 'rose' | 'light' | 'purple' | string;
}): Promise<{ message: string; user: User }> {
  const { data } = await api.put<{ message: string; user: User }>('/users/profile', payload);
  return data;
}

export async function changePasswordRequest(payload: {
  current_password?: string;
  new_password: string;
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/users/change-password', payload);
  return data;
}

export async function getAuthConfigRequest(): Promise<{ googleClientId: string }> {
  const { data } = await api.get<{ googleClientId: string }>('/auth/config');
  return data;
}




