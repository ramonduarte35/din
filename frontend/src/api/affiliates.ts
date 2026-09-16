import { api } from './client';

export interface AffiliateBanner {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  badge_text: string | null;
  cta_text: string;
  target_url: string;
  placement: 'DASHBOARD' | 'TRANSACTIONS' | 'BILLS' | 'GLOBAL';
  is_active: boolean;
  views_count: number;
  clicks_count: number;
  display_order: number;
  ctr_percent?: number;
  created_at: string;
  updated_at: string;
}

export interface AdminAffiliatesMetrics {
  total_banners: number;
  active_banners: number;
  total_views: number;
  total_clicks: number;
  overall_ctr: number;
}

export interface AdminAffiliatesResponse {
  banners: AffiliateBanner[];
  metrics: AdminAffiliatesMetrics;
}

export interface CreateAffiliateBannerPayload {
  title: string;
  description?: string | null;
  image_url?: string | null;
  badge_text?: string | null;
  cta_text?: string;
  target_url: string;
  placement?: 'DASHBOARD' | 'TRANSACTIONS' | 'BILLS' | 'GLOBAL';
  is_active?: boolean;
  display_order?: number;
}

export interface UpdateAffiliateBannerPayload extends Partial<CreateAffiliateBannerPayload> {}

/**
 * Busca banners ativos para o cliente final (retorna [] se usuário for PRO)
 */
export async function fetchActiveAffiliateBanners(placement?: string): Promise<AffiliateBanner[]> {
  const { data } = await api.get<{ banners: AffiliateBanner[] }>('/affiliates/active', {
    params: placement ? { placement } : undefined,
  });
  return data.banners || [];
}

/**
 * Registra clique no banner
 */
export async function recordAffiliateBannerClick(id: string): Promise<void> {
  try {
    await api.post(`/affiliates/${id}/click`);
  } catch (error) {
    console.warn('[Affiliates] Falha ao registrar clique:', error);
  }
}

/**
 * Admin: Lista todos os banners com métricas de conversão
 */
export async function fetchAdminAffiliateBanners(params?: {
  placement?: string;
  is_active?: string;
}): Promise<AdminAffiliatesResponse> {
  const { data } = await api.get<AdminAffiliatesResponse>('/admin/affiliates', { params });
  return data;
}

/**
 * Admin: Cria novo banner
 */
export async function createAdminAffiliateBanner(
  payload: CreateAffiliateBannerPayload
): Promise<{ message: string; banner: AffiliateBanner }> {
  const { data } = await api.post<{ message: string; banner: AffiliateBanner }>('/admin/affiliates', payload);
  return data;
}

/**
 * Admin: Atualiza banner existente
 */
export async function updateAdminAffiliateBanner(
  id: string,
  payload: UpdateAffiliateBannerPayload
): Promise<{ message: string; banner: AffiliateBanner }> {
  const { data } = await api.put<{ message: string; banner: AffiliateBanner }>(`/admin/affiliates/${id}`, payload);
  return data;
}

/**
 * Admin: Alterna status ativo/inativo
 */
export async function toggleAdminAffiliateBanner(
  id: string
): Promise<{ message: string; banner: AffiliateBanner }> {
  const { data } = await api.patch<{ message: string; banner: AffiliateBanner }>(`/admin/affiliates/${id}/toggle`);
  return data;
}

/**
 * Admin: Deleta banner
 */
export async function deleteAdminAffiliateBanner(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/admin/affiliates/${id}`);
  return data;
}
